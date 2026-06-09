"use client";

import OutageFeed from "@/components/OutageFeed";
import { useT } from "@/lib/i18n";

export default function HomePage() {
  const { t } = useT();
  return (
    <div className="relative flex-1 flex flex-col max-w-2xl mx-auto w-full">
      <div className="px-4 pt-4 pb-2">
        <h1 className="text-xl font-bold">{t("feed.title")}</h1>
      </div>
      <OutageFeed />
    </div>
  );
}
