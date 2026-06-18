// Amanz' Alert — ingest Johannesburg Water daily interruption notices.
//
// JHB Water publishes its daily notices as scanned JPG images (no structured
// HTML), so a plain scraper can't read them. This function fetches the notices
// page, finds today's notice image(s) by the predictable filename pattern, then
// uses Claude vision to OCR each image into structured rows, which it upserts
// into `official_notices`.
//
// Scheduled daily via pg_cron (see migration 0011). Requires the secret
// ANTHROPIC_API_KEY to be set:  supabase secrets set ANTHROPIC_API_KEY=sk-ant-...

import Anthropic from "npm:@anthropic-ai/sdk@0.69.0";
import { createClient } from "npm:@supabase/supabase-js@2";

const NOTICES_PAGE = "https://www.johannesburgwater.co.za/daily-water-notices/";
const SOURCE = "jhb_water";
const MUNICIPALITY = "City of Johannesburg";
const PROVINCE = "Gauteng";

// Default to Opus for extraction quality. For a daily OCR job you can switch
// this to "claude-haiku-4-5" to cut cost ~5x — change one line.
const MODEL = "claude-opus-4-8";

const EXTRACT_SCHEMA = {
  type: "object",
  additionalProperties: false,
  properties: {
    notices: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          suburb: { type: "string" },
          area: { type: "string" },
          notice_type: {
            type: "string",
            enum: ["planned", "unplanned", "recovery", "unknown"],
          },
          starts_text: { type: "string" },
          ends_text: { type: "string" },
          description: { type: "string" },
        },
        required: [
          "suburb",
          "area",
          "notice_type",
          "starts_text",
          "ends_text",
          "description",
        ],
      },
    },
  },
  required: ["notices"],
};

const EXTRACT_PROMPT =
  "This is a daily water-interruption notice published by Johannesburg Water. " +
  "Read every affected area listed and return one entry per suburb/locality. " +
  "Use the printed start/end times verbatim in starts_text/ends_text. Classify " +
  "notice_type as 'planned' for scheduled maintenance, 'unplanned' for faults/" +
  "bursts, 'recovery' for systems recovering/refilling, else 'unknown'. Put any " +
  "system or region grouping in 'area' (empty string if none). If the image is " +
  "not a readable water notice, return an empty notices array.";

type ExtractedNotice = {
  suburb: string;
  area: string;
  notice_type: string;
  starts_text: string;
  ends_text: string;
  description: string;
};

