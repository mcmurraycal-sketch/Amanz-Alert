"use client";

import { useEffect, useRef, useState } from "react";
import { LANG_NAMES, LANG_ORDER, useT, type Lang } from "@/lib/i18n";

export default function LanguageToggle() {
  const { lang, setLang } = useT();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="text-xs px-2 py-1 rounded border border-white/30 hover:border-white/60 transition flex items-center gap-1"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label="Switch language"
      >
        {lang.toUpperCase()}
        <span aria-hidden className="text-[10px] opacity-70">▾</span>
      </button>
      {open && (
        <ul
          role="listbox"
          className="absolute right-0 top-full mt-1 bg-white text-ink border border-slate-200 rounded-md shadow-lg overflow-hidden min-w-[120px] z-40"
        >
          {LANG_ORDER.map((l: Lang) => (
            <li key={l}>
              <button
                type="button"
                onClick={() => {
                  setLang(l);
                  setOpen(false);
                }}
                className={`w-full text-left px-3 py-2 text-xs hover:bg-amanzi-50 transition ${
                  l === lang ? "font-semibold text-amanzi-700" : "text-ink"
                }`}
                role="option"
                aria-selected={l === lang}
              >
                {LANG_NAMES[l]}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
