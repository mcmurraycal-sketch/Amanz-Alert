"use client";

import { useEffect, useRef, useState } from "react";
import type { Coords } from "@/lib/geo";
import { useT } from "@/lib/i18n";

type Props = {
  onSelect: (coords: Coords, label: { suburb: string | null; municipality: string | null }) => void;
};

type Address = {
  road?: string;
  house_number?: string;
  suburb?: string;
  city?: string;
  town?: string;
  village?: string;
  county?: string;
  state?: string;
};

type SearchResult = {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
  address?: Address;
};

function formatResult(r: SearchResult): { primary: string; secondary: string } {
  const a = r.address;
  if (!a) return { primary: r.display_name, secondary: "" };

  const street = [a.house_number, a.road].filter(Boolean).join(" ");
  const place = a.suburb || a.city || a.town || a.village || "";
  const region = a.city && a.suburb ? a.city : a.county || a.state || "";

  const primary = street || place || r.display_name.split(",")[0];
  const secondary = [place !== primary ? place : null, region]
    .filter(Boolean)
    .join(", ");
  return { primary, secondary };
}

function extractLabel(r: SearchResult): { suburb: string | null; municipality: string | null } {
  const a = r.address;
  if (!a) {
    const parts = r.display_name.split(",").map((s) => s.trim());
    return { suburb: parts[0] || null, municipality: parts[1] || null };
  }
  const suburb = a.suburb || a.road || a.city || a.town || a.village || null;
  const municipality = a.city || a.town || a.county || null;
  return { suburb, municipality: municipality !== suburb ? municipality : null };
}

export default function AddressSearch({ onSelect }: Props) {
  const { t } = useT();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    const trimmed = query.trim();
    if (trimmed.length < 2) {
      setResults([]);
      setOpen(false);
      return;
    }

    setLoading(true);
    debounceRef.current = setTimeout(async () => {
      try {
        const params = new URLSearchParams({
          q: trimmed,
          format: "json",
          addressdetails: "1",
          limit: "5",
          countrycodes: "za",
        });
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?${params}`,
          { headers: { "Accept-Language": "en" } }
        );
        if (!res.ok) throw new Error();
        const data: SearchResult[] = await res.json();
        setResults(data);
        setOpen(data.length > 0);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 400);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  const handleSelect = (result: SearchResult) => {
    const { primary, secondary } = formatResult(result);
    const display = secondary ? `${primary}, ${secondary}` : primary;

    setSelected(display);
    setQuery(display);
    setOpen(false);
    onSelect(
      { lat: parseFloat(result.lat), lng: parseFloat(result.lon) },
      extractLabel(result)
    );
  };

  return (
    <div ref={containerRef} className="relative">
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setSelected(null);
          }}
          onFocus={() => results.length > 0 && setOpen(true)}
          placeholder={t("report.search_placeholder")}
          className="w-full border-2 border-slate-200 rounded-lg p-3 pr-10 text-sm focus:border-amanzi-500 outline-none"
        />
        {loading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <div className="w-4 h-4 border-2 border-slate-300 border-t-amanzi-500 rounded-full animate-spin" />
          </div>
        )}
      </div>

      {open && results.length > 0 && (
        <ul className="absolute z-30 mt-1 w-full bg-white border border-slate-200 rounded-lg shadow-lg overflow-hidden">
          {results.map((r) => {
            const { primary, secondary } = formatResult(r);
            return (
              <li key={r.place_id}>
                <button
                  type="button"
                  onClick={() => handleSelect(r)}
                  className="w-full text-left px-3 py-2.5 hover:bg-amanzi-50 transition border-b border-slate-100 last:border-b-0"
                >
                  <span className="text-sm font-medium">{primary}</span>
                  {secondary && (
                    <span className="block text-xs text-ink/50">{secondary}</span>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      )}

      {selected && (
        <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
          <span>✓</span> {t("report.search_selected")}
        </p>
      )}
    </div>
  );
}
