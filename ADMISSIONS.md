# Amanz' Alert — Admissions Evidence Tracker

Private document. Not deployed. Updated continuously through the build → launch → growth phases.

Purpose: capture the raw material that will fuel Common App essays, supplementals, activity descriptions, and interview talking points for the 2027 cycle (Harvard, Yale, Penn/Wharton, Princeton, Dartmouth, Brown).

---

## The story arc (working draft)

**Hook:** *In Makhanda, the taps stopped working again last Tuesday — and no one knew when they'd come back. So I built a map.*

**Problem:** South Africa has chronic water-supply failures. There is no single, public, real-time data source for outages. Municipalities don't publish reliable schedules. Communities rely on rumour and WhatsApp.

**Action:** Built and shipped Amanz' Alert — a crowd-sourced PWA — solo, while in Grade 12. Pilot in Eastern Cape, architected to scale nationally.

**Result:** *(fill in as you go — users, reports submitted, geographic coverage, press, partnerships, policy impact)*

**Why it matters for me:** *(authentic version of: what this taught me about systems, civic agency, building under constraint, the South African context. Avoid generic-founder voice.)*

---

## Metrics log

Update weekly once launched.

| Date       | Users (unique fingerprints) | Reports submitted | Active reports | Municipalities covered | Notes |
|------------|------------------------------|-------------------|----------------|------------------------|-------|
| 2026-05-30 | 1 (me)                       | 1                 | 1              | 1 (Makhanda)           | MVP shipped end-to-end on localhost. First report submitted, appeared on map via realtime in ~1 second. Stack: Next.js PWA + Supabase + MapLibre. |

---

## Milestone journal

The narrative-rich version of the metrics. Each entry: date, what happened, what it felt like, what I learned. This is where good essay sentences are born.

> Example (don't use, write your own):
> **2026-06-12** — First real report from someone I don't know. A woman in Joza, Makhanda, marked "no water" at 6:47am. I refreshed the map and there was a red dot I hadn't placed. Realised I'd built something other people use.

**2026-05-30** — Day 1. Shipped a working MVP end-to-end: opened the map in a browser, tapped "Report an outage," allowed location, picked "No water at all," submitted. The dot appeared on the map a second later. Postgres confirmed the row. Then pushed to GitHub, deployed to Vercel, and **the app went live at https://amanz-alert.vercel.app**. From "no code" to "a real URL on the internet that anyone in South Africa can use" in one session. *(Edit this in your own voice — what did it feel like? What did you not expect? Did anything almost not work?)*

**2026-05-30 (continued)** — Same day, shipped a feature sprint that turned the MVP into something I'd actually be willing to share with strangers: a real droplet logo, custom link-preview card for WhatsApp/iMessage, auto-detection of suburb + municipality on every report, a one-tap WhatsApp share button on submit and on every pin, a bilingual English / isiXhosa toggle on key copy (need a native speaker review before launch), and Confirm/Resolve buttons that let neighbours verify or close out existing reports — with auto-resolution at 2+ "water's back" votes and realtime removal of resolved pins from every open map. The thing finally felt like a product, not a prototype. *(Write in your own voice: what did you feel when the WhatsApp preview rendered properly the first time?)*

---

## Press, partnerships, recognition

- *(none yet — log Grocott's Mail, Daily Maverick, eNCA mentions; Rhodes Univ partnerships; ward councillor engagement; etc.)*

---

## Technical decisions worth citing in essays

Architectural choices that read well when you can explain *why*:

- **PWA over native app.** Met users where they were (Android, WhatsApp-first, data-sensitive) instead of forcing app-store downloads.
- **Anonymous reporting.** Lowered the trust barrier; designed for a country where formal-identity systems exclude many.
- **PostGIS from day one.** Built the schema so "all reports within 5km of X in the last 6 hours" is one fast query, ready for municipality dashboards later.
- **Realtime channel.** A new report shows up on every open map within ~1 second. Network-effect baked in.
- **isiXhosa name + Eastern Cape pilot + bilingual UI.** Started where the problem hurts most, in a language I actually speak. The isiXhosa version of the app is not a translation done for politeness — it's written by someone who can read it and know whether it sounds right. That distinction matters: a lot of "for-Africa" products are built about communities rather than by people in them.
- **UTC storage, local-time display.** Every report is stored in Coordinated Universal Time in the database and rendered in the viewer's local timezone in the browser. The map works identically for someone reporting from Mthatha and a researcher reading the data from London — there's no hardcoded "South Africa time" in the schema, so it scales internationally without rework.

---

## Application surfaces (where this project goes)

### Common App — Activities list (10 slots)
- **Position:** *Founder, Amanz' Alert*
- **Organisation:** *Amanz' Alert (self-founded)*
- **Description (150 chars):** draft once metrics exist. Examples to iterate on:
  > "Built and shipped a crowd-sourced PWA mapping SA water outages. [N] users in [M] municipalities. Pilot: Eastern Cape; scaling nationally."

### Common App — Additional Information section (~650 words)
The right home for the technical depth + impact story. Use the metrics log as evidence.

### Personal statement (Common App)
*Probably* not the primary subject of the personal statement — that should be more personal. But the project can appear as the lens through which a deeper trait (systems thinking, civic urgency, building when no one asked you to) shows up.

### School-specific supplementals
- **Harvard:** "Additional info" expansion of the build story.
- **Yale:** 200-word activity description — punchy version of the founder line.
- **Penn / Wharton:** Why Wharton — connect to social impact / systems / scaling. Don't pitch it as a "startup" — pitch it as infrastructure-as-public-good.
- **Princeton:** Civic engagement essay — strong fit.
- **Dartmouth:** "Why do you care about X?" supplement — water access, SA context.
- **Brown:** Open Curriculum essay — frame as wanting to combine CS + public policy + African development studies.

### Interviews
Anchor stories to have ready:
- The moment I shipped the first version.
- The first stranger to use it.
- A technical decision I made that I'd defend.
- A user-research moment that changed the product.
- A failure or near-miss I had to recover from.

---

## What NOT to do

- Don't overclaim impact. If 50 people use it, say 50.
- Don't write "AI-powered" anywhere. The whole stack is well-understood pieces composed well — that's the story.
- Don't lead with the tech. Lead with the problem and the person you helped.
- Don't pretend to have done it alone if you bring on collaborators later — credit them, it makes the story stronger.
- Don't let this dominate your application to the exclusion of who you are outside it.

---

## Next admissions-relevant moves

- [ ] Ship to a public URL (Vercel).
- [ ] Get 10 real users from outside St Andrew's.
- [ ] Get a Grocott's Mail mention (Grahamstown local paper — easy first press hit).
- [ ] Talk to a Rhodes University researcher in hydrology / public policy → quote.
- [ ] Pitch to a Makhanda ward councillor → partnership angle.
- [ ] Document one user story in detail (with permission) → essay-grade narrative.
- [ ] Publish the dataset (CSV export) → "open data" angle for Wharton / Brown supplementals.
