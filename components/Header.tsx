"use client";

import Link from "next/link";
import { useT } from "@/lib/i18n";
import LanguageToggle from "./LanguageToggle";

export default function Header() {
  const { t } = useT();
  return (
    <header className="bg-ink text-white sticky top-0 z-20">
      <div className="max-w-6xl mx-auto px-3 py-3 flex items-center justify-between gap-2">
        <Link href="/" className="flex items-center gap-1.5 font-bold tracking-tight text-sm sm:text-base">
          <span className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-amanzi-500 grid place-items-center text-xs sm:text-sm">
            💧
          </span>
          <span className="whitespace-nowrap">Amanz&apos; Alert</span>
        </Link>
        <nav className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm">
          <Link href="/" className="hover:text-amanzi-300">{t("nav.feed")}</Link>
          <Link href="/map" className="hover:text-amanzi-300">{t("nav.map")}</Link>
          <Link href="/stats" className="hover:text-amanzi-300">{t("nav.stats")}</Link>
          <Link href="/about" className="hover:text-amanzi-300">
            {t("nav.about")}
          </Link>
          <LanguageToggle />
        </nav>
      </div>
    </header>
  );
}