// Pull notice image URLs + their date/period from the page HTML. JHB names them
// like ".../Daily-Water-Notice-Monday-15-June-2026-Afternoon_page-0001...jpg".
function findNoticeImages(html: string): Array<{
  url: string;
  noticeDate: string | null;
  period: string | null;
}> {
  const seen = new Set<string>();
  const out: Array<{ url: string; noticeDate: string | null; period: string | null }> = [];
  const re = /https?:\/\/[^"'\s)]+?Daily-Water-Notice[^"'\s)]+?\.(?:jpg|jpeg|png)/gi;
  for (const m of html.matchAll(re)) {
    let url = m[0];
    // Collapse WordPress "-scaled"/"-1024x768" variants to one canonical URL
    // so morning/afternoon pages don't double-process the same notice.
    const base = url.replace(/-\d+x\d+(?=\.(?:jpg|jpeg|png)$)/i, "");
    if (seen.has(base)) continue;
    seen.add(base);
    out.push({
      url,
      noticeDate: parseDateFromFilename(url),
      period: /afternoon/i.test(url) ? "afternoon" : /morning/i.test(url) ? "morning" : null,
    });
  }
  return out;
}

const MONTHS: Record<string, string> = {
  january: "01", february: "02", march: "03", april: "04", may: "05",
  june: "06", july: "07", august: "08", september: "09", october: "10",
  november: "11", december: "12",
};

function parseDateFromFilename(url: string): string | null {
  const m = url.match(/(\d{1,2})-([A-Za-z]+)-(\d{4})/);
  if (!m) return null;
  const day = m[1].padStart(2, "0");
  const month = MONTHS[m[2].toLowerCase()];
  if (!month) return null;
  return `${m[3]}-${month}-${day}`;
}

function isToday(dateStr: string | null): boolean {
  if (!dateStr) return false;
  const today = new Date().toISOString().slice(0, 10);
  return dateStr === today;
}

Deno.serve(async (req) => {
  const anthropicKey = Deno.env.get("ANTHROPIC_API_KEY");
  if (!anthropicKey) {
    return json({ error: "ANTHROPIC_API_KEY not set" }, 500);
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );
  const anthropic = new Anthropic({ apiKey: anthropicKey });

  // Optional ?all=1 to (re)process every notice on the page, not just today's.
  const all = new URL(req.url).searchParams.get("all") === "1";

  let html: string;
  try {
    const res = await fetch(NOTICES_PAGE, {
      headers: { "User-Agent": "AmanziAlert/1.0 (+https://amanz-alert.vercel.app)" },
    });
    if (!res.ok) return json({ error: `fetch page ${res.status}` }, 502);
    html = await res.text();
  } catch (e) {
    return json({ error: `fetch page failed: ${String(e)}` }, 502);
  }

  const images = findNoticeImages(html).filter((i) => all || isToday(i.noticeDate));
  const summary: Array<Record<string, unknown>> = [];

  for (const img of images) {
    // Skip images already processed successfully.
    const { data: prior } = await supabase
      .from("official_notice_runs")
      .select("image_url, status")
      .eq("image_url", img.url)
      .maybeSingle();
    if (prior?.status === "ok") {
      summary.push({ image: img.url, skipped: "already processed" });
      continue;
    }

    try {
      const msg = await anthropic.messages.create({
        model: MODEL,
        max_tokens: 4096,
        output_config: { format: { type: "json_schema", schema: EXTRACT_SCHEMA } },
        messages: [
          {
            role: "user",
            content: [
              { type: "image", source: { type: "url", url: img.url } },
              { type: "text", text: EXTRACT_PROMPT },
            ],
          },
        ],
      });

      const text = msg.content.find((b) => b.type === "text");
      const parsed = JSON.parse((text as { text: string }).text) as {
        notices: ExtractedNotice[];
      };
      const notices = parsed.notices ?? [];

      if (notices.length > 0) {
        const rows = notices.map((n) => ({
          source: SOURCE,
          municipality: MUNICIPALITY,
          province: PROVINCE,
          notice_date: img.noticeDate ?? new Date().toISOString().slice(0, 10),
          period: img.period,
          notice_type: n.notice_type || "unknown",
          area: n.area || null,
          suburb: n.suburb || null,
          starts_text: n.starts_text || null,
          ends_text: n.ends_text || null,
          description: n.description || null,
          source_url: NOTICES_PAGE,
          image_url: img.url,
          raw_extract: n,
        }));
        await supabase
          .from("official_notices")
          .upsert(rows, { onConflict: "image_url,suburb", ignoreDuplicates: true });
      }

      await supabase.from("official_notice_runs").upsert({
        image_url: img.url,
        source: SOURCE,
        notice_date: img.noticeDate,
        period: img.period,
        rows_extracted: notices.length,
        status: "ok",
        error: null,
        processed_at: new Date().toISOString(),
      });
      summary.push({ image: img.url, extracted: notices.length });
    } catch (e) {
      await supabase.from("official_notice_runs").upsert({
        image_url: img.url,
        source: SOURCE,
        notice_date: img.noticeDate,
        period: img.period,
        rows_extracted: 0,
        status: "error",
        error: String(e),
        processed_at: new Date().toISOString(),
      });
      summary.push({ image: img.url, error: String(e) });
    }
  }

  return json({ processed: summary.length, results: summary });
});

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}
