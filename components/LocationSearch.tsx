"use client";

import { useEffect, useRef, useState } from "react";
import { searchLocation, type LocationHit } from "@/lib/locationSearch";
import { useT } from "@/lib/i18n";

type Props = {
  placeholder?: string;
  onSelect: (hit: LocationHit) => void;
  variant?: "default" | "floating";
};

export default function LocationSearch({
  placeholder,
  onSelect,
  variant = "default",
}: Props) {
  const { t } = useT();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<LocationHit[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    abortRef.current?.abort();

    const trimmed = query.trim();
    if (trimmed.length < 2) {
      setResults([]);
      setOpen(false);
      setLoading(false);
      return;
    }

    setLoading(true);
    debounceRef.current = setTimeout(async () => {
      const ctrl = new AbortController();
      abortRef.current = ctrl;
      try {
        const hits = await searchLocation(trimmed, ctrl.signal);
        if (!ctrl.signal.aborted) {
          setResults(hits);
          setOpen(hits.length > 0);
        }
      } catch (err) {
        if ((err as Error).name !== "AbortError") setResults([]);
      } finally {
        if (!ctrl.signal.aborted) setLoading(false);
      }
    }, 350);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  const handleSelect = (hit: LocationHit) => {
    setSelected(hit.displayName);
    setQuery(hit.displayName);
    setOpen(false);
    onSelect(hit);
  };

  const inputClass =
    variant === "floating"
      ? "w-full bg-white/95 backdrop-blur border border-slate-200 rounded-lg p-2.5 pr-10 text-sm shadow focus:border-amanzi-500 outline-none"
      : "w-full bg-white border-2 border-slate-200 rounded-lg p-3 pr-10 text-sm focus:border-amanzi-500 outline-none";

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
          placeholder={placeholder || t("search.placeholder")}
          className={inputClass}
        />
        {loading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <div className="w-4 h-4 border-2 border-slate-300 border-t-amanzi-500 rounded-full animate-spin" />
          </div>
        )}
      </div>

      {open && results.length > 0 && (
        <ul className="absolute z-30 mt-1 w-full bg-white border border-slate-200 rounded-lg shadow-lg overflow-hidden max-h-80 overflow-y-auto">
          {results.map((r) => (
            <li key={r.id}>
              <button
                type="button"
                onClick={() => handleSelect(r)}
                className="w-full text-left px-3 py-2.5 hover:bg-amanzi-50 transition border-b border-slate-100 last:border-b-0"
              >
                <span className="text-sm font-medium block">{r.primary}</span>
                {r.secondary && (
                  <span className="block text-xs text-ink/50">{r.secondary}</span>
                )}
              </button>
            </li>
          ))}
        </ul>
      )}

      {selected && variant === "default" && (
        <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
          <span>✓</span> {t("search.selected")}
        </p>
      )}
    </div>
  );
}
