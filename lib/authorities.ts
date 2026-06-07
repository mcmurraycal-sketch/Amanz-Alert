import type { SupabaseClient } from "@supabase/supabase-js";

export type AuthorityKind =
  | "municipality"
  | "district"
  | "province_dws"
  | "national"
  | "oversight";

export type Authority = {
  id: string;
  kind: AuthorityKind;
  name: string;
  match_aliases: string[];
  province: string | null;
  email_primary: string;
  email_cc: string[];
  verified_at: string | null;
};

export type ComplaintRouting = {
  to: string[];
  cc: string[];
  labels: string[];
  hasMunicipalMatch: boolean;
};

function normalise(s: string): string {
  return s.trim().toLowerCase();
}

function matchesMunicipality(a: Authority, municipality: string): boolean {
  const m = normalise(municipality);
  if (normalise(a.name) === m) return true;
  if (normalise(a.name).includes(m) || m.includes(normalise(a.name))) return true;
  for (const alias of a.match_aliases) {
    const al = normalise(alias);
    if (al === m) return true;
    if (al.includes(m) || m.includes(al)) return true;
  }
  return false;
}

export function routeComplaint(
  authorities: Authority[],
  municipality: string | null
): ComplaintRouting {
  const to: string[] = [];
  const cc: string[] = [];
  const labels: string[] = [];
  let hasMunicipalMatch = false;
  let matchedProvince: string | null = null;

  // 1) Municipal match — primary recipient.
  if (municipality) {
    const muniMatch = authorities.find(
      (a) =>
        (a.kind === "municipality" || a.kind === "district") &&
        matchesMunicipality(a, municipality)
    );
    if (muniMatch) {
      hasMunicipalMatch = true;
      matchedProvince = muniMatch.province;
      to.push(muniMatch.email_primary);
      cc.push(...muniMatch.email_cc);
      labels.push(muniMatch.name);
    }
  }

  // 2) Provincial DWS — CC, based on matched municipality's province.
  if (matchedProvince) {
    const provDws = authorities.find(
      (a) => a.kind === "province_dws" && a.province === matchedProvince
    );
    if (provDws) {
      cc.push(provDws.email_primary);
      cc.push(...provDws.email_cc);
      labels.push(provDws.name);
    }
  }

  // 3) National + oversight — always CC.
  for (const a of authorities) {
    if (a.kind === "national" || a.kind === "oversight") {
      cc.push(a.email_primary);
      cc.push(...a.email_cc);
      labels.push(a.name);
    }
  }

  return {
    to: Array.from(new Set(to)),
    cc: Array.from(new Set(cc.filter((e) => !to.includes(e)))),
    labels: Array.from(new Set(labels)),
    hasMunicipalMatch,
  };
}

export async function loadAuthorities(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: SupabaseClient<any, any, any>
): Promise<Authority[]> {
  const { data } = await supabase
    .from("authorities")
    .select(
      "id, kind, name, match_aliases, province, email_primary, email_cc, verified_at"
    );
  return (data || []) as Authority[];
}
