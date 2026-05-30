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
  const what = opts.severity ? SEVERITY_LABEL[opts.severity].toLowerCase() : "water outage";
  const text = `${what.charAt(0).toUpperCase() + what.slice(1)} in ${place} right now. See the live outage map for South Africa: ${getAppUrl()}`;
  return `https://wa.me/?text=${encodeURIComponent(text)}`;
}
