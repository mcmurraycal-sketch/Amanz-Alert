"use client";

import { createContext, useContext, useEffect, useState } from "react";

export type Lang = "en" | "xh";

// isiXhosa translations verified by the founder (isiXhosa speaker, Eastern Cape).
const TRANSLATIONS: Record<Lang, Record<string, string>> = {
  en: {
    "lang.label": "isiXhosa",
    "nav.map": "Map",
    "nav.feed": "Feed",
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
    "report.loc_search": "Search address",
    "report.search_placeholder": "Type a street, suburb, or town…",
    "report.search_selected": "Location set",
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
    "feed.title": "Active outages",
    "feed.empty": "No active outages right now — that's good news.",
    "feed.confirmed_by": "confirmed",
    "feed.reported": "Reported",
    "feed.ago": "ago",
    "feed.no_nearby": "No active outages within 5km of this address.",
    "feed.near_prefix": "Within 5km of",
    "feed.clear_filter": "Clear",
    "search.placeholder": "Search any South African address…",
    "search.placeholder_map": "Search the map…",
    "search.placeholder_feed": "Search a location to see nearby outages…",
    "search.selected": "Location set",
    "about.title": "About Amanz' Alert",
  },
  xh: {
    "lang.label": "English",
    "nav.map": "Imephu",
    "nav.feed": "Uluhlu",
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
    "report.loc_search": "Khangela idilesi",
    "report.search_placeholder": "Bhala isitalato, ilokishi, okanye idolophu…",
    "report.search_selected": "Indawo ikhethiwe",
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
    "feed.title": "Iingxaki zamanzi ezisebenzayo",
    "feed.empty": "Akukho ngxaki zamanzi ngoku — zindaba ezintle ezo.",
    "feed.confirmed_by": "baqinisekisile",
    "feed.reported": "Yaxelwa",
    "feed.ago": "eyadlulayo",
    "feed.no_nearby": "Akukho ngxaki zamanzi kufutshane neli dilesi (5km).",
    "feed.near_prefix": "Kufutshane no-5km nendawo ye",
    "feed.clear_filter": "Cima",
    "search.placeholder": "Khangela nayiphi na idilesi yaseMzantsi Afrika…",
    "search.placeholder_map": "Khangela kwimephu…",
    "search.placeholder_feed": "Khangela indawo ubone iingxaki ezikufutshane…",
    "search.selected": "Indawo ikhethiwe",
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
