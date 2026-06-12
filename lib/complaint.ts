import type { Severity, Cause } from "./types";
import { SEVERITY_LABEL, CAUSE_LABEL } from "./types";
import type { ComplaintRouting } from "./authorities";
import type { MailMessage } from "./mailProviders";
import { buildProviderUrl } from "./mailProviders";

const DEFAULT_APP_URL = "https://amanz-alert.vercel.app";

function getAppUrl(): string {
  if (typeof window !== "undefined" && window.location.origin) {
    return window.location.origin;
  }
  return DEFAULT_APP_URL;
}

type ComplaintReport = {
  id: string;
  lat: number;
  lng: number;
  severity: Severity;
  cause: Cause | null;
  note: string | null;
  suburb: string | null;
  municipality: string | null;
  created_at: string;
};

export function buildComplaintMessage(
  r: ComplaintReport,
  routing?: ComplaintRouting
): MailMessage {
  const where =
    [r.suburb, r.municipality].filter(Boolean).join(", ") ||
    `coordinates ${r.lat.toFixed(4)}, ${r.lng.toFixed(4)}`;
  const reportedAt = new Date(r.created_at).toLocaleString("en-ZA");
  const reportedDate = new Date(r.created_at).toLocaleDateString("en-ZA");
  const severity = SEVERITY_LABEL[r.severity];
  const cause =
    r.cause && r.cause !== "unknown"
      ? CAUSE_LABEL[r.cause]
      : "Not identified by the community";

  const subject = `Water outage complaint — ${where} (${reportedDate})`;

  const routedHeader =
    routing && (routing.to.length > 0 || routing.cc.length > 0)
      ? `This complaint has been pre-addressed to:
${routing.labels.map((l) => `  • ${l}`).join("\n")}

Please confirm the recipient list in your email client before sending. If your local municipality is not on the list above, add their customer-care address yourself.`
      : `We do not yet have a verified email address for the municipality this outage falls under. Please look up your local municipality's customer-care address on gov.za before sending. Recommended additional CCs:
  • Your provincial Department of Water and Sanitation office
  • Your ward councillor
  • Local press if the outage has been unresolved for more than 48 hours`;

  const body =
`${routedHeader}

------

To Whom It May Concern,

I am writing to formally lodge a complaint about a water outage in ${where}, recorded on the public Amanz' Alert water-outage tracker.

Details of the outage:
  • Location: ${where}
  • Coordinates: ${r.lat.toFixed(5)}, ${r.lng.toFixed(5)}
  • First reported: ${reportedAt}
  • Reported severity: ${severity}
  • Reported cause: ${cause}
${r.note ? `  • Resident note: "${r.note}"\n` : ""}  • Public record: ${getAppUrl()}

South African residents are entitled to consistent water supply under the Water Services Act (Act 108 of 1997) and Section 27 of the Constitution. I request:

  1. An immediate response with the estimated time of restoration.
  2. An explanation of the underlying cause and the steps being taken to prevent recurrence.
  3. Confirmation that this complaint has been logged in the municipal complaints register.

A copy of this complaint is being kept in the public interest via Amanz' Alert (${getAppUrl()}), an independent, crowd-sourced water-outage monitor.

Yours sincerely,
A concerned resident`;

  return {
    to: routing ? routing.to : [],
    cc: routing ? routing.cc : [],
    subject,
    body,
  };
}

export function buildComplaintMailto(
  r: ComplaintReport,
  routing?: ComplaintRouting
): string {
  return buildProviderUrl("default", buildComplaintMessage(r, routing));
}
