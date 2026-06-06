"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { getBrowserSupabase } from "@/lib/supabase-browser";
import { useT } from "@/lib/i18n";
import { SEVERITY_COLOR, SEVERITY_LABEL, CAUSE_LABEL, type Report } from "@/lib/types";
import { buildWhatsAppShare } from "@/lib/share";
import { haversineKm, type Coords } from "@/lib/geo";
import { reverseGeocode, formatLocation } from "@/lib/geocode";
import LocationSearch from "./LocationSearch";
import LocationPicker from "./LocationPicker";

const FILTER_RADIUS_KM = 5;

type ReportWithCounts = Report & {
  still_out_count: number;
  resolved_count: number;
};

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

export default function OutageFeed() {
  const { t } = useT();
  const [reports, setReports] = useState<ReportWithCounts[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterCenter, setFilterCenter] = useState<Coords | null>(null);
  const [filterLabel, setFilterLabel] = useState<string | null>(null);

  const visibleReports = useMemo(() => {
    if (!filterCenter) return reports;
    return reports.filter(
      (r) =>
        haversineKm({ lat: r.lat, lng: r.lng }, filterCenter) <= FILTER_RADIUS_KM
    );
  }, [reports, filterCenter]);

  // Reverse-geocode the filter centre so the "Within 5km of …" label updates
  // as the user drags the pin.
  useEffect(() => {
    if (!filterCenter) return;
    let cancelled = false;
    reverseGeocode(filterCenter.lat, filterCenter.lng).then((g) => {
      const lbl = formatLocation(g);
      if (!cancelled && lbl) setFilterLabel(lbl);
    });
    return () => {
      cancelled = true;
    };
  }, [filterCenter]);

  const clearFilter = () => {
    setFilterCenter(null);
    setFilterLabel(null);
  };

  useEffect(() => {
    const supabase = getBrowserSupabase();
    let cancelled = false;

    (async () => {
      const { data } = await supabase
        .from("reports_with_counts")
        .select("*")
        .is("resolved_at", null)
        .order("created_at", { ascending: false })
        .limit(200);
      if (!cancelled && data) {
        setReports(data as ReportWithCounts[]);
      }
      setLoading(false);
    })();

    const channel = supabase
      .channel("feed-realtime")
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
            setReports((prev) => [data as ReportWithCounts, ...prev]);
          }
        }
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "reports" },
        (payload) => {
          const next = payload.new as { id: string; resolved_at: string | null };
          if (next.resolved_at) {
            setReports((prev) => prev.filter((r) => r.id !== next.id));
          }
        }
      )
      .subscribe();

    return () => {
      cancelled = true;
      supabase.removeChannel(channel);
    };
  }, []);

  const searchBar = (
    <div className="px-4 pb-3 flex flex-col gap-2">
      <p className="text-xs text-ink/60">{t("feed.step1_hint")}</p>
      <LocationSearch
        placeholder={t("search.placeholder_feed")}
        onSelect={(hit) => {
          setFilterCenter(hit.coords);
          setFilterLabel(hit.displayName);
        }}
      />

      {filterCenter && (
        <>
          <p className="text-xs text-ink/60 mt-1">{t("feed.step2_hint")}</p>
          <LocationPicker
            initial={filterCenter}
            onChange={setFilterCenter}
            height={220}
          />
          <div className="flex items-center gap-2 text-xs mt-1">
            <span className="text-ink/60 truncate">
              <span className="font-medium text-ink">{t("feed.near_prefix")}</span>{" "}
              {filterLabel ?? "…"}
            </span>
            <button
              type="button"
              onClick={clearFilter}
              className="text-amanzi-600 underline whitespace-nowrap ml-auto"
            >
              {t("feed.clear_filter")}
            </button>
          </div>
        </>
      )}
    </div>
  );

  if (loading) {
    return (
      <>
        {searchBar}
        <div className="flex items-center justify-center py-20">
          <div className="w-6 h-6 border-2 border-slate-300 border-t-amanzi-500 rounded-full animate-spin" />
        </div>
      </>
    );
  }

  if (visibleReports.length === 0) {
    const msg = filterCenter ? t("feed.no_nearby") : t("feed.empty");
    return (
      <>
        {searchBar}
        <div className="text-center py-20 px-4">
          <div className="w-16 h-16 rounded-full bg-green-100 mx-auto grid place-items-center text-3xl mb-4">
            ✓
          </div>
          <p className="text-ink/60">{msg}</p>
        </div>
      </>
    );
  }

  return (
    <>
      {searchBar}
      <div className="divide-y divide-slate-100">
        {visibleReports.map((r) => (
          <FeedCard key={r.id} report={r} t={t} />
        ))}
      </div>
    </>
  );
}

function FeedCard({ report: r, t }: { report: ReportWithCounts; t: (k: string) => string }) {
  const location = [r.suburb, r.municipality].filter(Boolean).join(", ") || "Unknown location";
  const shareUrl = buildWhatsAppShare({
    suburb: r.suburb,
    municipality: r.municipality,
    severity: r.severity,
  });

  return (
    <div className="px-4 py-4 flex gap-3">
      <div className="flex-shrink-0 mt-0.5">
        <div
          className="w-3 h-3 rounded-full ring-2 ring-white"
          style={{ background: SEVERITY_COLOR[r.severity] }}
        />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="font-semibold text-sm">{SEVERITY_LABEL[r.severity]}</p>
            <p className="text-sm text-ink/70 truncate">{location}</p>
          </div>
          <span className="text-xs text-ink/50 whitespace-nowrap flex-shrink-0">
            {timeAgo(r.created_at, t)}
          </span>
        </div>

        {r.cause && r.cause !== "unknown" && (
          <p className="text-xs text-ink/60 mt-1">
            {CAUSE_LABEL[r.cause]}
          </p>
        )}

        {r.note && (
          <p className="text-sm text-ink/80 mt-1.5 line-clamp-2">{r.note}</p>
        )}

        <div className="flex items-center gap-3 mt-2">
          {r.still_out_count > 0 && (
            <span className="text-xs text-alert-500 font-medium">
              {r.still_out_count} {t("feed.confirmed_by")}
            </span>
          )}
          <Link
            href="/"
            className="text-xs text-amanzi-600 font-medium hover:underline"
          >
            {t("nav.map")} →
          </Link>
          <a
            href={shareUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-green-600 font-medium hover:underline ml-auto"
          >
            📲 WhatsApp
          </a>
        </div>
      </div>
    </div>
  );
}
