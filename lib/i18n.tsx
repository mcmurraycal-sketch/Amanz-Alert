"use client";

import { createContext, useContext, useEffect, useState } from "react";

export type Lang = "en" | "xh" | "af" | "zu";

export const LANG_NAMES: Record<Lang, string> = {
  en: "English",
  xh: "isiXhosa",
  af: "Afrikaans",
  zu: "isiZulu",
};

export const LANG_ORDER: Lang[] = ["en", "xh", "af", "zu"];

// isiXhosa translations verified by the founder (isiXhosa speaker, Eastern Cape).
// Afrikaans + isiZulu translations are an initial machine pass and need
// native-speaker review before launch in their respective regions.
const TRANSLATIONS: Record<Lang, Record<string, string>> = {
  en: {
    "nav.map": "Map",
    "nav.feed": "Feed",
    "nav.stats": "Stats",
    "nav.mine": "Mine",
    "nav.report": "Report",
    "nav.about": "About",
    "nav.see_my_area": "See my area",
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
    "report.step1_hint":
      "Search a road name, suburb, or landmark. Skip the house number — SA address data doesn't cover every street number.",
    "report.step2": "Step 2 — Mark the exact spot",
    "report.step2_hint":
      "Drag the red pin to the outage, or tap anywhere on the map to move it.",
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
    "report.view_mine": "Monitor my reports",
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
    "feed.step1_hint":
      "Search a road name, suburb, or landmark. House numbers don't reliably work — use a road or area name.",
    "feed.step2_hint":
      "Drag the pin to fine-tune. The filter shows outages within 5km.",
    "complaint.send": "Send official complaint",
    "complaint.count_one": "1 complaint filed",
    "complaint.count_many": "{n} complaints filed",
    "complaint.routes_to": "Routes to",
    "complaint.no_recipient":
      "No verified recipient yet — please add one in your email app before sending.",
    "complaint.pick_mail": "Open complaint in…",
    "complaint.current": "current",
    "prediction.label": "Typical resolution",
    "prediction.basis_one": "based on 1 prior outage here",
    "prediction.basis_many": "based on {n} prior outages here",
    "stats.title": "Reliability scoreboard",
    "stats.subtitle":
      "South African suburbs ranked by water-outage frequency and total downtime, based on community reports. The higher the row, the worse the supply.",
    "stats.window_30d": "Last 30 days",
    "stats.window_90d": "Last 90 days",
    "stats.col_suburb": "Suburb",
    "stats.col_municipality": "Municipality",
    "stats.col_province": "Province",
    "stats.col_outages": "Outages",
    "stats.col_downtime": "Total downtime",
    "stats.col_currently_out": "Currently out",
    "stats.empty":
      "No data yet for this window. Once communities start reporting, the scoreboard will populate automatically.",
    "stats.methodology_note":
      "Downtime is summed across all reported outages in the window. Ongoing outages count their current age. Data is open and updated in real time.",
    "stats.view_all_provinces": "All provinces",
    "stats.filter_province": "Province",
    "stats.filter_municipality": "Municipality",
    "stats.clear_filters": "Clear filters",
    "mine.title": "Monitor my reports",
    "mine.subtitle":
      "Reports you've filed from this device. Tap to confirm it is still out or mark it resolved when water is back — no need to go hunting for your pin on the map.",
    "mine.tab_active": "Active",
    "mine.tab_resolved": "Resolved",
    "mine.empty_active":
      "No active reports from this device. Once you file one, it will appear here.",
    "mine.empty_resolved": "No resolved reports yet.",
    "mine.still_out": "Still out",
    "mine.water_back": "Water's back",
    "mine.counted": "Counted",
    "mine.resolved_at": "Resolved",
    "search.placeholder": "Search any South African address…",
    "search.placeholder_map": "Search the map…",
    "search.placeholder_feed": "Search a location to see nearby outages…",
    "search.selected": "Location set",
    "reliability.high": "reports within 500m · high confidence",
    "reliability.partial": "reports within 500m · partial confirmation",
    "reliability.single": "Single report · confirm with neighbours below",
    "about.title": "About Amanz' Alert",
    "about.tagline":
      "South Africa's first civic water reliability platform.",
    "about.intro_1":
      "Water outages are not the story of one tap, one suburb, or one day. They are a national infrastructure failure that costs the country billions every year and steals time, health, and dignity from millions of residents. There has never been a public, real-time record of where the water is — and where it isn't.",
    "about.intro_2": "Amanz' Alert changes that.",
    "about.section_how": "How it works",
    "about.how_report_title": "Report",
    "about.how_report_body":
      "Anyone can log a water outage in 20 seconds — no account, no app store. The platform automatically detects the suburb, municipality, and likely cause.",
    "about.how_verify_title": "Verify",
    "about.how_verify_body":
      "Neighbours confirm or resolve each report from their own phones. Reports without confirmations expire automatically; ones with multiple confirmations stay live.",
    "about.how_predict_title": "Predict",
    "about.how_predict_body":
      "We compute the typical resolution time for each suburb from historical outage data, so residents can plan their day around real numbers, not rumours.",
    "about.how_act_title": "Act",
    "about.how_act_body":
      "Every report carries a one-tap formal complaint that drafts an email — automatically routed to the relevant municipality, provincial Department of Water and Sanitation, and the Public Protector — citing the Water Services Act and Section 27 of the Constitution.",
    "about.section_builds": "What it builds",
    "about.builds_body":
      "A live national outage map. A public reliability scoreboard ranking SA suburbs by frequency and downtime. An open dataset that journalists, researchers, and policy makers can quote.",
    "about.section_local": "Built locally",
    "about.local_body":
      "Amanz' Alert was started in the Eastern Cape — the region with the highest outage incidence in South Africa — and built bilingually in English and isiXhosa, with Afrikaans and isiZulu support too. The platform is independent, free for residents permanently, and designed to work on cheap Android phones over patchy mobile data.",
    "about.section_involved": "Get involved",
    "about.involved_body":
      "Report when your water goes out. Confirm a neighbour's report. File a formal complaint. Share the link with anyone who needs it.",
    "about.back_to_feed": "Back to the feed",
  },

  xh: {
    "nav.map": "Imephu",
    "nav.feed": "Uluhlu",
    "nav.stats": "Iinkcukacha",
    "nav.mine": "Ezam",
    "nav.report": "Xela",
    "nav.about": "Malunga",
    "nav.see_my_area": "Indawo yam",
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
    "report.search_placeholder":
      "Igama lesitalato, ilokishi, okanye indawo eyaziwayo…",
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
    "report.anonymous":
      "Akwaziwa ukuba ngubani · Akukho akhawunti · Simahla",
    "report.locating": "Ifumana indawo yakho…",
    "report.detecting_suburb": "Ifumana ilokishi…",
    "report.thanks_title": "Enkosi — ingxelo igciniwe.",
    "report.thanks_body":
      "Ingxelo yakho ngoku ikwimephu ephilayo. Indlela ekhawulezayo yokunceda indawo yakho kukuyabelana nabamelwane bakho.",
    "report.share_whatsapp": "Yabelana ku-WhatsApp",
    "report.back_to_map": "Buyela kwimephu",
    "report.view_mine": "Jonga iingxelo zam",
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
    "feed.step1_hint":
      "Khangela igama lesitalato, ilokishi, okanye indawo eyaziwayo. Iinombolo zezindlu azisebenzi — sebenzisa igama lesitalato okanye lendawo.",
    "feed.step2_hint":
      "Rhuqa iphini ukulungisa indawo. Isihluzo sibonisa iingxaki ezikwi-5km.",
    "complaint.send": "Thumela isikhalazo esisesikweni",
    "complaint.count_one": "Isikhalazo esi-1 sifakwe",
    "complaint.count_many": "Izikhalazo ezi-{n} zifakwe",
    "complaint.routes_to": "Iya kwi",
    "complaint.no_recipient":
      "Akukho mthunzeli oqinisekisiweyo — nceda yongeze enye kwi-imeyile yakho phambi kokuyithumela.",
    "complaint.pick_mail": "Vula isikhalazo ku…",
    "complaint.current": "okwangoku",
    "prediction.label": "Ihlala isombululwa",
    "prediction.basis_one":
      "ngokusekelwe kwingxaki enye yangaphambili apha",
    "prediction.basis_many":
      "ngokusekelwe kwiingxaki ezi-{n} zangaphambili apha",
    "stats.title": "Inkcukacha yokuthembeka",
    "stats.subtitle":
      "Iindawo zaseMzantsi Afrika ezilandelana ngokokungabikho kwamanzi nexesha lonke lokungekho.",
    "stats.window_30d": "Iintsuku ezili-30 ezigqithileyo",
    "stats.window_90d": "Iintsuku ezili-90 ezigqithileyo",
    "stats.col_suburb": "Ilokishi",
    "stats.col_municipality": "Umasipala",
    "stats.col_province": "Iphondo",
    "stats.col_outages": "Iingxaki",
    "stats.col_downtime": "Ixesha lonke",
    "stats.col_currently_out": "Akukho manzi ngoku",
    "stats.empty":
      "Akukho datha okwangoku kweli xesha. Xa abahlali bezakuxela, le nkcukacha izakuzaliseka ngokwayo.",
    "stats.methodology_note":
      "Ixesha lokungekho lihlangeniswa kuzo zonke iingxaki kweli xesha. Iingxaki ezisaqhubekayo zibala ixesha lazo langoku. Idatha ivulekile kwaye ihlaziywa ngexesha lokwenyani.",
    "stats.view_all_provinces": "Onke amaphondo",
    "stats.filter_province": "Iphondo",
    "stats.filter_municipality": "Umasipala",
    "stats.clear_filters": "Cima izihluzo",
    "mine.title": "Jonga iingxelo zam",
    "mine.subtitle":
      "Iingxelo ozifakileyo kwesi sixhobo. Cofa ukuqinisekisa ukuba akukho manzi okanye ukuba amanzi abuyile — kungekho mfuneko yokufuna iphini lakho kwimephu.",
    "mine.tab_active": "Ezisebenzayo",
    "mine.tab_resolved": "Ezisombululweyo",
    "mine.empty_active":
      "Akukho ngxelo isebenzayo kwesi sixhobo. Xa ufaka enye, izakuvela apha.",
    "mine.empty_resolved": "Akukho ngxelo isombululweyo okwangoku.",
    "mine.still_out": "Akukho manzi",
    "mine.water_back": "Amanzi abuyile",
    "mine.counted": "Kubaliwe",
    "mine.resolved_at": "Isombululwe",
    "search.placeholder": "Khangela nayiphi na idilesi yaseMzantsi Afrika…",
    "search.placeholder_map": "Khangela kwimephu…",
    "search.placeholder_feed":
      "Khangela indawo ubone iingxaki ezikufutshane…",
    "search.selected": "Indawo ikhethiwe",
    "reliability.high": "iingxelo ezikwi-500m · ukuqiniseka okuphakamileyo",
    "reliability.partial":
      "iingxelo ezikwi-500m · ukuqinisekiswa okuyinxenye",
    "reliability.single":
      "Ingxelo enye · qinisekisa nabamelwane apha ngezantsi",
    "about.title": "Malunga ne-Amanz' Alert",
    "about.tagline":
      "Iqonga lokuqala loluntu lokuthembeka kwamanzi eMzantsi Afrika.",
    "about.intro_1":
      "Ukungabikho kwamanzi asilibali leli pompi linye, lokishi inye, okanye usuku olunye. Yintswelo yezinto eziphathelele kwizwe lonke ekhuthaza izigidigidi minyaka le, ize ithathe ixesha, impilo, nesidima kwizigidi zabahlali. Akukho rekhodi yoluntu yexesha lokwenyani malunga nokuthi amanzi akhona phi — naphi angekho.",
    "about.intro_2": "I-Amanz' Alert iyiguqula loo nto.",
    "about.section_how": "Indlela esebenza ngayo",
    "about.how_report_title": "Xela",
    "about.how_report_body":
      "Nawuphi na umntu unokuxela ingxaki yamanzi kwiisekondi ezingama-20 — akukho akhawunti, akukho ivenkile yokufaka. Iqonga lifumana ngokuzenzekelayo ilokishi, umasipala, nonobangela onokwenzeka.",
    "about.how_verify_title": "Qinisekisa",
    "about.how_verify_body":
      "Abamelwane bayaqinisekisa okanye basombulule ingxelo nganye ngeefowuni zabo. Iingxelo ezingaqinisekiswanga ziyaphela ngokuzenzekelayo; ezo zineenqinisekiso ezininzi ziyahlala.",
    "about.how_predict_title": "Qikelela",
    "about.how_predict_body":
      "Sibala ixesha eliqhelekileyo lokusombulula kuyo yonke ilokishi sisebenzisa idatha yembali yeengxaki, ukuze abahlali bacwangcise usuku lwabo ngamanani okwenyani, kungekhona iindaba.",
    "about.how_act_title": "Thatha amanyathelo",
    "about.how_act_body":
      "Yonke ingxelo ineqhosha lokuthumela isikhalazo esisesikweni — esithunyelwa ngokuzenzekelayo kumasipala ofanelekileyo, kwiSebe Lezamanzi Nemfuneko Yeendlu Zangasese laseliphondo, naKomgcini-buchwephesha — sibhekisela kuMthetho weeNkonzo Zamanzi nakwiCandelo 27 loMgaqo-siseko.",
    "about.section_builds": "Oko ikwakhayo",
    "about.builds_body":
      "Imephu yelizwe ephilayo. Inkcukacha yoluntu yokuthembeka ehlela iindawo zaseMzantsi Afrika ngokwemvelaphi nexesha lokungekho kwamanzi. Idatha evulekileyo eba iintatheli, abaphandi, nabenzi bemigaqo-nkqubo bangayisebenzisa.",
    "about.section_local": "Yakhiwe ngokwasekhaya",
    "about.local_body":
      "I-Amanz' Alert yaqalwa eMpuma Koloni — kuyo yona indawo ekhuluma ikakhulu ngokungabikho kwamanzi eMzantsi Afrika — yaye yakhelwe ngeelwimi ezimbini: isiNgesi nesiXhosa, kwakunye nenxaso yesiBhulu nesiZulu. Iqonga lizimele, simahla kubahlali ngonaphakade, kwaye lwakhelwe ukusebenza kwiifowuni zase-Android ezitshiphu nakwidatha yefowuni engaqinisekanga.",
    "about.section_involved": "Bandakanyeka",
    "about.involved_body":
      "Xela xa amanzi akho ephuma. Qinisekisa ingxelo yommelwane. Faka isikhalazo esisesikweni. Yabelana ngeli khonkco nabantu abalifunayo.",
    "about.back_to_feed": "Buyela kuluhlu",
  },

  af: {
    "nav.map": "Kaart",
    "nav.feed": "Stroom",
    "nav.stats": "Statistieke",
    "nav.mine": "Myne",
    "nav.report": "Rapporteer",
    "nav.about": "Oor",
    "nav.see_my_area": "Sien my area",
    "home.cta": "Rapporteer 'n onderbreking naby jou",
    "report.title": "Rapporteer 'n wateronderbreking",
    "report.subtitle":
      "Neem 20 sekondes. Geen rekening nodig. Jou verslag verskyn op die kaart binne sekondes.",
    "report.q_what": "Wat gebeur?",
    "report.q_where": "Waar is die onderbreking?",
    "report.q_cause": "Wat het dit veroorsaak? (as jy weet)",
    "report.q_note": "Iets anders? (opsioneel)",
    "report.loc_my": "My ligging",
    "report.loc_search": "Soek & pen",
    "report.search_placeholder":
      "Straatnaam, voorstad, of landmerk…",
    "report.search_selected": "Ligging gestel",
    "report.step1": "Stap 1 — Vind die area",
    "report.step1_hint":
      "Soek 'n straatnaam, voorstad, of landmerk. Slaan die huisnommer oor — SA adresdata dek nie elke straatnommer nie.",
    "report.step2": "Stap 2 — Merk die presiese plek",
    "report.step2_hint":
      "Sleep die rooi pen na die onderbreking, of tik enige plek op die kaart om dit te verskuif.",
    "report.note_placeholder":
      "bv. Sonder water sedert Maandagoggend, die hele straat.",
    "report.submit": "Stuur verslag",
    "report.submitting": "Stuur…",
    "report.anonymous": "Anoniem · Geen rekening · Gratis",
    "report.locating": "Kry jou ligging…",
    "report.detecting_suburb": "Bepaal voorstad…",
    "report.thanks_title": "Dankie — verslag aangeteken.",
    "report.thanks_body":
      "Jou verslag is nou op die lewendige kaart. Die vinnigste manier om jou area te help is om dit met bure te deel.",
    "report.share_whatsapp": "Deel op WhatsApp",
    "report.back_to_map": "Terug na die kaart",
    "report.view_mine": "Monitor my verslae",
    "severity.no_water": "Geen water hoegenaamd",
    "severity.low_pressure": "Lae druk / drup",
    "severity.discolored": "Verkleurd of vuil water",
    "severity.intermittent": "Kom en gaan",
    "cause.burst_pipe": "Gebarste pyp",
    "cause.planned_maintenance": "Beplande onderhoud",
    "cause.pump_failure": "Pomp / krag onderbreking",
    "cause.theft_vandalism": "Diefstal of vandalisme",
    "cause.drought": "Droogte / lae voorraad",
    "cause.unknown": "Ek weet nie",
    "feed.title": "Aktiewe onderbrekings",
    "feed.empty": "Geen aktiewe onderbrekings tans nie — goeie nuus.",
    "feed.confirmed_by": "bevestig",
    "feed.reported": "Gerapporteer",
    "feed.ago": "gelede",
    "feed.no_nearby":
      "Geen aktiewe onderbrekings binne 5km van hierdie adres nie.",
    "feed.near_prefix": "Binne 5km van",
    "feed.clear_filter": "Maak skoon",
    "feed.step1_hint":
      "Soek 'n straatnaam, voorstad, of landmerk. Huisnommers werk nie betroubaar nie — gebruik 'n straat- of areanaam.",
    "feed.step2_hint":
      "Sleep die pen om fyn aan te pas. Die filter wys onderbrekings binne 5km.",
    "complaint.send": "Stuur amptelike klagte",
    "complaint.count_one": "1 klagte ingedien",
    "complaint.count_many": "{n} klagtes ingedien",
    "complaint.routes_to": "Stuur na",
    "complaint.pick_mail": "Open klagte in…",
    "complaint.current": "huidig",
    "complaint.no_recipient":
      "Geen geverifieerde ontvanger nie — voeg een by in jou e-pos voor jy stuur.",
    "prediction.label": "Tipiese oplossing",
    "prediction.basis_one": "gebaseer op 1 vorige onderbreking hier",
    "prediction.basis_many":
      "gebaseer op {n} vorige onderbrekings hier",
    "stats.title": "Betroubaarheidstelling",
    "stats.subtitle":
      "Suid-Afrikaanse voorstede gerangskik volgens onderbrekingsfrekwensie en totale onderbrekingstyd, gebaseer op gemeenskapsverslae.",
    "stats.window_30d": "Laaste 30 dae",
    "stats.window_90d": "Laaste 90 dae",
    "stats.col_suburb": "Voorstad",
    "stats.col_municipality": "Munisipaliteit",
    "stats.col_province": "Provinsie",
    "stats.col_outages": "Onderbrekings",
    "stats.col_downtime": "Totale onderbrekingstyd",
    "stats.col_currently_out": "Tans af",
    "stats.empty":
      "Nog geen data vir hierdie venster nie. Sodra gemeenskappe begin rapporteer, sal die telling outomaties opdateer.",
    "stats.methodology_note":
      "Onderbrekingstyd word saamgetel oor alle gerapporteerde onderbrekings in die venster. Lopende onderbrekings tel hul huidige duur. Data is oop en word in regstreekse tyd opgedateer.",
    "stats.view_all_provinces": "Alle provinsies",
    "stats.filter_province": "Provinsie",
    "stats.filter_municipality": "Munisipaliteit",
    "stats.clear_filters": "Maak filters skoon",
    "mine.title": "Monitor my verslae",
    "mine.subtitle":
      "Verslae wat jy van hierdie toestel ingedien het. Tik om te bevestig dit is steeds af of merk dit opgelos wanneer water terug is.",
    "mine.tab_active": "Aktief",
    "mine.tab_resolved": "Opgelos",
    "mine.empty_active":
      "Geen aktiewe verslae van hierdie toestel nie. Sodra jy een indien, sal dit hier verskyn.",
    "mine.empty_resolved": "Nog geen opgeloste verslae nie.",
    "mine.still_out": "Steeds af",
    "mine.water_back": "Water is terug",
    "mine.counted": "Getel",
    "mine.resolved_at": "Opgelos",
    "search.placeholder": "Soek enige Suid-Afrikaanse adres…",
    "search.placeholder_map": "Soek die kaart…",
    "search.placeholder_feed":
      "Soek 'n ligging om nabygeleë onderbrekings te sien…",
    "search.selected": "Ligging gestel",
    "reliability.high": "verslae binne 500m · hoë vertroue",
    "reliability.partial": "verslae binne 500m · gedeeltelike bevestiging",
    "reliability.single":
      "Enkele verslag · bevestig met bure hieronder",
    "about.title": "Oor Amanz' Alert",
    "about.tagline":
      "Suid-Afrika se eerste burgerlike water-betroubaarheidsplatform.",
    "about.intro_1":
      "Wateronderbrekings is nie die verhaal van een kraan, een voorstad, of een dag nie. Dit is 'n nasionale infrastruktuurmislukking wat die land miljarde rand per jaar kos en tyd, gesondheid, en waardigheid van miljoene inwoners ontneem. Daar was nog nooit 'n openbare, regstreekse rekord van waar die water is — en waar dit nie is nie.",
    "about.intro_2": "Amanz' Alert verander dit.",
    "about.section_how": "Hoe dit werk",
    "about.how_report_title": "Rapporteer",
    "about.how_report_body":
      "Enigeen kan 'n wateronderbreking in 20 sekondes aanteken — geen rekening, geen toepassingswinkel nie. Die platform bespeur outomaties die voorstad, munisipaliteit, en waarskynlike oorsaak.",
    "about.how_verify_title": "Bevestig",
    "about.how_verify_body":
      "Bure bevestig of los elke verslag van hul eie fone op. Verslae sonder bevestigings verval outomaties; dié met meerdere bevestigings bly lewendig.",
    "about.how_predict_title": "Voorspel",
    "about.how_predict_body":
      "Ons bereken die tipiese oplossingstyd vir elke voorstad uit historiese onderbrekingsdata, sodat inwoners hul dag kan beplan rondom werklike syfers, nie gerugte nie.",
    "about.how_act_title": "Tree op",
    "about.how_act_body":
      "Elke verslag dra 'n een-tik amptelike klagte wat 'n e-pos opstel — outomaties gestuur na die relevante munisipaliteit, provinsiale Departement van Water en Sanitasie, en die Openbare Beskermer — wat na die Wet op Waterdienste en Artikel 27 van die Grondwet verwys.",
    "about.section_builds": "Wat dit bou",
    "about.builds_body":
      "'n Regstreekse nasionale onderbrekingskaart. 'n Openbare betroubaarheidstelling wat SA voorstede rangskik volgens frekwensie en onderbrekingstyd. 'n Oop datastel wat joernaliste, navorsers, en beleidmakers kan aanhaal.",
    "about.section_local": "Plaaslik gebou",
    "about.local_body":
      "Amanz' Alert is in die Oos-Kaap begin — die streek met die hoogste onderbrekingsvoorkoms in Suid-Afrika — en is meertalig gebou in Engels en isiXhosa, met Afrikaans en isiZulu ondersteuning ook. Die platform is onafhanklik, permanent gratis vir inwoners, en ontwerp om op goedkoop Android-fone oor wisselvallige selfoondata te werk.",
    "about.section_involved": "Raak betrokke",
    "about.involved_body":
      "Rapporteer wanneer jou water afgaan. Bevestig 'n buurman se verslag. Dien 'n amptelike klagte in. Deel die skakel met enigeen wat dit nodig het.",
    "about.back_to_feed": "Terug na die stroom",
  },

  zu: {
    "nav.map": "Imephu",
    "nav.feed": "Uhlu",
    "nav.stats": "Izibalo",
    "nav.mine": "Ezami",
    "nav.report": "Bika",
    "nav.about": "Mayelana",
    "nav.see_my_area": "Indawo yami",
    "home.cta": "Bika ukungabikho kwamanzi eduze kwakho",
    "report.title": "Bika ukungabikho kwamanzi",
    "report.subtitle":
      "Kuthatha imizuzwana engu-20. Akudingeki i-akhawunti. Umbiko wakho uvela kwimephu emasekhondini ambalwa.",
    "report.q_what": "Kwenzakalani?",
    "report.q_where": "Kuphi lapho kungekho khona amanzi?",
    "report.q_cause": "Yini ebangele lokhu? (uma wazi)",
    "report.q_note": "Okunye? (akudingekile)",
    "report.loc_my": "Indawo yami",
    "report.loc_search": "Sesha & uphawule",
    "report.search_placeholder":
      "Igama lomgwaqo, ilokishi, noma indawo eyaziwayo…",
    "report.search_selected": "Indawo ikhethiwe",
    "report.step1": "Isinyathelo 1 — Thola indawo",
    "report.step1_hint":
      "Sesha igama lomgwaqo, ilokishi, noma indawo eyaziwayo. Yeqa inombolo yendlu — idatha yamakheli yaseNingizimu Afrika ayifaki yonke inombolo yomgwaqo.",
    "report.step2": "Isinyathelo 2 — Phawula indawo eqondile",
    "report.step2_hint":
      "Hudula iphini elibomvu lapho kungekho khona amanzi, noma cindezela noma ikuphi kwimephu ukuze ulisuse.",
    "report.note_placeholder":
      "isib. Akukho manzi kusukela ngoMsombuluko ekuseni, umgwaqo wonke.",
    "report.submit": "Thumela umbiko",
    "report.submitting": "Iyathumela…",
    "report.anonymous": "Ungaziwa · Akukho i-akhawunti · Mahhala",
    "report.locating": "Sithola indawo yakho…",
    "report.detecting_suburb": "Sithola ilokishi…",
    "report.thanks_title": "Siyabonga — umbiko ufakiwe.",
    "report.thanks_body":
      "Umbiko wakho usukwimephu ephilayo. Indlela esheshayo yokusiza indawo yakho ukuwabelana nabakhelwane.",
    "report.share_whatsapp": "Yabelana nge-WhatsApp",
    "report.back_to_map": "Buyela kwimephu",
    "report.view_mine": "Bheka imibiko yami",
    "severity.no_water": "Awekho neze amanzi",
    "severity.low_pressure": "Ingcindezi ephansi / impophoma",
    "severity.discolored": "Amanzi anombala ongafanele noma angcolile",
    "severity.intermittent": "Ayaphuma ayangena",
    "cause.burst_pipe": "Ipayipi eliqhumile",
    "cause.planned_maintenance": "Ukulungiswa okuhleliwe",
    "cause.pump_failure": "Ipompo / ukungasebenzi kukagesi",
    "cause.theft_vandalism": "Ukweba noma ukucekela phansi",
    "cause.drought": "Isomiso / amanzi aphansi",
    "cause.unknown": "Angazi",
    "feed.title": "Ukungabikho kwamanzi okusebenzayo",
    "feed.empty": "Akukho kungabikho kwamanzi okusebenzayo manje — izindaba ezinhle.",
    "feed.confirmed_by": "kuqinisekisiwe",
    "feed.reported": "Kubikiwe",
    "feed.ago": "edlule",
    "feed.no_nearby":
      "Akukho kungabikho kwamanzi phakathi kuka-5km kuleli kheli.",
    "feed.near_prefix": "Phakathi kuka-5km we",
    "feed.clear_filter": "Sula",
    "feed.step1_hint":
      "Sesha igama lomgwaqo, ilokishi, noma indawo eyaziwayo. Izinombolo zezindlu azisebenzi — sebenzisa igama lomgwaqo noma lendawo.",
    "feed.step2_hint":
      "Hudula iphini ukulungisa. Isihlungi sibonisa ukungabikho kwamanzi phakathi kuka-5km.",
    "complaint.send": "Thumela isikhalo esisemthethweni",
    "complaint.count_one": "1 isikhalo sifakiwe",
    "complaint.count_many": "{n} izikhalo zifakiwe",
    "complaint.routes_to": "Iya ku",
    "complaint.no_recipient":
      "Akukho othunyelwa oqinisekisiwe — sicela ungeze omunye kwi-imeyili yakho ngaphambi kokuthumela.",
    "complaint.pick_mail": "Vula isikhalo ku…",
    "complaint.current": "manje",
    "prediction.label": "Ukuxazululwa okuvamile",
    "prediction.basis_one":
      "ngokusekelwe kungabikho okwedlule okukodwa lapha",
    "prediction.basis_many":
      "ngokusekelwe kungabikho okwedlule oku-{n} lapha",
    "stats.title": "Ibhodi yokwethenjwa",
    "stats.subtitle":
      "Amalokishi aseNingizimu Afrika ahlelwe ngokwehluleka kwamanzi nesikhathi sokungabikho, ngokusekelwe emibikweni yomphakathi.",
    "stats.window_30d": "Izinsuku ezingu-30 ezedlule",
    "stats.window_90d": "Izinsuku ezingu-90 ezedlule",
    "stats.col_suburb": "Ilokishi",
    "stats.col_municipality": "Umasipala",
    "stats.col_province": "Isifundazwe",
    "stats.col_outages": "Ukungabikho",
    "stats.col_downtime": "Isikhathi sonke sokungabikho",
    "stats.col_currently_out": "Akukho manje",
    "stats.empty":
      "Ayikho idatha okwamanje kulesi sikhathi. Lapho imiphakathi iqala ukubika, ibhodi izozigcwalisa ngokuzenzakalelayo.",
    "stats.methodology_note":
      "Isikhathi sokungabikho sihlanganiswa kukho konke ukungabikho okubikiwe esikhathini. Ukungabikho okuqhubekayo kubala isikhathi sako sikahle. Idatha ivulekile futhi ibuyekezwa ngesikhathi sangempela.",
    "stats.view_all_provinces": "Zonke izifundazwe",
    "stats.filter_province": "Isifundazwe",
    "stats.filter_municipality": "Umasipala",
    "stats.clear_filters": "Sula izihlungi",
    "mine.title": "Bheka imibiko yami",
    "mine.subtitle":
      "Imibiko oyifake kule divayisi. Cindezela ukuqinisekisa ukuthi kusabikho noma uphawule njengoba sekuxazululekile lapho amanzi ebuyile.",
    "mine.tab_active": "Esebenzayo",
    "mine.tab_resolved": "Esixazululekile",
    "mine.empty_active":
      "Ayikho imibiko esebenzayo kule divayisi. Lapho ufaka eyodwa, izovela lapha.",
    "mine.empty_resolved": "Ayikho imibiko exazululekile okwamanje.",
    "mine.still_out": "Asekho",
    "mine.water_back": "Amanzi abuyile",
    "mine.counted": "Kubalwe",
    "mine.resolved_at": "Kuxazululekile",
    "search.placeholder": "Sesha noma yiliphi ikheli laseNingizimu Afrika…",
    "search.placeholder_map": "Sesha imephu…",
    "search.placeholder_feed":
      "Sesha indawo ukubona ukungabikho kwamanzi eduze…",
    "search.selected": "Indawo ikhethiwe",
    "reliability.high": "imibiko phakathi kuka-500m · ukwethemba okuphezulu",
    "reliability.partial":
      "imibiko phakathi kuka-500m · ukuqinisekiswa okuyingxenye",
    "reliability.single":
      "Umbiko owodwa · qinisekisa nabakhelwane ngezansi",
    "about.title": "Mayelana ne-Amanz' Alert",
    "about.tagline":
      "Inkundla yokuqala yomphakathi yokwethembeka kwamanzi eNingizimu Afrika.",
    "about.intro_1":
      "Ukungabikho kwamanzi akukho mayelana nepayipi elilodwa, ilokishi elilodwa, noma usuku olulodwa. Kuwukwehluleka kwengqalasizinda kazwelonke okubiza izwe izigidi minyaka yonke futhi kuthatha isikhathi, impilo, nesithunzi kwizigidi zezakhamizi. Akukaze kube khona irekhodi yomphakathi yesikhathi sangempela yokuthi amanzi akuphi — nokuthi akekho kuphi.",
    "about.intro_2": "I-Amanz' Alert iyakushintsha lokho.",
    "about.section_how": "Indlela esebenza ngayo",
    "about.how_report_title": "Bika",
    "about.how_report_body":
      "Noma ngubani angabika ukungabikho kwamanzi emasekhondini angu-20 — akukho i-akhawunti, akukho isitolo sezinhlelo. Inkundla ithola ngokuzenzakalelayo ilokishi, umasipala, nembangela okungenzeka.",
    "about.how_verify_title": "Qinisekisa",
    "about.how_verify_body":
      "Abakhelwane baqinisekisa noma baxazulule umbiko ngamafoni abo. Imibiko engaqinisekiswanga iphelelwa yisikhathi ngokuzenzakalelayo; lawo aneqiniseko eziningi ahlala ephila.",
    "about.how_predict_title": "Qagela",
    "about.how_predict_body":
      "Sibala isikhathi esivamile sokuxazululwa salelokishi sisebenzisa idatha yokungabikho yangaphambili, ukuze izakhamizi zihlele usuku lwazo ngezibalo zangempela, hhayi amahlebezi.",
    "about.how_act_title": "Thatha isinyathelo",
    "about.how_act_body":
      "Umbiko ngamunye uphethe isikhalo esisemthethweni esicofa kanye olusayina i-imeyili — eyiswa ngokuzenzakalelayo kumasipala ofanele, eMnyangweni Wamanzi Wesifundazwe, naseMlondolozi Womphakathi — ekhomba kuMthetho Wezinkonzo Zamanzi neSigaba 27 soMthethosisekelo.",
    "about.section_builds": "Lokho ekwakhayo",
    "about.builds_body":
      "Imephu yokungabikho kwamanzi kazwelonke ephilayo. Ibhodi yokwethembeka yomphakathi ehlela amalokishi aseNingizimu Afrika ngokuvamile nangesikhathi sokungabikho. Idatha evulekile abazindaba, abacwaningi, nabakhi bezinqubomgomo abangayicaphuna.",
    "about.section_local": "Yakhiwe ngokwasekhaya",
    "about.local_body":
      "I-Amanz' Alert yaqalwa eMpumalanga Koloni — isifunda esinokungabikho kwamanzi okukhulu kunazo zonke eNingizimu Afrika — futhi yakhiwa ngezilimi ezimbili: isiNgisi nesiXhosa, ngokusekela isiBhulu nesiZulu futhi. Inkundla izimele, mahhala kuzakhamizi unomphela, futhi yakhelwe ukusebenza kumafoni e-Android ashibhile nasedatheni yefoni engalingani.",
    "about.section_involved": "Hlanganyela",
    "about.involved_body":
      "Bika lapho amanzi akho ephuma. Qinisekisa umbiko womakhelwane. Faka isikhalo esisemthethweni. Yabelana ngalesi sixhumanisi nanoma ubani osidingayo.",
    "about.back_to_feed": "Buyela ohlwini",
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

function isLang(value: string | null): value is Lang {
  return value === "en" || value === "xh" || value === "af" || value === "zu";
}

export function LangProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>("en");

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (isLang(saved)) setLangState(saved);
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
