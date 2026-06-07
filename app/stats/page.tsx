"use client";

import StatsScoreboard from "@/components/StatsScoreboard";
import { useT } from "@/lib/i18n";

export default function StatsPage() {
  const { t } = useT();
  return (
    <div className="flex-1 max-w-4xl mx-auto w-full p-4 md:p-8">
      <h1 className="text-2xl font-bold mb-1">{t("stats.title")}</h1>
      <p className="text-sm text-ink/70 mb-6 max-w-prose">
        {t("stats.subtitle")}
      </p>
      <StatsScoreboard />
    </div>
  );
}
