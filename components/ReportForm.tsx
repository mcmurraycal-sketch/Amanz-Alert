"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { getBrowserSupabase } from "@/lib/supabase-browser";
import { Coords, getCurrentLocation, getOrCreateFingerprint, MAKHANDA } from "@/lib/geo";
import { reverseGeocode, formatLocation, type GeoLabel } from "@/lib/geocode";
import { buildWhatsAppShare } from "@/lib/share";
import { useT } from "@/lib/i18n";
import { Severity, Cause, CAUSES } from "@/lib/types";
import LocationPicker from "./LocationPicker";

const SEVERITIES: Severity[] = ["no_water", "low_pressure", "discolored", "intermittent"];

type LocMode = "auto" | "manual";

export default function ReportForm() {
  const { t } = useT();
  const [coords, setCoords] = useState<Coords | null>(null);
  const [pickedCoords, setPickedCoords] = useState<Coords | null>(null);
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

  const activeCoords = useMemo(
    () => (locMode === "manual" && pickedCoords ? pickedCoords : coords),
    [locMode, pickedCoords, coords]
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
    setLabel(null);
    reverseGeocode(activeCoords.lat, activeCoords.lng).then((l) => {
      if (!cancelled) setLabel(l);
    });
    return () => {
      cancelled = true;
    };
  }, [activeCoords]);

  const switchToManual = () => {
    if (!pickedCoords) setPickedCoords(coords ?? MAKHANDA);
    setLocMode("manual");
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeCoords) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      const supabase = getBrowserSupabase();
      const { error } = await supabase.from("reports").insert({
        lat: activeCoords.lat,
        lng: activeCoords.lng,
        severity,
        cause: cause ?? null,
        note: note.trim() || null,
        suburb: label?.suburb || null,
        municipality: label?.municipality || null,
        reporter_fingerprint: getOrCreateFingerprint(),
      });
      if (error) throw error;
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
    return (
      <div className="flex flex-col gap-5 text-center py-8">
        <div className="w-16 h-16 rounded-full bg-green-100 mx-auto grid place-items-center text-3xl">
          ✓
        </div>
        <h2 className="text-2xl font-bold">{t("report.thanks_title")}</h2>
        <p className="text-ink/70">{t("report.thanks_body")}</p>
        <a
          href={shareUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="bg-green-600 hover:bg-green-700 active:scale-95 transition text-white font-semibold rounded-lg py-4 px-6 flex items-center justify-center gap-2"
        >
          <span aria-hidden>📲</span> {t("report.share_whatsapp")}
        </a>
        <Link href="/" className="text-amanzi-600 underline text-sm">
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
            onClick={switchToManual}
            className={`p-2 rounded-lg border-2 text-sm font-medium transition ${
              locMode === "manual"
                ? "border-amanzi-500 bg-amanzi-50 text-ink"
                : "border-slate-200 hover:border-slate-300 text-ink/70"
            }`}
          >
            🗺️ {t("report.loc_pick")}
          </button>
        </div>

        {locMode === "manual" && activeCoords && (
          <>
            <LocationPicker initial={activeCoords} onChange={setPickedCoords} />
            <p className="text-xs text-ink/60">{t("report.loc_pick_hint")}</p>
          </>
        )}

        {locating && <p className="text-sm text-ink/60">{t("report.locating")}</p>}
        {!locating && activeCoords && (
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
        {!locating && locationError && locMode === "auto" && (
          <p className="text-sm text-alert-500">
            Couldn&apos;t get your location ({locationError}). Switch to &ldquo;{t("report.loc_pick")}&rdquo; to set it manually.
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
