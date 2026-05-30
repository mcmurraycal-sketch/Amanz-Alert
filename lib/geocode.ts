export type GeoLabel = {
  suburb: string | null;
  municipality: string | null;
};

type GeocodeFeature = {
  id: string;
  text: string;
  place_name?: string;
  place_type?: string[];
  context?: Array<{ id: string; text: string }>;
};

export async function reverseGeocode(lat: number, lng: number): Promise<GeoLabel> {
  const key = process.env.NEXT_PUBLIC_MAPTILER_KEY;
  if (!key) return { suburb: null, municipality: null };

  try {
    const url = `https://api.maptiler.com/geocoding/${lng},${lat}.json?key=${encodeURIComponent(
      key
    )}&limit=1&language=en`;
    const res = await fetch(url);
    if (!res.ok) return { suburb: null, municipality: null };
    const data = (await res.json()) as { features?: GeocodeFeature[] };

    const feature = data.features?.[0];
    if (!feature) return { suburb: null, municipality: null };

    const suburb = feature.text || null;

    const context = feature.context || [];
    const muniCtx = context.find(
      (c) =>
        c.id.startsWith("municipality") ||
        c.id.startsWith("place") ||
        c.id.startsWith("subregion") ||
        c.id.startsWith("region")
    );

    return { suburb, municipality: muniCtx?.text || null };
  } catch {
    return { suburb: null, municipality: null };
  }
}

export function formatLocation(label: GeoLabel | null): string | null {
  if (!label) return null;
  if (label.suburb && label.municipality) return `${label.suburb}, ${label.municipality}`;
  return label.suburb || label.municipality || null;
}
