export type Coords = { lat: number; lng: number; accuracy?: number };

export const EASTERN_CAPE_CENTER: Coords = { lat: -33.0153, lng: 27.9116 };
export const MAKHANDA: Coords = { lat: -33.3104, lng: 26.5256 };

export function getCurrentLocation(): Promise<Coords> {
  return new Promise((resolve, reject) => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      reject(new Error("Geolocation not supported on this device."));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) =>
        resolve({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
        }),
      (err) => reject(new Error(err.message || "Could not get location.")),
      { enableHighAccuracy: true, timeout: 10_000, maximumAge: 30_000 }
    );
  });
}

export function haversineKm(a: Coords, b: Coords): number {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLon = ((b.lng - a.lng) * Math.PI) / 180;
  const lat1 = (a.lat * Math.PI) / 180;
  const lat2 = (b.lat * Math.PI) / 180;
  const x =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(x));
}

export function getOrCreateFingerprint(): string {
  if (typeof window === "undefined") return "";
  const key = "amanzi_fp";
  let fp = window.localStorage.getItem(key);
  if (!fp) {
    fp = crypto.randomUUID();
    window.localStorage.setItem(key, fp);
  }
  return fp;
}
