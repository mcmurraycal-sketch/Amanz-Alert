"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useT } from "@/lib/i18n";
import { MapPin, Plus } from "./icons";

const HIDDEN_ROUTES = ["/report", "/about", "/mine", "/stats"];

export default function FloatingActions() {
  const pathname = usePathname();
  const { t } = useT();

  if (HIDDEN_ROUTES.some((p) => pathname?.startsWith(p))) return null;

  return (
    <div className="fixed bottom-4 left-0 right-0 z-30 flex items-end justify-between px-4 sm:px-6 pointer-events-none">
      <div className="pointer-events-auto" />
      <Link
        href="/mine"
        className="pointer-events-auto bg-white/95 backdrop-blur border border-slate-200 hover:border-amanzi-500 active:scale-95 transition text-ink font-medium rounded-full shadow-md px-4 py-2.5 text-sm flex items-center gap-2"
      >
        <MapPin size={16} className="text-amanzi-600" />
        {t("nav.see_my_area")}
      </Link>
      <Link
        href="/report"
        aria-label={t("nav.report")}
        className="pointer-events-auto bg-alert-500 hover:bg-alert-600 active:scale-95 transition text-white rounded-full shadow-lg w-12 h-12 grid place-items-center"
      >
        <Plus size={22} />
      </Link>
    </div>
  );
}
