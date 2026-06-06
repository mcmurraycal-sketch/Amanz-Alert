"use client";

import { useEffect, useRef } from "react";
import maplibregl, { Map as MLMap, Marker } from "maplibre-gl";
import type { Coords } from "@/lib/geo";

type Props = {
  initial: Coords;
  onChange: (c: Coords) => void;
  height?: number;
};

const MAP_STYLE = (k: string) =>
  `https://api.maptiler.com/maps/streets-v2/style.json?key=${k}`;

const FALLBACK_STYLE: maplibregl.StyleSpecification = {
  version: 8,
  sources: {
    osm: {
      type: "raster",
      tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],
      tileSize: 256,
      attribution: "&copy; OpenStreetMap contributors",
    },
  },
  layers: [{ id: "osm", type: "raster", source: "osm" }],
};

export default function LocationPicker({ initial, onChange, height = 300 }: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<MLMap | null>(null);
  const markerRef = useRef<Marker | null>(null);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;
  const lastInitialRef = useRef<Coords>(initial);

  useEffect(() => {
    if (
      initial.lat === lastInitialRef.current.lat &&
      initial.lng === lastInitialRef.current.lng
    ) {
      return;
    }
    lastInitialRef.current = { lat: initial.lat, lng: initial.lng };
    const map = mapRef.current;
    const marker = markerRef.current;
    if (!map || !marker) return;
    marker.setLngLat([initial.lng, initial.lat]);
    map.flyTo({
      center: [initial.lng, initial.lat],
      zoom: 15,
      duration: 1000,
    });
  }, [initial]);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    const key = process.env.NEXT_PUBLIC_MAPTILER_KEY;

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: key ? MAP_STYLE(key) : FALLBACK_STYLE,
      center: [initial.lng, initial.lat],
      zoom: 14,
      attributionControl: { compact: true },
    });
    map.addControl(new maplibregl.NavigationControl({ showCompass: false }), "top-right");

    let usingFallback = !key;
    map.on("error", (e) => {
      const msg = e?.error?.message || String(e?.error || e);
      if (!usingFallback && /style|401|403|fetch/i.test(msg)) {
        usingFallback = true;
        map.setStyle(FALLBACK_STYLE);
      }
    });

    const marker = new maplibregl.Marker({ draggable: true, color: "#B83820" })
      .setLngLat([initial.lng, initial.lat])
      .addTo(map);
    markerRef.current = marker;

    marker.on("dragend", () => {
      const { lng, lat } = marker.getLngLat();
      onChangeRef.current({ lat, lng });
    });

    map.on("click", (e) => {
      marker.setLngLat(e.lngLat);
      onChangeRef.current({ lat: e.lngLat.lat, lng: e.lngLat.lng });
    });

    const forceResize = () => mapRef.current?.resize();
    map.on("load", () => requestAnimationFrame(forceResize));
    const t1 = setTimeout(forceResize, 100);
    const t2 = setTimeout(forceResize, 500);
    const ro = new ResizeObserver(forceResize);
    ro.observe(containerRef.current);

    mapRef.current = map;

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      ro.disconnect();
      map.remove();
      mapRef.current = null;
      markerRef.current = null;
    };
    // Map is initialised once; subsequent prop changes don't recreate it.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      ref={containerRef}
      className="w-full rounded-lg overflow-hidden border-2 border-slate-200 bg-slate-200"
      style={{ height }}
    />
  );
}
