"use client";

import Link from "next/link";
import { useT } from "@/lib/i18n";

export default function AboutPage() {
  const { t } = useT();
  return (
    <div className="flex-1 p-4 md:p-8 max-w-2xl mx-auto w-full">
      <h1 className="text-3xl font-bold mb-2">{t("about.title")}</h1>
      <p className="text-amanzi-700 font-semibold text-lg mb-6">
        {t("about.tagline")}
      </p>

      <p className="mb-4 text-ink/80 leading-relaxed">{t("about.intro_1")}</p>
      <p className="mb-8 text-ink/80 font-medium leading-relaxed">
        {t("about.intro_2")}
      </p>

      <h2 className="text-xl font-bold mt-8 mb-3">{t("about.section_how")}</h2>
      <div className="space-y-4">
        <Pillar
          title={t("about.how_report_title")}
          body={t("about.how_report_body")}
        />
        <Pillar
          title={t("about.how_verify_title")}
          body={t("about.how_verify_body")}
        />
        <Pillar
          title={t("about.how_predict_title")}
          body={t("about.how_predict_body")}
        />
        <Pillar
          title={t("about.how_act_title")}
          body={t("about.how_act_body")}
        />
      </div>

      <h2 className="text-xl font-bold mt-10 mb-3">{t("about.section_builds")}</h2>
      <p className="mb-6 text-ink/80 leading-relaxed">
        {t("about.builds_body")}
      </p>

      <h2 className="text-xl font-bold mt-10 mb-3">{t("about.section_local")}</h2>
      <p className="mb-6 text-ink/80 leading-relaxed">
        {t("about.local_body")}
      </p>

      <h2 className="text-xl font-bold mt-10 mb-3">
        {t("about.section_involved")}
      </h2>
      <p className="mb-8 text-ink/80 leading-relaxed">
        {t("about.involved_body")}
      </p>

      <p className="mt-8">
        <Link href="/" className="text-amanzi-600 underline">
          &larr; {t("about.back_to_feed")}
        </Link>
      </p>
    </div>
  );
}

function Pillar({ title, body }: { title: string; body: string }) {
  return (
    <div>
      <p className="font-semibold text-ink mb-1">{title}</p>
      <p className="text-ink/70 text-sm leading-relaxed">{body}</p>
    </div>
  );
}
