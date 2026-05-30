"use client";

import { useT } from "@/lib/i18n";

export default function LanguageToggle() {
  const { lang, setLang, t } = useT();
  return (
    <button
      type="button"
      onClick={() => setLang(lang === "en" ? "xh" : "en")}
      className="text-xs px-2 py-1 rounded border border-white/30 hover:border-white/60 transition"
      aria-label="Switch language"
    >
      {t("lang.label")}
    </button>
  );
}
