"use client";

import { useEffect, useMemo, useState } from "react";
import { getBrowserSupabase } from "@/lib/supabase-browser";
import { useT } from "@/lib/i18n";

type ScoreboardRow = {
  suburb: string;
  municipality: string | null;
  outage_count_30d: number;
  downtime_seconds_30d: number;
  outage_count_90d: number;
  downtime_seconds_90d: number;
  currently_out: number;
};

type Window = "30d" | "90d";

function formatDowntime(seconds: number): string {
  if (seconds <= 0) return "—";
  const hours = seconds / 3600;
  if (hours < 24) return `${Math.round(hours)} h`;
  const days = hours / 24;
  if (days < 14) return `${Math.round(days * 10) / 10} days`;
  return `${Math.round(days)} days`;
}

export default function StatsScoreboard() {
  const { t } = useT();
  const [rows, setRows] = useState<ScoreboardRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [window, setWindow] = useState<Window>("30d");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const supabase = getBrowserSupabase();
      const { data } = await supabase
        .from("scoreboard_by_suburb")
        .select("*")
        .limit(500);
      if (!cancelled) {
        setRows((data || []) as ScoreboardRow[]);
        setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const sorted = useMemo(() => {
    const key = window === "30d" ? "downtime_seconds_30d" : "downtime_seconds_90d";
    return [...rows]
      .filter((r) => (window === "30d" ? r.outage_count_30d > 0 : r.outage_count_90d > 0))
      .sort((a, b) => (b[key] as number) - (a[key] as number))
      .slice(0, 100);
  }, [rows, window]);

  return (
    <div>
      <div className="flex gap-2 mb-4">
        <button
          type="button"
          onClick={() => setWindow("30d")}
          className={`px-3 py-1.5 text-sm rounded-md font-medium border ${
            window === "30d"
              ? "bg-ink text-white border-ink"
              : "bg-white text-ink border-slate-200 hover:border-slate-300"
          }`}
        >
          {t("stats.window_30d")}
        </button>
        <button
          type="button"
          onClick={() => setWindow("90d")}
          className={`px-3 py-1.5 text-sm rounded-md font-medium border ${
            window === "90d"
              ? "bg-ink text-white border-ink"
              : "bg-white text-ink border-slate-200 hover:border-slate-300"
          }`}
        >
          {t("stats.window_90d")}
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-6 h-6 border-2 border-slate-300 border-t-amanzi-500 rounded-full animate-spin" />
        </div>
      ) : sorted.length === 0 ? (
        <p className="text-center text-ink/60 py-12 px-4 text-sm">
          {t("stats.empty")}
        </p>
      ) : (
        <div className="overflow-x-auto border border-slate-200 rounded-lg">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-ink/70 text-xs uppercase tracking-wide">
              <tr>
                <th className="text-left px-3 py-2 font-medium">#</th>
                <th className="text-left px-3 py-2 font-medium">
                  {t("stats.col_suburb")}
                </th>
                <th className="text-left px-3 py-2 font-medium hidden sm:table-cell">
                  {t("stats.col_municipality")}
                </th>
                <th className="text-right px-3 py-2 font-medium">
                  {t("stats.col_outages")}
                </th>
                <th className="text-right px-3 py-2 font-medium">
                  {t("stats.col_downtime")}
                </th>
                <th className="text-right px-3 py-2 font-medium hidden md:table-cell">
                  {t("stats.col_currently_out")}
                </th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((r, i) => {
                const outages =
                  window === "30d" ? r.outage_count_30d : r.outage_count_90d;
                const downtime =
                  window === "30d"
                    ? r.downtime_seconds_30d
                    : r.downtime_seconds_90d;
                return (
                  <tr
                    key={`${r.suburb}-${r.municipality ?? ""}`}
                    className="border-t border-slate-100"
                  >
                    <td className="px-3 py-2 text-ink/50 font-mono">{i + 1}</td>
                    <td className="px-3 py-2 font-medium text-ink">
                      {r.suburb}
                    </td>
                    <td className="px-3 py-2 text-ink/70 hidden sm:table-cell">
                      {r.municipality ?? "—"}
                    </td>
                    <td className="px-3 py-2 text-right text-ink">{outages}</td>
                    <td className="px-3 py-2 text-right text-ink font-medium">
                      {formatDowntime(downtime)}
                    </td>
                    <td className="px-3 py-2 text-right hidden md:table-cell">
                      {r.currently_out > 0 ? (
                        <span className="text-alert-500 font-medium">
                          {r.currently_out}
                        </span>
                      ) : (
                        <span className="text-ink/30">0</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <p className="text-xs text-ink/50 mt-4 leading-relaxed">
        {t("stats.methodology_note")}
      </p>
    </div>
  );
}
