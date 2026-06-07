export type Severity = "no_water" | "low_pressure" | "discolored" | "intermittent";

export const SEVERITY_LABEL: Record<Severity, string> = {
  no_water: "No water at all",
  low_pressure: "Low pressure / trickle",
  discolored: "Discolored or dirty water",
  intermittent: "Comes and goes",
};

export const SEVERITY_COLOR: Record<Severity, string> = {
  no_water: "#B83820",
  low_pressure: "#E0892B",
  discolored: "#8B5A2B",
  intermittent: "#2E8FB6",
};

export type Cause =
  | "burst_pipe"
  | "planned_maintenance"
  | "pump_failure"
  | "theft_vandalism"
  | "drought"
  | "unknown";

export const CAUSES: Cause[] = [
  "burst_pipe",
  "planned_maintenance",
  "pump_failure",
  "theft_vandalism",
  "drought",
  "unknown",
];

export const CAUSE_LABEL: Record<Cause, string> = {
  burst_pipe: "Burst pipe",
  planned_maintenance: "Planned maintenance",
  pump_failure: "Pump / power failure",
  theft_vandalism: "Theft or vandalism",
  drought: "Drought / low supply",
  unknown: "I don't know",
};

export type Report = {
  id: string;
  created_at: string;
  lat: number;
  lng: number;
  severity: Severity;
  cause: Cause | null;
  note: string | null;
  photo_url: string | null;
  municipality: string | null;
  suburb: string | null;
  resolved_at: string | null;
};

export type ReportWithCounts = Report & {
  still_out_count: number;
  resolved_count: number;
  complaint_count: number;
  predicted_resolution_seconds: number | null;
  prediction_sample_size: number;
};

export function formatPrediction(seconds: number | null): string | null {
  if (!seconds || seconds <= 0) return null;
  const hours = seconds / 3600;
  if (hours < 1) {
    const minutes = Math.round(seconds / 60);
    return `~${minutes} min`;
  }
  if (hours < 12) {
    return `~${Math.round(hours)}h`;
  }
  const days = hours / 24;
  if (days < 2) return `~${Math.round(hours)}h`;
  return `~${Math.round(days)} days`;
}

export type ReportInsert = {
  lat: number;
  lng: number;
  severity: Severity;
  cause?: Cause | null;
  note?: string | null;
  photo_url?: string | null;
  municipality?: string | null;
  suburb?: string | null;
  reporter_fingerprint?: string | null;
};
