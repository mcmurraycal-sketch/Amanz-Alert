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
