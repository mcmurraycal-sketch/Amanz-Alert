import type { Coords } from "./geo";
import type { GeoLabel } from "./geocode";

export type LocationHit = {
  id: string;
  primary: string;
  secondary: string;
  displayName: string;
  coords: Coords;
  label: GeoLabel;
};

// ---- MapTiler ----

type MTContext = { id: string; text: string };

type MTFeature = {
  id: string;
  text: string;
  place_name: string;
  place_type: string[];
  center: [number, number];
  address?: string;
  context?: MTContext[];
};

function parseMTFeature(f: MTFeature): LocationHit {
  const context = f.context || [];
  const types = f.place_type || [];

  let suburb: string | null = null;
  let municipality: string | null = null;
  let region: string | null = null;

  for (const c of context) {
    const id = c.id || "";
    if (
      !suburb &&
      (id.startsWith("neighbourhood") ||
        id.startsWith("locality") ||
        id.startsWith("suburb"))
    ) {
      suburb = c.text;
    }
    if (
      !municipality &&
      (id.startsWith("municipality") ||
        id.startsWith("place") ||
        id.startsWith("joint_municipality"))
    ) {
      municipality = c.text;
    }
    if (!region && (id.startsWith("region") || id.startsWith("subregion"))) {
      region = c.text;
    }
  }

  const street = f.text || "";
  const isAddress = types.includes("address");
  const primary =
    isAddress && f.address ? `${f.address} ${street}` : street || f.place_name;

  const secondaryParts: string[] = [];
  if (suburb && suburb !== primary) secondaryParts.push(suburb);
  if (
    municipality &&
    municipality !== suburb &&
    municipality !== primary
  )
    secondaryParts.push(municipality);
  if (region && region !== municipality) secondaryParts.push(region);

  return {
    id: `mt-${f.id}`,
    primary,
    secondary: secondaryParts.join(", "),
    displayName: `${primary}${
      secondaryParts.length ? ", " + secondaryParts.join(", ") : ""
    }`,
    coords: { lat: f.center[1], lng: f.center[0] },
    label: {
      suburb: suburb || (isAddress ? null : street) || null,
      municipality: municipality || null,
    },
  };
}

async function searchMapTiler(
  query: string,
  signal?: AbortSignal
): Promise<LocationHit[]> {
  const key = process.env.NEXT_PUBLIC_MAPTILER_KEY;
  if (!key) return [];

  const url =
    `https://api.maptiler.com/geocoding/${encodeURIComponent(query)}.json` +
    `?key=${encodeURIComponent(key)}` +
    `&country=za` +
    `&types=address,poi,place,locality,neighbourhood` +
    `&autocomplete=true` +
    `&limit=8` +
    `&language=en`;

  const res = await fetch(url, { signal });
  if (!res.ok) return [];
  const data = (await res.json()) as { features?: MTFeature[] };
  return (data.features || []).map(parseMTFeature);
}

// ---- Nominatim fallback ----

type NominatimAddress = {
  house_number?: string;
  road?: string;
  suburb?: string;
  neighbourhood?: string;
  city?: string;
  town?: string;
  village?: string;
  county?: string;
  state?: string;
};

type NominatimResult = {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
  address?: NominatimAddress;
};

function parseNominatim(r: NominatimResult): LocationHit {
  const a = r.address;
  const street = a ? [a.house_number, a.road].filter(Boolean).join(" ") : "";
  const place = a
    ? a.neighbourhood || a.suburb || a.city || a.town || a.village || ""
    : "";
  const municipality = a ? a.city || a.town || a.county || null : null;
  const region = a?.state || null;

  const primary = street || place || r.display_name.split(",")[0];
  const secondaryParts: string[] = [];
  if (place && place !== primary) secondaryParts.push(place);
  if (
    municipality &&
    municipality !== place &&
    municipality !== primary
  )
    secondaryParts.push(municipality);
  if (region && region !== municipality) secondaryParts.push(region);

  return {
    id: `osm-${r.place_id}`,
    primary,
    secondary: secondaryParts.join(", "),
    displayName: r.display_name,
    coords: { lat: parseFloat(r.lat), lng: parseFloat(r.lon) },
    label: {
      suburb: place || street || null,
      municipality: municipality,
    },
  };
}

async function searchNominatim(
  query: string,
  signal?: AbortSignal
): Promise<LocationHit[]> {
  const params = new URLSearchParams({
    q: query,
    format: "json",
    addressdetails: "1",
    limit: "5",
    countrycodes: "za",
  });
  const res = await fetch(
    `https://nominatim.openstreetmap.org/search?${params}`,
    { headers: { "Accept-Language": "en" }, signal }
  );
  if (!res.ok) return [];
  const data = (await res.json()) as NominatimResult[];
  return data.map(parseNominatim);
}

// ---- Public ----

export async function searchLocation(
  query: string,
  signal?: AbortSignal
): Promise<LocationHit[]> {
  const trimmed = query.trim();
  if (trimmed.length < 2) return [];

  try {
    const mt = await searchMapTiler(trimmed, signal);
    if (mt.length > 0) return mt;
  } catch (err) {
    if ((err as Error).name === "AbortError") throw err;
  }

  try {
    return await searchNominatim(trimmed, signal);
  } catch (err) {
    if ((err as Error).name === "AbortError") throw err;
    return [];
  }
}
