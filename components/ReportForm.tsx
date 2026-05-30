"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getBrowserSupabase } from "@/lib/supabase-browser";
import { Coords, getCurrentLocation, getOrCreateFingerprint, MAKHANDA } from "@/lib/geo";
import { Severity, SEVERITY_LABEL } from "@/lib/types";

const SEVERITIES: Severity[] = ["no_water", "low_pressure", "discolored", "intermittent"];

export default function ReportForm() {
  const router = useRouter();
  const [coords, setCoords] = useState<Coords | null>(null);
  const [locating, setLocating] = useState(true);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [severity, setSeverity] = useState<Severity>("no_water");
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

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

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!coords) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      const supabase = getBrowserSupabase();
      const { error } = await supabase.from("reports").insert({
        lat: coords.lat,
        lng: coords.lng,
        severity,
        note: note.trim() || null,
        reporter_fingerprint: getOrCreateFingerprint(),
      });
      if (error) throw error;
      router.push("/?submitted=1");
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Something went wrong.");
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-5">
      <fieldset className="flex flex-col gap-2">
        <legend className="font-semibold mb-1">What&apos;s happening?</legend>
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
              {SEVERITY_LABEL[s]}
            </button>
          ))}
        </div>
      </fieldset>

      <fieldset className="flex flex-col gap-2">
        <legend className="font-semibold mb-1">Where are you?</legend>
        {locating && <p className="text-sm text-ink/60">Getting your location…</p>}
        {!locating && coords && !locationError && (
          <p className="text-sm text-ink/70">
            Using your current location ({coords.lat.toFixed(4)}, {coords.lng.toFixed(4)})
          </p>
        )}
        {!locating && locationError && (
          <p className="text-sm text-alert-500">
            Couldn&apos;t get your location ({locationError}). Defaulting to Makhanda — please confirm before submitting.
          </p>
        )}
      </fieldset>

      <fieldset className="flex flex-col gap-2">
        <legend className="font-semibold mb-1">Anything else? (optional)</legend>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          maxLength={280}
          rows={3}
          placeholder="e.g. Out since Monday morning, whole street."
          className="border-2 border-slate-200 rounded-lg p-3 text-sm focus:border-amanzi-500 outline-none"
        />
        <p className="text-xs text-ink/50 text-right">{note.length}/280</p>
      </fieldset>

      {submitError && (
        <p className="text-sm text-alert-500 bg-alert-500/10 rounded p-2">{submitError}</p>
      )}

      <button
        type="submit"
        disabled={submitting || !coords}
        className="bg-alert-500 hover:bg-alert-600 disabled:opacity-50 text-white font-semibold rounded-lg py-4"
      >
        {submitting ? "Submitting…" : "Submit report"}
      </button>
      <p className="text-xs text-ink/50 text-center">
        Anonymous &middot; No account needed &middot; Free
      </p>
    </form>
  );
}
