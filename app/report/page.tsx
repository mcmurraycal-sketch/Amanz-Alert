"use client";

import ReportForm from "@/components/ReportForm";
import { useT } from "@/lib/i18n";

export default function ReportPage() {
  const { t } = useT();
  return (
    <div className="flex-1 flex flex-col p-4 md:p-8 max-w-xl mx-auto w-full">
      <h1 className="text-2xl font-bold mb-1">{t("report.title")}</h1>
      <p className="text-sm text-ink/70 mb-6">{t("report.subtitle")}</p>
      <ReportForm />
    </div>
  );
}
