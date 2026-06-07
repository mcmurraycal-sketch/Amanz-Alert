"use client";

import MyReports from "@/components/MyReports";
import { useT } from "@/lib/i18n";

export default function MinePage() {
  const { t } = useT();
  return (
    <div className="flex-1 max-w-2xl mx-auto w-full p-4 md:p-8">
      <h1 className="text-2xl font-bold mb-1">{t("mine.title")}</h1>
      <p className="text-sm text-ink/70 mb-6 max-w-prose">
        {t("mine.subtitle")}
      </p>
      <MyReports />
    </div>
  );
}
