"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { getBrowserSupabase } from "@/lib/supabase-browser";
import { getOrCreateFingerprint } from "@/lib/geo";
import { useT } from "@/lib/i18n";
import {
  SEVERITY_COLOR,
  SEVERITY_LABEL,
  CAUSE_LABEL,
  type ReportWithCounts,
} from "@/lib/types";
import { buildWhatsAppShare } from "@/lib/share";
import ComplaintButton from "./ComplaintButton";
import {
  loadAuthorities,
  routeComplaint,
  type Authority,
} from "@/lib/authorities";

type Tab = "active" | "resolved";

function timeAgo(dateStr: string, t: (k: string) => string): string {
  const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (seconds < 60) return `<1 min ${t("feed.ago")}`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} min ${t("feed.ago")}`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ${t("feed.ago")}`;
  const days = Math.floor(hours / 24);
  return `${days}d ${t("feed.ago")}`;
}

export default function MyReports() {
  const { t } = useT();
  const [reports, setReports] = useState<ReportWithCounts[]>([]);
  const [authorities, setAuthorities] = useState<Authority[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>("active");

  useEffect(() => {
    let cancelled = false;
    const supabase = getBrowserSupabase();
    const fp = getOrCreateFingerprint();

    (async () => {
      const { data: idData } = await supabase
        .from("reports")
        .select("id")
        .eq("reporter_fingerprint", fp)
        .order("created_at", { ascending: false })
        .limit(200);

      const ids = (idData || []).map((r) => (r as { id: string }).id);
      if (ids.length === 0) {
        if (!cancelled) {
          setReports([]);
          setLoading(false);
        }
        return;
      }

      const { data: full } = await supabase
        .from("reports_with_counts")
        .select("*")
        .in("id", ids)
        .order("created_at", { ascending: false });

      if (!cancelled) {
        setReports((full || []) as ReportWithCounts[]);
        setLoading(false);
      }
    })();

    loadAuthorities(supabase).then((a) => {
      if (!cancelled) setAuthorities(a);
    });

    return () => {
      cancelled = true;
    };
  }, []);

  const { active, resolved } = useMemo(() => {
    const a: ReportWithCounts[] = [];
    const r: ReportWithCounts[] = [];
    for (const rep of reports) {
      if (rep.resolved_at) r.push(rep);
      else a.push(rep);
    }
    return { active: a, resolved: r };
  }, [reports]);

  const visible = tab === "active" ? active : resolved;

  return (
    <div>
      <div className="flex gap-2 mb-4 px-4">
        <button
          type="button"
          onClick={() => setTab("active")}
          className={`px-3 py-1.5 text-sm rounded-md font-medium border ${
            tab === "active"
              ? "bg-ink text-white border-ink"
              : "bg-white text-ink border-slate-200 hover:border-slate-300"
          }`}
        >
          {t("mine.tab_active")} ({active.length})
        </button>
        <button
          type="button"
          onClick={() => setTab("resolved")}
          className={`px-3 py-1.5 text-sm rounded-md font-medium border ${
            tab === "resolved"
              ? "bg-ink text-white border-ink"
              : "bg-white text-ink border-slate-200 hover:border-slate-300"
          }`}
        >
          {t("mine.tab_resolved")} ({resolved.length})
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="w-6 h-6 border-2 border-slate-300 border-t-amanzi-500 rounded-full animate-spin" />
        </div>
      ) : visible.length === 0 ? (
        <p className="text-center text-ink/60 py-12 px-4 text-sm max-w-md mx-auto">
          {tab === "active" ? t("mine.empty_active") : t("mine.empty_resolved")}
        </p>
      ) : (
        <div className="divide-y divide-slate-100">
          {visible.map((r) => (
            <MyReportCard
              key={r.id}
              report={r}
              t={t}
              authorities={authorities}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function MyReportCard({
  report: r,
  t,
  authorities,
}: {
  report: ReportWithCounts;
  t: (k: string) => string;
  authorities: Authority[];
}) {
  const location =
    [r.suburb, r.municipality].filter(Boolean).join(", ") || "Unknown location";
  const shareUrl = buildWhatsAppShare({
    suburb: r.suburb,
    municipality: r.municipality,
    severity: r.severity,
  });
  const routing = routeComplaint(authorities, r.municipality);

  const [stillOutClicked, setStillOutClicked] = useState(false);
  const [resolvedClicked, setResolvedClicked] = useState(false);

  const submitConfirmation = async (kind: "still_out" | "resolved") => {
    if (kind === "still_out") setStillOutClicked(true);
    else setResolvedClicked(true);
    await getBrowserSupabase()
      .from("report_confirmations")
      .insert({
        report_id: r.id,
        kind,
        reporter_fingerprint: getOrCreateFingerprint(),
      });
  };

  const onComplaintSend = () => {
    void getBrowserSupabase()
      .from("complaints_filed")
      .insert({
        report_id: r.id,
        reporter_fingerprint: getOrCreateFingerprint(),
      });
  };

  const isResolved = !!r.resolved_at;

  return (
    <div className={`px-4 py-4 ${isResolved ? "opacity-70" : ""}`}>
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 mt-1">
          <div
            className="w-3 h-3 rounded-full ring-2 ring-white"
            style={{
              background: isResolved ? "#94a3b8" : SEVERITY_COLOR[r.severity],
            }}
          />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="font-semibold text-sm">
                {SEVERITY_LABEL[r.severity]}
              </p>
              <p className="text-sm text-ink/70 truncate">{location}</p>
            </div>
            <div className="text-right">
              <span className="text-xs text-ink/50 whitespace-nowrap">
                {timeAgo(r.created_at, t)}
              </span>
              {isResolved && (
                <p className="text-[10px] font-medium text-green-600 mt-0.5">
                  ✓ {t("mine.resolved_at")}
                </p>
              )}
            </div>
          </div>

          {r.cause && r.cause !== "unknown" && (
            <p className="text-xs text-ink/60 mt-1">{CAUSE_LABEL[r.cause]}</p>
          )}

          {r.note && (
            <p className="text-sm text-ink/80 mt-1.5">{r.note}</p>
          )}

          {(r.still_out_count > 0 || r.complaint_count > 0) && (
            <div className="flex items-center gap-3 mt-2 text-xs">
              {r.still_out_count > 0 && (
                <span className="text-alert-500 font-medium">
                  {r.still_out_count} {t("feed.confirmed_by")}
                </span>
              )}
              {r.complaint_count > 0 && (
                <span className="text-ink/70 font-medium">
                  {r.complaint_count} complaint{r.complaint_count === 1 ? "" : "s"} filed
                </span>
              )}
            </div>
          )}

          {!isResolved && (
            <div className="flex gap-2 mt-3">
              <button
                type="button"
                onClick={() => submitConfirmation("still_out")}
                disabled={stillOutClicked}
                className={`flex-1 py-2 px-3 text-xs font-medium rounded-md border transition ${
                  stillOutClicked
                    ? "bg-slate-50 text-ink/40 border-slate-200"
                    : "bg-red-50 text-alert-600 border-red-100 hover:bg-red-100"
                }`}
              >
                {stillOutClicked ? `✓ ${t("mine.counted")}` : t("mine.still_out")}
              </button>
              <button
                type="button"
                onClick={() => submitConfirmation("resolved")}
                disabled={resolvedClicked}
                className={`flex-1 py-2 px-3 text-xs font-medium rounded-md border transition ${
                  resolvedClicked
                    ? "bg-slate-50 text-ink/40 border-slate-200"
                    : "bg-green-50 text-green-700 border-green-100 hover:bg-green-100"
                }`}
              >
                {resolvedClicked ? `✓ ${t("mine.counted")}` : t("mine.water_back")}
              </button>
            </div>
          )}

          <div className="flex items-center gap-3 mt-3 text-xs">
            <Link
              href="/"
              className="text-amanzi-600 font-medium hover:underline"
            >
              {t("nav.map")} →
            </Link>
            <a
              href={shareUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-green-600 font-medium hover:underline"
            >
              📲 WhatsApp
            </a>
            {!isResolved && (
              <ComplaintButton
                report={r}
                routing={routing}
                onSend={onComplaintSend}
                variant="compact"
                className="ml-auto"
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
