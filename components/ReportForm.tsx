"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { getBrowserSupabase } from "@/lib/supabase-browser";
import { Coords, getCurrentLocation, getOrCreateFingerprint, MAKHANDA } from "@/lib/geo";
import { reverseGeocode, formatLocation, type GeoLabel } from "@/lib/geocode";
import { buildWhatsAppShare } from "@/lib/share";
import { loadAuthorities, routeComplaint, type Authority } from "@/lib/authorities";
import ComplaintButton from "./ComplaintButton";
import { useT } from "@/lib/i18n";
import { Severity, Cause, CAUSES } from "@/lib/types";
import LocationSearch from "./LocationSearch";
import LocationPicker from "./LocationPicker";

const SEVERITIES: Severity[] = ["no_water", "low_pressure", "discolored", "intermittent"];

type LocMode = "auto" | "search";

export default function ReportForm() {
  const { t } = useT();
  const [coords, setCoords] = useState<Coords | null>(null);
  const [searchCoords, setSearchCoords] = useState<Coords | null>(null);
  const [locMode, setLocMode] = useState<LocMode>("auto");
  const [submitted, setSubmitted] = useState(false);
  const [locating, setLocating] = useState(true);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [label, setLabel] = useState<GeoLabel | null>(null);
  const [severity, setSeverity] = useState<Severity>("no_water");
  const [cause, setCause] = useState<Cause | null>(null);
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submittedReportId, setSubmittedReportId] = useState<string | null>(null);
  const [authorities, setAuthorities] = useState<Authority[]>([]);

  useEffect(() => {
    loadAuthorities(getBrowserSupabase()).then(setAuthorities);
  }, []);

  const activeCoords = useMemo(
    () => (locMode === "search" && searchCoords ? searchCoords : coords),
    [locMode, searchCoords, coords]
  );

  useEffect(() => {
    let cancelled = false;
    getCurrentLocation()
      .then((c) => {
        if (!cancelled) setCoords(c);
      })
      .catch((err) => {
        if (!cancelled) {
          setLocationError(err.message);
          setCoords(MAKHANDA);
        }
      })
      .finally(() => !cancelled && setLocating(false));
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!activeCoords) return;
    let cancelled = false;
    reverseGeocode(activeCoords.lat, activeCoords.lng).then((l) => {
      if (!cancelled) setLabel(l);
    });
    return () => {
      cancelled = true;
    };
  }, [activeCoords]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeCoords) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      const supabase = getBrowserSupabase();
      const { data, error } = await supabase
        .from("reports")
        .insert({
          lat: activeCoords.lat,
          lng: activeCoords.lng,
          severity,
          cause: cause ?? null,
          note: note.trim() || null,
          suburb: label?.suburb || null,
          municipality: label?.municipality || null,
          province: label?.province || null,
          reporter_fingerprint: getOrCreateFingerprint(),
        })
        .select("id")
        .single();
      if (error) throw error;
      setSubmittedReportId((data as { id: string } | null)?.id ?? null);
      setSubmitted(true);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Something went wrong.");
      setSubmitting(false);
    }
  };

  if (submitted) {
    const shareUrl = buildWhatsAppShare({
      suburb: label?.suburb,
      municipality: label?.municipality,
      severity,
    });

    const routing = routeComplaint(authorities, label?.municipality || null);
    const complaintReport =
      submittedReportId && activeCoords
        ? {
            id: submittedReportId,
            lat: activeCoords.lat,
            lng: activeCoords.lng,
            severity,
            cause: cause ?? null,
            note: note.trim() || null,
            suburb: label?.suburb || null,
            municipality: label?.municipality || null,
            created_at: new Date().toISOString(),
          }
        : null;

    const onComplaintSend = () => {
      if (!submittedReportId) return;
      void getBrowserSupabase()
        .from("complaints_filed")
        .insert({
          report_id: submittedReportId,
          reporter_fingerprint: getOrCreateFingerprint(),
        });
    };

    return (
      <div className="flex flex-col gap-4 text-center py-8">
        <div className="w-16 h-16 rounded-full bg-green-100 mx-auto grid place-items-center text-3xl">
          ✓
        </div>
        <h2 className="text-2xl font-bold">{t("report.thanks_title")}</h2>
        <p className="text-ink/70">{t("report.thanks_body")}</p>

        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 mt-2">
          <a
            href={shareUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 bg-green-600 hover:bg-green-700 active:scale-95 transition text-white font-semibold rounded-lg py-3 px-4 flex items-center justify-center gap-2"
          >
            <span aria-hidden>📲</span> {t("report.share_whatsapp")}
          </a>
          {complaintReport && (
            <ComplaintButton
              report={complaintReport}
              routing={routing}
              onSend={onComplaintSend}
              className="flex-1"
            />
          )}
        </div>

        {routing.labels.length > 0 ? (
          <p className="text-[11px] text-ink/50 leading-snug">
            <span className="font-medium">{t("complaint.routes_to")}:</span>{" "}
            {routing.labels.join(", ")}
          </p>
        ) : authorities.length > 0 && complaintReport ? (
          <p className="text-[11px] text-alert-500 leading-snug">
            {t("complaint.no_recipient")}
          </p>
        ) : null}

        <Link href="/mine" className="text-amanzi-600 underline text-sm mt-2">
          {t("report.view_mine")}
        </Link>
        <Link href="/" className="text-ink/60 underline text-xs">
          {t("report.back_to_map")}
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-5">
      <fieldset className="flex flex-col gap-2">
        <legend className="font-semibold mb-1">{t("report.q_what")}</legend>
        <div className="grid grid-cols-2 gap-2">
          {SEVERITIES.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setSeverity(s)}
              className={`text-left p-3 rounded-lg border-2 text-sm transition ${
                severity === s
                  ? "border-amanzi-500 bg-amanzi-50"
                  : "border-slate-200 hover:border-slate-300"
              }`}
            >
              {t(`severity.${s}`)}
            </button>
          ))}
        </div>
      </fieldset>

      <fieldset className="flex flex-col gap-2">
        <legend className="font-semibold mb-1">{t("report.q_where")}</legend>

        <div className="grid grid-cols-2 gap-2 mb-1">
          <button
            type="button"
            onClick={() => setLocMode("auto")}
            className={`p-2 rounded-lg border-2 text-sm font-medium transition ${
              locMode === "auto"
                ? "border-amanzi-500 bg-amanzi-50 text-ink"
                : "border-slate-200 hover:border-slate-300 text-ink/70"
            }`}
          >
            📍 {t("report.loc_my")}
          </button>
          <button
            type="button"
            onClick={() => setLocMode("search")}
            className={`p-2 rounded-lg border-2 text-sm font-medium transition ${
              locMode === "search"
                ? "border-amanzi-500 bg-amanzi-50 text-ink"
                : "border-slate-200 hover:border-slate-300 text-ink/70"
            }`}
          >
            🔍 {t("report.loc_search")}
          </button>
        </div>

        {locMode === "search" && (
          <div className="flex flex-col gap-3 mt-1">
            <div>
              <p className="text-sm font-semibold text-ink">{t("report.step1")}</p>
              <p className="text-xs text-ink/60 mb-2">{t("report.step1_hint")}</p>
              <LocationSearch
                placeholder={t("report.search_placeholder")}
                onSelect={(hit) => {
                  setSearchCoords(hit.coords);
                  setLabel(hit.label);
                }}
              />
            </div>

            {searchCoords && (
              <div>
                <p className="text-sm font-semibold text-ink">{t("report.step2")}</p>
                <p className="text-xs text-ink/60 mb-2">{t("report.step2_hint")}</p>
                <LocationPicker initial={searchCoords} onChange={setSearchCoords} />
              </div>
            )}
          </div>
        )}

        {locMode === "auto" && locating && (
          <p className="text-sm text-ink/60">{t("report.locating")}</p>
        )}
        {locMode === "auto" && !locating && activeCoords && (
          <div className="text-sm">
            {formatLocation(label) ? (
              <p className="text-ink font-medium">{formatLocation(label)}</p>
            ) : (
              <p className="text-ink/60">{t("report.detecting_suburb")}</p>
            )}
            <p className="text-ink/50 text-xs mt-0.5">
              {activeCoords.lat.toFixed(4)}, {activeCoords.lng.toFixed(4)}
            </p>
          </div>
        )}
        {locMode === "auto" && !locating && locationError && (
          <p className="text-sm text-alert-500">
            Couldn&apos;t get your location ({locationError}). Switch to &ldquo;{t("report.loc_search")}&rdquo; to set it manually.
          </p>
        )}

        {locMode === "search" && activeCoords && formatLocation(label) && (
          <p className="text-xs text-ink/60 mt-2">
            <span className="font-medium text-ink">{formatLocation(label)}</span>{" "}
            <span className="text-ink/40">
              ({activeCoords.lat.toFixed(4)}, {activeCoords.lng.toFixed(4)})
            </span>
          </p>
        )}
      </fieldset>

      <fieldset className="flex flex-col gap-2">
        <legend className="font-semibold mb-1">{t("report.q_cause")}</legend>
        <div className="grid grid-cols-2 gap-2">
          {CAUSES.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setCause(cause === c ? null : c)}
              className={`text-left p-3 rounded-lg border-2 text-sm transition ${
                cause === c
                  ? "border-amanzi-500 bg-amanzi-50"
                  : "border-slate-200 hover:border-slate-300"
              }`}
            >
              {t(`cause.${c}`)}
            </button>
          ))}
        </div>
      </fieldset>

      <fieldset className="flex flex-col gap-2">
        <legend className="font-semibold mb-1">{t("report.q_note")}</legend>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          maxLength={280}
          rows={3}
          placeholder={t("report.note_placeholder")}
          className="border-2 border-slate-200 rounded-lg p-3 text-sm focus:border-amanzi-500 outline-none"
        />
        <p className="text-xs text-ink/50 text-right">{note.length}/280</p>
      </fieldset>

      {submitError && (
        <p className="text-sm text-alert-500 bg-alert-500/10 rounded p-2">{submitError}</p>
      )}

      <button
        type="submit"
        disabled={submitting || !activeCoords}
        className="bg-alert-500 hover:bg-alert-600 disabled:opacity-50 text-white font-semibold rounded-lg py-4"
      >
        {submitting ? t("report.submitting") : t("report.submit")}
      </button>
      <p className="text-xs text-ink/50 text-center">{t("report.anonymous")}</p>
    </form>
  );
}
