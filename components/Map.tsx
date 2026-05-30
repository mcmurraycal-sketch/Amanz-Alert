"use client";

import { useEffect, useRef, useState } from "react";
import maplibregl, { Map as MLMap, Marker, Popup } from "maplibre-gl";
import { getBrowserSupabase } from "@/lib/supabase-browser";
import { EASTERN_CAPE_CENTER } from "@/lib/geo";
import { Report, SEVERITY_COLOR, SEVERITY_LABEL } from "@/lib/types";

const MAP_STYLE = (key: string) =>
  `https://api.maptiler.com/maps/streets-v2/style.json?key=${key}`;

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

export default function Map() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<MLMap | null>(null);
  const markersRef = useRef<Map<string, Marker>>(new Map());
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    const key = process.env.NEXT_PUBLIC_MAPTILER_KEY;

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: key ? MAP_STYLE(key) : FALLBACK_STYLE,
      center: [EASTERN_CAPE_CENTER.lng, EASTERN_CAPE_CENTER.lat],
      zoom: 7,
      attributionControl: { compact: true },
    });
    map.addControl(new maplibregl.NavigationControl({ showCompass: false }), "top-right");
    map.addControl(
      new maplibregl.GeolocateControl({
        positionOptions: { enableHighAccuracy: true },
        trackUserLocation: false,
      }),
      "top-right"
    );
    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
      markersRef.current.clear();
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const supabase = getBrowserSupabase();

    const addOrUpdate = (r: Report) => {
      if (markersRef.current.has(r.id)) return;
      const el = document.createElement("div");
      el.style.width = "18px";
      el.style.height = "18px";
      el.style.borderRadius = "50%";
      el.style.background = SEVERITY_COLOR[r.severity];
      el.style.border = "2px solid white";
      el.style.boxShadow = "0 2px 6px rgba(0,0,0,0.25)";

      const popup = new Popup({ offset: 14, closeButton: false }).setHTML(`
        <strong>${SEVERITY_LABEL[r.severity]}</strong><br/>
        <span style="color:#475569;font-size:12px">${
          r.suburb ? r.suburb + ", " : ""
        }${r.municipality || ""}</span><br/>
        <span style="color:#94a3b8;font-size:11px">${new Date(r.created_at).toLocaleString()}</span>
        ${r.note ? `<p style="margin-top:6px;font-size:13px">${escapeHTML(r.note)}</p>` : ""}
      `);

      const marker = new Marker({ element: el })
        .setLngLat([r.lng, r.lat])
        .setPopup(popup)
        .addTo(map);
      markersRef.current.set(r.id, marker);
    };

    let cancelled = false;
    (async () => {
      const { data } = await supabase
        .from("reports_public")
        .select("*")
        .is("resolved_at", null)
        .order("created_at", { ascending: false })
        .limit(1000);
      if (cancelled || !data) return;
      setCount(data.length);
      data.forEach((r) => addOrUpdate(r as Report));
    })();

    const channel = supabase
      .channel("reports-realtime")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "reports" },
        async (payload) => {
          const id = (payload.new as { id: string }).id;
          const { data } = await supabase
            .from("reports_public")
            .select("*")
            .eq("id", id)
            .maybeSingle();
          if (data) {
            addOrUpdate(data as Report);
            setCount((c) => c + 1);
          }
        }
      )
      .subscribe();

    return () => {
      cancelled = true;
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <div className="relative flex-1">
      <div ref={containerRef} className="absolute inset-0" />
      <div className="absolute top-3 left-3 bg-white/95 backdrop-blur rounded-lg px-3 py-2 shadow text-xs font-medium">
        <span className="text-alert-500">●</span> {count} active report{count === 1 ? "" : "s"}
      </div>
    </div>
  );
}

function escapeHTML(s: string) {
  return s.replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c] as string)
  );
}
