"use client";

import { useEffect, useMemo, useState } from "react";
import { getBrowserSupabase } from "@/lib/supabase-browser";
import { useT } from "@/lib/i18n";

type SuburbRow = {
  suburb: string;
  municipality: string | null;
  province: string | null;
  outage_count_30d: number;
  downtime_seconds_30d: number;
  outage_count_90d: number;
  downtime_seconds_90d: number;
  currently_out: number;
};

type ProvinceRow = {
  province: string;
  suburb_count: number;
  municipality_count: number;
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
  const [suburbRows, setSuburbRows] = useState<SuburbRow[]>([]);
  const [provinceRows, setProvinceRows] = useState<ProvinceRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [window, setWindow] = useState<Window>("30d");
  const [selectedProvince, setSelectedProvince] = useState<string | null>(null);
  const [selectedMunicipality, setSelectedMunicipality] = useState<string | null>(
    null
  );

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const supabase = getBrowserSupabase();
      const [sub, prov] = await Promise.all([
        supabase.from("scoreboard_by_suburb").select("*").limit(1000),
        supabase.from("scoreboard_by_province").select("*").limit(20),
      ]);
      if (!cancelled) {
        setSuburbRows((sub.data || []) as SuburbRow[]);
        setProvinceRows((prov.data || []) as ProvinceRow[]);
        setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const sortedProvinces = useMemo(() => {
    const key = window === "30d" ? "downtime_seconds_30d" : "downtime_seconds_90d";
    return [...provinceRows]
      .filter((r) =>
        window === "30d" ? r.outage_count_30d > 0 : r.outage_count_90d > 0
      )
      .sort((a, b) => (b[key] as number) - (a[key] as number));
  }, [provinceRows, window]);

  const visibleSuburbs = useMemo(() => {
    const key = window === "30d" ? "downtime_seconds_30d" : "downtime_seconds_90d";
    return suburbRows
      .filter((r) =>
        window === "30d" ? r.outage_count_30d > 0 : r.outage_count_90d > 0
      )
      .filter((r) =>
        selectedProvince ? (r.province ?? "Unknown") === selectedProvince : true
      )
      .filter((r) =>
        selectedMunicipality ? r.municipality === selectedMunicipality : true
      )
      .sort((a, b) => (b[key] as number) - (a[key] as number))
      .slice(0, 150);
  }, [suburbRows, window, selectedProvince, selectedMunicipality]);

  const municipalitiesInProvince = useMemo(() => {
    if (!selectedProvince) return [] as string[];
    return Array.from(
      new Set(
        suburbRows
          .filter((r) => (r.province ?? "Unknown") === selectedProvince)
          .map((r) => r.municipality)
          .filter((m): m is string => !!m)
      )
    ).sort();
  }, [suburbRows, selectedProvince]);

  const hasFilters = !!selectedProvince || !!selectedMunicipality;

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-4">
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
      ) : sortedProvinces.length === 0 && visibleSuburbs.length === 0 ? (
        <p className="text-center text-ink/60 py-12 px-4 text-sm">
          {t("stats.empty")}
        </p>
      ) : (
        <>
          {!selectedProvince && sortedProvinces.length > 0 && (
            <div className="mb-6">
              <h2 className="text-sm font-semibold text-ink/70 uppercase tracking-wide mb-2">
                {t("stats.filter_province")}
              </h2>
              <div className="overflow-x-auto border border-slate-200 rounded-lg">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 text-ink/70 text-xs uppercase tracking-wide">
                    <tr>
                      <th className="text-left px-3 py-2 font-medium">#</th>
                      <th className="text-left px-3 py-2 font-medium">
                        {t("stats.col_province")}
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
                    {sortedProvinces.map((r, i) => {
                      const outages =
                        window === "30d" ? r.outage_count_30d : r.outage_count_90d;
                      const downtime =
                        window === "30d"
                          ? r.downtime_seconds_30d
                          : r.downtime_seconds_90d;
                      return (
                        <tr
                          key={r.province}
                          className="border-t border-slate-100 cursor-pointer hover:bg-amanzi-50"
                          onClick={() => setSelectedProvince(r.province)}
                        >
                          <td className="px-3 py-2 text-ink/50 font-mono">
                            {i + 1}
                          </td>
                          <td className="px-3 py-2 font-medium text-ink underline decoration-dotted">
                            {r.province}
                          </td>
                          <td className="px-3 py-2 text-right text-ink">
                            {outages}
                          </td>
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
            </div>
          )}

          {(selectedProvince || hasFilters) && (
            <div className="mb-3 flex flex-wrap items-center gap-2 text-xs">
              <span className="text-ink/60">{t("stats.filter_province")}:</span>
              <select
                value={selectedProvince ?? ""}
                onChange={(e) => {
                  const v = e.target.value || null;
                  setSelectedProvince(v);
                  setSelectedMunicipality(null);
                }}
                className="border border-slate-200 rounded px-2 py-1 text-xs bg-white"
              >
                <option value="">{t("stats.view_all_provinces")}</option>
                {sortedProvinces.map((p) => (
                  <option key={p.province} value={p.province}>
                    {p.province}
                  </option>
                ))}
              </select>

              {selectedProvince && municipalitiesInProvince.length > 0 && (
                <>
                  <span className="text-ink/60 ml-2">
                    {t("stats.filter_municipality")}:
                  </span>
                  <select
                    value={selectedMunicipality ?? ""}
                    onChange={(e) =>
                      setSelectedMunicipality(e.target.value || null)
                    }
                    className="border border-slate-200 rounded px-2 py-1 text-xs bg-white"
                  >
                    <option value="">—</option>
                    {municipalitiesInProvince.map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </select>
                </>
              )}

              {hasFilters && (
                <button
                  type="button"
                  onClick={() => {
                    setSelectedProvince(null);
                    setSelectedMunicipality(null);
                  }}
                  className="text-amanzi-600 underline ml-2"
                >
                  {t("stats.clear_filters")}
                </button>
              )}
            </div>
          )}

          <h2 className="text-sm font-semibold text-ink/70 uppercase tracking-wide mb-2">
            {t("stats.col_suburb")}
            {selectedProvince ? ` · ${selectedProvince}` : ""}
            {selectedMunicipality ? ` · ${selectedMunicipality}` : ""}
          </h2>

          {visibleSuburbs.length === 0 ? (
            <p className="text-center text-ink/60 py-8 text-sm">
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
                    <th className="text-left px-3 py-2 font-medium hidden md:table-cell">
                      {t("stats.col_province")}
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
                  {visibleSuburbs.map((r, i) => {
                    const outages =
                      window === "30d" ? r.outage_count_30d : r.outage_count_90d;
                    const downtime =
                      window === "30d"
                        ? r.downtime_seconds_30d
                        : r.downtime_seconds_90d;
                    return (
                      <tr
                        key={`${r.suburb}-${r.municipality ?? ""}-${r.province ?? ""}`}
                        className="border-t border-slate-100"
                      >
                        <td className="px-3 py-2 text-ink/50 font-mono">{i + 1}</td>
                        <td className="px-3 py-2 font-medium text-ink">{r.suburb}</td>
                        <td className="px-3 py-2 text-ink/70 hidden sm:table-cell">
                          {r.municipality ?? "—"}
                        </td>
                        <td className="px-3 py-2 text-ink/70 hidden md:table-cell">
                          {r.province ?? "—"}
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
        </>
      )}

      <p className="text-xs text-ink/50 mt-4 leading-relaxed">
        {t("stats.methodology_note")}
      </p>
    </div>
  );
}
