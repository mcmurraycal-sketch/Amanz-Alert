"use client";

import { useEffect, useRef, useState } from "react";
import maplibregl, { Map as MLMap, Marker, Popup } from "maplibre-gl";
import { getBrowserSupabase } from "@/lib/supabase-browser";
import { EASTERN_CAPE_CENTER, getOrCreateFingerprint } from "@/lib/geo";
import { buildWhatsAppShare } from "@/lib/share";
import { buildComplaintMailto } from "@/lib/complaint";
import {
  ReportWithCounts,
  SEVERITY_COLOR,
  SEVERITY_LABEL,
  CAUSE_LABEL,
  formatPrediction,
} from "@/lib/types";
import { useT } from "@/lib/i18n";
import LocationSearch from "./LocationSearch";

const MAP_STYLE = (key: string) =>
  `https://api.maptiler.com/maps/streets-v2/style.json?key=${key}`;

const FALLBACK_STYLE: maplibregl.StyleSpecification = {
  version: 8,
  sources: {
    osm: {
      type: "raster",
      tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],
      tileSize: 256,
      attribution: "&copy; OpenStreetMap contributors",
    },
  },
  layers: [{ id: "osm", type: "raster", source: "osm" }],
};

export default function OutageMap() {
  const { t } = useT();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<MLMap | null>(null);
  const markersRef = useRef<Map<string, Marker>>(new Map());
  const searchMarkerRef = useRef<Marker | null>(null);
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    const key = process.env.NEXT_PUBLIC_MAPTILER_KEY;

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: key ? MAP_STYLE(key) : FALLBACK_STYLE,
      center: [EASTERN_CAPE_CENTER.lng, EASTERN_CAPE_CENTER.lat],
      zoom: 7,
      attributionControl: { compact: true },
    });
    map.addControl(new maplibregl.NavigationControl({ showCompass: false }), "top-right");
    map.addControl(
      new maplibregl.GeolocateControl({
        positionOptions: { enableHighAccuracy: true },
        trackUserLocation: false,
      }),
      "top-right"
    );

    let usingFallback = !key;
    map.on("error", (e) => {
      const msg = e?.error?.message || String(e?.error || e);
      console.warn("[MapLibre]", msg);
      if (!usingFallback && /style|401|403|fetch/i.test(msg)) {
        usingFallback = true;
        console.warn("[MapLibre] MapTiler style failed, swapping to OSM raster fallback.");
        map.setStyle(FALLBACK_STYLE);
      }
    });

    const forceResize = () => {
      if (mapRef.current) mapRef.current.resize();
    };
    map.on("load", () => requestAnimationFrame(forceResize));
    const t1 = setTimeout(forceResize, 100);
    const t2 = setTimeout(forceResize, 500);

    const ro = new ResizeObserver(forceResize);
    ro.observe(containerRef.current);

    mapRef.current = map;

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      ro.disconnect();
      map.remove();
      mapRef.current = null;
      markersRef.current.clear();
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const supabase = getBrowserSupabase();

    const removeMarker = (id: string) => {
      const m = markersRef.current.get(id);
      if (m) {
        m.remove();
        markersRef.current.delete(id);
        setCount((c) => Math.max(0, c - 1));
      }
    };

    const addOrUpdate = (r: ReportWithCounts) => {
      if (markersRef.current.has(r.id)) return;
      const el = document.createElement("div");
      el.style.width = "18px";
      el.style.height = "18px";
      el.style.borderRadius = "50%";
      el.style.background = SEVERITY_COLOR[r.severity];
      el.style.border = "2px solid white";
      el.style.boxShadow = "0 2px 6px rgba(0,0,0,0.25)";

      const popup = new Popup({ offset: 14, closeButton: false }).setDOMContent(
        buildPopupContent(r, supabase)
      );
      const marker = new Marker({ element: el })
        .setLngLat([r.lng, r.lat])
        .setPopup(popup)
        .addTo(map);
      markersRef.current.set(r.id, marker);
    };

    let cancelled = false;
    (async () => {
      const { data } = await supabase
        .from("reports_with_counts")
        .select("*")
        .is("resolved_at", null)
        .order("created_at", { ascending: false })
        .limit(1000);
      if (cancelled || !data) return;
      setCount(data.length);
      data.forEach((r) => addOrUpdate(r as ReportWithCounts));
    })();

    const channel = supabase
      .channel("reports-realtime")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "reports" },
        async (payload) => {
          const id = (payload.new as { id: string }).id;
          const { data } = await supabase
            .from("reports_with_counts")
            .select("*")
            .eq("id", id)
            .maybeSingle();
          if (data) {
            addOrUpdate(data as ReportWithCounts);
            setCount((c) => c + 1);
          }
        }
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "reports" },
        (payload) => {
          const next = payload.new as { id: string; resolved_at: string | null };
          if (next.resolved_at) removeMarker(next.id);
        }
      )
      .subscribe();

    return () => {
      cancelled = true;
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <div className="relative w-full">
      <div
        ref={containerRef}
        className="w-full bg-slate-200"
        style={{ height: "calc(100dvh - 3.5rem)" }}
      />
      <div className="absolute top-3 left-3 right-3 sm:right-auto sm:w-80 z-10 flex flex-col gap-2">
        <LocationSearch
          placeholder={t("search.placeholder_map")}
          variant="floating"
          onSelect={(hit) => {
            const map = mapRef.current;
            if (!map) return;
            searchMarkerRef.current?.remove();
            searchMarkerRef.current = new maplibregl.Marker({ color: "#1F7396" })
              .setLngLat([hit.coords.lng, hit.coords.lat])
              .setPopup(
                new maplibregl.Popup({ offset: 14, closeButton: false }).setText(
                  hit.displayName
                )
              )
              .addTo(map);
            map.flyTo({
              center: [hit.coords.lng, hit.coords.lat],
              zoom: 15,
              duration: 1500,
            });
          }}
        />
        <div className="bg-white/95 backdrop-blur rounded-lg px-3 py-2 shadow text-xs font-medium w-fit">
          <span className="text-alert-500">●</span> {count} active report
          {count === 1 ? "" : "s"}
        </div>
      </div>
    </div>
  );
}

