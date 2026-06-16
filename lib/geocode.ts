export type GeoLabel = {
  suburb: string | null;
  municipality: string | null;
  province: string | null;
};

type GeocodeFeature = {
  id: string;
  text: string;
  place_name?: string;
  place_type?: string[];
  context?: Array<{ id: string; text: string }>;
};

function looksLikeRoad(name: string): boolean {
  const n = name.trim();
  return (
    /^[NRMP]\d+\b/i.test(n) ||
    /\b(Road|Street|Avenue|Drive|Lane|Highway|Freeway|Boulevard|Way|Crescent|Close|Rd|St|Ave|Dr)\b/i.test(
      n
    )
  );
}

export async function reverseGeocode(lat: number, lng: number): Promise<GeoLabel> {
  const empty: GeoLabel = { suburb: null, municipality: null, province: null };
  const key = process.env.NEXT_PUBLIC_MAPTILER_KEY;
  if (!key) return empty;

  try {
    const url = `https://api.maptiler.com/geocoding/${lng},${lat}.json?key=${encodeURIComponent(
      key
    )}&limit=1&language=en`;
    const res = await fetch(url);
    if (!res.ok) return empty;
    const data = (await res.json()) as { features?: GeocodeFeature[] };

    const feature = data.features?.[0];
    if (!feature) return empty;

    const context = feature.context || [];

    let municipality: string | null = null;
    let province: string | null = null;
    let localityFromContext: string | null = null;

    for (const c of context) {
      const id = c.id || "";
      if (
        !localityFromContext &&
        (id.startsWith("locality") ||
          id.startsWith("neighborhood") ||
          id.startsWith("neighbourhood") ||
          id.startsWith("suburb"))
      ) {
        localityFromContext = c.text;
      }
      if (
        !municipality &&
        (id.startsWith("municipality") ||
          id.startsWith("place") ||
          id.startsWith("subregion"))
      ) {
        municipality = c.text;
      }
      if (!province && id.startsWith("region")) {
        province = c.text;
      }
    }

    // The top hit's `text` is often a road when the user is on/near one. Prefer
    // a real locality name from context when the top hit reads like a road.
    const topText = feature.text || null;
    const topType = (feature.place_type || []).join(",");
    const topIsAddressOrRoad =
      /address|street|road/i.test(topType) ||
      (topText && looksLikeRoad(topText));
    const suburb = topIsAddressOrRoad
      ? localityFromContext ?? municipality
      : topText ?? localityFromContext;

    // If we never resolved a municipality, fall back to the region as a last
    // resort so the report at least carries something usable.
    if (!municipality && province) municipality = province;

    return { suburb, municipality, province };
  } catch {
    return empty;
  }
}

export function formatLocation(label: GeoLabel | null): string | null {
  if (!label) return null;
  if (label.suburb && label.municipality) return `${label.suburb}, ${label.municipality}`;
  return label.suburb || label.municipality || null;
}
