"use client";

import Link from "next/link";
import { useT } from "@/lib/i18n";
import LanguageToggle from "./LanguageToggle";
import { DropMark } from "./icons";

export default function Header() {
  const { t } = useT();
  return (
    <header className="bg-ink text-white sticky top-0 z-20">
      <div className="max-w-6xl mx-auto px-3 py-3 flex items-center justify-between gap-2">
        <Link href="/" className="flex items-center gap-2 font-semibold tracking-[-0.01em] text-sm sm:text-base">
          <span className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-amanzi-500 text-white grid place-items-center shadow-sm">
            <DropMark size={18} />
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
