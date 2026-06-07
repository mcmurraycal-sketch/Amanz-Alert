"use client";

import { createContext, useContext, useEffect, useState } from "react";

export type Lang = "en" | "xh";

// isiXhosa translations verified by the founder (isiXhosa speaker, Eastern Cape).
const TRANSLATIONS: Record<Lang, Record<string, string>> = {
  en: {
    "lang.label": "isiXhosa",
    "nav.map": "Map",
    "nav.feed": "Feed",
    "nav.stats": "Stats",
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
    "report.loc_search": "Search & pin",
    "report.search_placeholder": "Road name, suburb, or landmark…",
    "report.search_selected": "Location set",
    "report.step1": "Step 1 — Find the area",
    "report.step1_hint": "Search a road name, suburb, or landmark. Skip the house number — SA address data doesn't cover every street number.",
    "report.step2": "Step 2 — Mark the exact spot",
    "report.step2_hint": "Drag the red pin to the outage, or tap anywhere on the map to move it.",
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
    "complaint.send": "Send official complaint",
    "complaint.count_one": "1 complaint filed",
    "complaint.count_many": "{n} complaints filed",
    "complaint.routes_to": "Routes to",
    "complaint.no_recipient": "No verified recipient yet — please add one in your email app before sending.",
    "prediction.label": "Typical resolution",
    "prediction.basis_one": "based on 1 prior outage here",
    "prediction.basis_many": "based on {n} prior outages here",
    "stats.title": "Reliability scoreboard",
    "stats.subtitle": "South African suburbs ranked by water-outage frequency and total downtime, based on community reports. The higher the row, the worse the supply.",
    "stats.window_30d": "Last 30 days",
    "stats.window_90d": "Last 90 days",
    "stats.col_suburb": "Suburb",
    "stats.col_municipality": "Municipality",
    "stats.col_outages": "Outages",
    "stats.col_downtime": "Total downtime",
    "stats.col_currently_out": "Currently out",
    "stats.empty": "No data yet for this window. Once communities start reporting, the scoreboard will populate automatically.",
    "stats.methodology_note": "Downtime is summed across all reported outages in the window. Ongoing outages count their current age. Data is open and updated in real time.",
    "search.placeholder": "Search any South African address…",
    "search.placeholder_map": "Search the map…",
    "search.placeholder_feed": "Search a location to see nearby outages…",
    "search.selected": "Location set",
    "feed.step1_hint": "Search a road name, suburb, or landmark. House numbers don't reliably work — use a road or area name.",
    "feed.step2_hint": "Drag the pin to fine-tune. The filter shows outages within 5km.",
    "about.title": "About Amanz' Alert",
  },
  xh: {
    "lang.label": "English",
    "nav.map": "Imephu",
    "nav.feed": "Uluhlu",
    "nav.stats": "Iinkcukacha",
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
    "report.loc_search": "Khangela & ubeke iphini",
    "report.search_placeholder": "Igama lesitalato, ilokishi, okanye indawo eyaziwayo…",
    "report.search_selected": "Indawo ikhethiwe",
    "report.step1": "Inyathelo 1 — Fumana indawo",
    "report.step1_hint":
      "Khangela igama lesitalato, ilokishi, okanye indawo eyaziwayo. Musa ukubhala inombolo yendlu — iinombolo zezindlu eMzantsi Afrika azidla ngokufumaneka kwidatha.",
    "report.step2": "Inyathelo 2 — Phawula indawo eyiyo",
    "report.step2_hint":
      "Rhuqa iphini elibomvu ukuya kanye apho kungekho manzi, okanye cofa naphi na kwimephu ukuze ulibeke khona.",
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
    "complaint.send": "Thumela isikhalazo esisesikweni",
    "complaint.count_one": "Isikhalazo esi-1 sifakwe",
    "complaint.count_many": "Izikhalazo ezi-{n} zifakwe",
    "complaint.routes_to": "Iya kwi",
    "complaint.no_recipient": "Akukho mthunzeli oqinisekisiweyo — nceda yongeze enye kwi-imeyile yakho phambi kokuyithumela.",
    "prediction.label": "Ihlala isombululwa",
    "prediction.basis_one": "ngokusekelwe kwingxaki enye yangaphambili apha",
    "prediction.basis_many": "ngokusekelwe kwiingxaki ezi-{n} zangaphambili apha",
    "stats.title": "Inkcukacha yokuthembeka",
    "stats.subtitle": "Iindawo zaseMzantsi Afrika ezilandelana ngokokungabikho kwamanzi nexesha lonke lokungekho. Imigca ephezulu ibhetele.",
    "stats.window_30d": "Iintsuku ezili-30 ezigqithileyo",
    "stats.window_90d": "Iintsuku ezili-90 ezigqithileyo",
    "stats.col_suburb": "Ilokishi",
    "stats.col_municipality": "Umasipala",
    "stats.col_outages": "Iingxaki",
    "stats.col_downtime": "Ixesha lonke",
    "stats.col_currently_out": "Akukho manzi ngoku",
    "stats.empty": "Akukho datha okwangoku kweli xesha. Xa abahlali bezakuxela, le nkcukacha izakuzaliseka ngokwayo.",
    "stats.methodology_note": "Ixesha lokungekho lihlangeniswa kuzo zonke iingxaki kweli xesha. Iingxaki ezisaqhubekayo zibala ixesha lazo langoku. Idatha ivulekile kwaye ihlaziywa ngexesha lokwenyani.",
    "search.placeholder": "Khangela nayiphi na idilesi yaseMzantsi Afrika…",
    "search.placeholder_map": "Khangela kwimephu…",
    "search.placeholder_feed": "Khangela indawo ubone iingxaki ezikufutshane…",
    "search.selected": "Indawo ikhethiwe",
    "feed.step1_hint": "Khangela igama lesitalato, ilokishi, okanye indawo eyaziwayo. Iinombolo zezindlu azisebenzi — sebenzisa igama lesitalato okanye lendawo.",
    "feed.step2_hint": "Rhuqa iphini ukulungisa indawo. Isihluzo sibonisa iingxaki ezikwi-5km.",
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
