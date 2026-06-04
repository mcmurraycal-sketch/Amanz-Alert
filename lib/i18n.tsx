"use client";

import { createContext, useContext, useEffect, useState } from "react";

export type Lang = "en" | "xh";

// isiXhosa translations verified by the founder (isiXhosa speaker, Eastern Cape).
const TRANSLATIONS: Record<Lang, Record<string, string>> = {
  en: {
    "lang.label": "isiXhosa",
    "nav.map": "Map",
    "nav.report": "Report",
    "nav.about": "About",
    "home.cta": "Report an outage near you",
    "report.title": "Report a water outage",
    "report.subtitle":
      "Takes 20 seconds. No account needed. Your report shows up on the map within a few seconds.",
    "report.q_what": "What's happening?",
    "report.q_where": "Where is the outage?",
    "report.q_cause": "What caused it? (if you know)",
    "report.q_note": "Anything else? (optional)",
    "report.loc_my": "My location",
    "report.loc_pick": "Pick on map",
    "report.loc_pick_hint": "Pan and tap the map, or drag the pin. The pin marks the outage location.",
    "report.note_placeholder": "e.g. Out since Monday morning, whole street.",
    "report.submit": "Submit report",
    "report.submitting": "Submitting…",
    "report.anonymous": "Anonymous · No account needed · Free",
    "report.locating": "Getting your location…",
    "report.detecting_suburb": "Detecting suburb…",
    "report.thanks_title": "Thanks — report logged.",
    "report.thanks_body":
      "Your report is now on the live map. The fastest way to help your area is to share it with neighbours.",
    "report.share_whatsapp": "Share on WhatsApp",
    "report.back_to_map": "Back to the map",
    "severity.no_water": "No water at all",
    "severity.low_pressure": "Low pressure / trickle",
    "severity.discolored": "Discolored or dirty water",
    "severity.intermittent": "Comes and goes",
    "cause.burst_pipe": "Burst pipe",
    "cause.planned_maintenance": "Planned maintenance",
    "cause.pump_failure": "Pump / power failure",
    "cause.theft_vandalism": "Theft or vandalism",
    "cause.drought": "Drought / low supply",
    "cause.unknown": "I don't know",
    "about.title": "About Amanz' Alert",
  },
  xh: {
    "lang.label": "English",
    "nav.map": "Imephu",
    "nav.report": "Xela",
    "nav.about": "Malunga",
    "home.cta": "Xela ukungabikho kwamanzi kufutshane nawe",
    "report.title": "Xela ukungabikho kwamanzi",
    "report.subtitle":
      "Ithatha imizuzwana engama-20. Akukho akhawunti efunekayo. Ingxelo yakho iza kuvela kwimephu kwiisekondi nje ezimbalwa.",
    "report.q_what": "Kwenzeka ntoni?",
    "report.q_where": "Kuphi apho kungekho manzi?",
    "report.q_cause": "Yintoni unobangela? (ukuba uyazi)",
    "report.q_note": "Enye into? (ngokuzithandela)",
    "report.loc_my": "Indawo yam",
    "report.loc_pick": "Khetha kwimephu",
    "report.loc_pick_hint": "Tshintsha imephu uze ucofe, okanye urhuqe iphini. Iphini libonisa indawo apho amanzi angekhoyo.",
    "report.note_placeholder":
      "umzekelo: Amanzi awakho ukususela ngoMvulo kusasa, kwisitalato sonke.",
    "report.submit": "Ngenisa ingxelo",
    "report.submitting": "Iyangeniswa…",
    "report.anonymous": "Akwaziwa ukuba ngubani · Akukho akhawunti · Simahla",
    "report.locating": "Ifumana indawo yakho…",
    "report.detecting_suburb": "Ifumana ilokishi…",
    "report.thanks_title": "Enkosi — ingxelo igciniwe.",
    "report.thanks_body":
      "Ingxelo yakho ngoku ikwimephu ephilayo. Indlela ekhawulezayo yokunceda indawo yakho kukuyabelana nabamelwane bakho.",
    "report.share_whatsapp": "Yabelana ku-WhatsApp",
    "report.back_to_map": "Buyela kwimephu",
    "severity.no_water": "Akukho amanzi konke",
    "severity.low_pressure": "Uxinzelelo oluphantsi",
    "severity.discolored": "Amanzi angcolileyo",
    "severity.intermittent": "Aphuma angene",
    "cause.burst_pipe": "Umbhobho ophukileyo",
    "cause.planned_maintenance": "Ulungiso olucwangcisiweyo",
    "cause.pump_failure": "Ukungasebenzi kwepompo",
    "cause.theft_vandalism": "Ubusela okanye umonakalo",
    "cause.drought": "Imbalela",
    "cause.unknown": "Andazi",
    "about.title": "Malunga ne-Amanz' Alert",
  },
};

type Ctx = {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: string) => string;
};

const LangContext = createContext<Ctx>({
  lang: "en",
  setLang: () => {},
  t: (k) => k,
});

const STORAGE_KEY = "amanzi_lang";

export function LangProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>("en");

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (saved === "en" || saved === "xh") setLangState(saved);
    } catch {
      // localStorage may be unavailable (private mode etc.) — fall back to default.
    }
  }, []);

  const setLang = (l: Lang) => {
    setLangState(l);
    try {
      window.localStorage.setItem(STORAGE_KEY, l);
    } catch {
      // ignore
    }
  };

  const t = (key: string) =>
    TRANSLATIONS[lang][key] ?? TRANSLATIONS.en[key] ?? key;

  return (
    <LangContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LangContext.Provider>
  );
}

export function useT() {
  return useContext(LangContext);
}