function escapeHTML(s: string) {
  return s.replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c] as string)
  );
}

type SupabaseClient = ReturnType<typeof getBrowserSupabase>;

function buildPopupContent(r: ReportWithCounts, supabase: SupabaseClient): HTMLElement {
  const root = document.createElement("div");
  root.style.minWidth = "200px";
  root.style.fontFamily = "inherit";

  const shareUrl = buildWhatsAppShare({
    suburb: r.suburb,
    municipality: r.municipality,
    severity: r.severity,
  });

  const causeLine =
    r.cause && r.cause !== "unknown"
      ? `<div style="margin-top:6px;font-size:12px;color:#475569"><strong>Cause:</strong> ${escapeHTML(
          CAUSE_LABEL[r.cause]
        )}</div>`
      : "";

  const prediction = formatPrediction(r.predicted_resolution_seconds);
  const predictionLine =
    prediction && r.prediction_sample_size > 0
      ? `<div style="margin-top:6px;font-size:12px;color:#155875"><strong>Typical resolution:</strong> ${prediction} <span style="color:#94a3b8">(${r.prediction_sample_size} prior)</span></div>`
      : "";

  const countsLine =
    r.still_out_count > 0 || r.complaint_count > 0
      ? `<div style="margin-top:6px;font-size:11px;color:#475569">${
          r.still_out_count > 0
            ? `<strong style="color:#B83820">${r.still_out_count}</strong> confirmed still out`
            : ""
        }${r.still_out_count > 0 && r.complaint_count > 0 ? " &middot; " : ""}${
          r.complaint_count > 0
            ? `<strong>${r.complaint_count}</strong> complaint${
                r.complaint_count === 1 ? "" : "s"
              } filed`
            : ""
        }</div>`
      : "";

  root.innerHTML = `
    <strong>${SEVERITY_LABEL[r.severity]}</strong><br/>
    <span style="color:#475569;font-size:12px">${
      r.suburb ? escapeHTML(r.suburb) + ", " : ""
    }${r.municipality ? escapeHTML(r.municipality) : ""}</span><br/>
    <span style="color:#94a3b8;font-size:11px">${new Date(r.created_at).toLocaleString()}</span>
    ${causeLine}
    ${predictionLine}
    ${countsLine}
    ${r.note ? `<p style="margin-top:6px;font-size:13px">${escapeHTML(r.note)}</p>` : ""}
  `;

  const btnRow = document.createElement("div");
  btnRow.style.display = "flex";
  btnRow.style.gap = "6px";
  btnRow.style.marginTop = "10px";

  const makeBtn = (
    label: string,
    kind: "still_out" | "resolved",
    bg: string,
    fg: string
  ) => {
    const btn = document.createElement("button");
    btn.textContent = label;
    btn.style.flex = "1";
    btn.style.padding = "6px 8px";
    btn.style.borderRadius = "6px";
    btn.style.border = "1px solid #e2e8f0";
    btn.style.background = bg;
    btn.style.color = fg;
    btn.style.fontSize = "12px";
    btn.style.fontWeight = "500";
    btn.style.cursor = "pointer";
    btn.onclick = async () => {
      btn.disabled = true;
      btn.style.opacity = "0.6";
      const { error } = await supabase.from("report_confirmations").insert({
        report_id: r.id,
        kind,
        reporter_fingerprint: getOrCreateFingerprint(),
      });
      btn.textContent = error ? "Already counted" : "✓ Counted";
    };
    return btn;
  };

  btnRow.appendChild(makeBtn("Still out", "still_out", "#FEF3F2", "#B83820"));
  btnRow.appendChild(makeBtn("Water's back", "resolved", "#ECFDF5", "#15803D"));
  root.appendChild(btnRow);

  const share = document.createElement("a");
  share.href = shareUrl;
  share.target = "_blank";
  share.rel = "noopener noreferrer";
  share.style.display = "block";
  share.style.marginTop = "8px";
  share.style.background = "#25D366";
  share.style.color = "white";
  share.style.padding = "6px 10px";
  share.style.borderRadius = "6px";
  share.style.fontSize = "12px";
  share.style.textDecoration = "none";
  share.style.fontWeight = "600";
  share.style.textAlign = "center";
  share.textContent = "📲 Share on WhatsApp";
  root.appendChild(share);

  const complaint = document.createElement("a");
  complaint.href = buildComplaintMailto(r);
  complaint.style.display = "block";
  complaint.style.marginTop = "6px";
  complaint.style.background = "#0B1F3A";
  complaint.style.color = "white";
  complaint.style.padding = "6px 10px";
  complaint.style.borderRadius = "6px";
  complaint.style.fontSize = "12px";
  complaint.style.textDecoration = "none";
  complaint.style.fontWeight = "600";
  complaint.style.textAlign = "center";
  complaint.textContent = "📨 Send official complaint";
  complaint.onclick = () => {
    supabase
      .from("complaints_filed")
      .insert({
        report_id: r.id,
        reporter_fingerprint: getOrCreateFingerprint(),
      })
      .then(() => {});
  };
  root.appendChild(complaint);

  return root;
}
