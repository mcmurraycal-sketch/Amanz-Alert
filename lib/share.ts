import type { Severity } from "./types";
import { SEVERITY_LABEL } from "./types";

const DEFAULT_APP_URL = "https://amanz-alert.vercel.app";

function getAppUrl(): string {
  if (typeof window !== "undefined" && window.location.origin) {
    return window.location.origin;
  }
  return DEFAULT_APP_URL;
}

export function buildWhatsAppShare(opts: {
  suburb?: string | null;
  municipality?: string | null;
  severity?: Severity;
}): string {
  const where = [opts.suburb, opts.municipality].filter(Boolean).join(", ");
  const place = where || "my area";
  const sevText = opts.severity ? SEVERITY_LABEL[opts.severity] : "Water outage";
  const emoji = opts.severity === "no_water" ? "🚨" : "💧";
  const text =
    `${emoji} ${sevText} in ${place} right now. ` +
    `See it on the live map and log an official complaint — it pressures the municipality to fix it faster: ` +
    getAppUrl();
  return `https://wa.me/?text=${encodeURIComponent(text)}`;
}
