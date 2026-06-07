"use client";

import Link from "next/link";
import { useT } from "@/lib/i18n";
import LanguageToggle from "./LanguageToggle";

export default function Header() {
  const { t } = useT();
  return (
    <header className="bg-ink text-white sticky top-0 z-20">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-bold tracking-tight">
          <span className="w-7 h-7 rounded-full bg-amanzi-500 grid place-items-center text-sm">
            💧
          </span>
          Amanz&apos; Alert
        </Link>
        <nav className="flex items-center gap-3 text-sm">
          <Link href="/" className="hover:text-amanzi-300">{t("nav.map")}</Link>
          <Link href="/feed" className="hover:text-amanzi-300">{t("nav.feed")}</Link>
          <Link href="/mine" className="hover:text-amanzi-300">{t("nav.mine")}</Link>
          <Link href="/stats" className="hover:text-amanzi-300 hidden sm:inline">
            {t("nav.stats")}
          </Link>
          <Link href="/report" className="hover:text-amanzi-300">{t("nav.report")}</Link>
          <Link href="/about" className="hover:text-amanzi-300 hidden md:inline">
            {t("nav.about")}
          </Link>
          <LanguageToggle />
        </nav>
      </div>
    </header>
  );
}
