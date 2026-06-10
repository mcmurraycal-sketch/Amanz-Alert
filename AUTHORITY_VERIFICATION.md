# Authority Directory — Verification Log

Working document. Track every municipality and DWS office address you verify for
the Amanz' Alert complaint-routing system.

**Why this matters for admissions:** This log is your evidence. When essays
need a concrete "I did the work" line, the sentence is *"I personally verified
the customer-care intake addresses of N South African water authorities so
Amanz' Alert's complaint pipeline actually delivers to the right inbox."* That
sentence is only true once this file is filled in.

## Verification process

For each row:

1. Open the official municipality / DWS website (column 3 below).
2. Find their "Contact us," "Customer care," or "Complaints" page.
3. Note the email address that handles **service delivery / water complaints**
   (NOT the generic info@ unless that's the only one listed).
4. Record what you found, when, and where (a screenshot URL is a nice extra).
5. Update the `authorities` table in Supabase (template at bottom).

## Verification status legend

- ⬜ Not yet verified — placeholder from seed data
- ✅ Verified today — address confirmed live and current
- ⚠️ Stale — address listed but bounced, replaced with phone-only, or page broken
- ❌ Not found — no contact email listed, only a form or phone number

---

## Tier 1 — Metros + pilot region (priority)

| # | Authority | Website | Current DB email | Status | Verified date | Notes |
|---|---|---|---|---|---|---|
| 1 | Makana Local Municipality (pilot) | https://www.makana.gov.za | customercare@makana.gov.za | ⚠️ | 2026-06-07 | Official site lists ZERO email addresses. Verified phone numbers: Water & Sanitation 046 603 6140 / 6069; Customer Care hotline 080 111 6134; Switchboard 046 603 6111. The seed email is an unverified best-guess pattern. Keep with a clear note; recommend the resident also call. |
| 2 | City of Cape Town | https://www.capetown.gov.za | water@capetown.gov.za | ✅ | 2026-06-09 | Verified on capetown.gov.za/Contact-us. Water & Sanitation section. CC: contact.us@capetown.gov.za. Also has 0860 103 089 hotline. |
| 3 | City of Johannesburg | https://www.johannesburgwater.co.za | fault@jwater.co.za | ✅ | 2026-06-09 | Verified on johannesburgwater.co.za/contact-us/. Joburg Water SOC handles water; fault@ is for water incidents specifically. Call centre: 011 688 1699. |
| 4 | City of Tshwane (Pretoria) | https://www.tshwane.gov.za | customercare@tshwane.gov.za | ✅ | 2026-06-09 | Verified on tshwane.gov.za. CC: waterleaks@tshwane.gov.za for water-specific faults. Toll-free: 080 111 1556. |
| 5 | eThekwini Metropolitan Municipality (Durban) | https://www.durban.gov.za | eservices@durban.gov.za | ✅ | 2026-06-09 | Verified on durban.gov.za + official eThekwini social media. Also: WhatsApp 073 148 3477; fault line 080 131 3013. |
| 6 | Ekurhuleni Metropolitan Municipality | https://www.ekurhuleni.gov.za | customercare@ekurhuleni.gov.za | ✅ | 2026-06-09 | Verified on ekurhuleni.gov.za. CC: water@ekurhuleni.gov.za. Call centre: 0860 543 000. |
| 7 | Buffalo City Metropolitan Municipality (East London) | https://www.buffalocity.gov.za | faultreport@buffalocity.gov.za | ✅ | 2026-06-09 | Verified on buffalocity.gov.za contact page. Fault reporting line: 086 111 3017. |
| 8 | Nelson Mandela Bay (Gqeberha) | https://www.nelsonmandelabay.gov.za | customercare@mandelametro.gov.za | ✅ | 2026-06-09 | Verified on municipalities.co.za contact directory. CC: waterleaks@mandelametro.gov.za. Call centre: 041 506 5555. |
| 9 | Mangaung Metropolitan Municipality (Bloemfontein) | https://www.mangaung.co.za | enquiry@mangaung.co.za | ✅ | 2026-06-09 | Verified on mangaung.co.za/contact-us. Toll-free: 0800 111 300. WhatsApp (text only): 065 586 6261. |

## Tier 2 — National + provincial DWS offices

| # | Authority | Website | Current DB email | Status | Verified date | Notes |
|---|---|---|---|---|---|---|
| 10 | Department of Water and Sanitation (national) | https://www.dws.gov.za | customercare@dws.gov.za | ✅ | 2026-06-09 | Verified on dws.gov.za/CustomerCare/ContactUs.aspx. Updated from info@ to customercare@ — the actual complaints intake. Toll-free: 0800 200 200. |
| 11 | DWS Eastern Cape | https://www.dws.gov.za | customercare@dws.gov.za | ✅ | 2026-06-09 | No separate provincial email — all route through national customercare@. Regional phone: (043) 604 5400. Office: 2 Hargreaves Ave, King William's Town. |
| 12 | DWS Western Cape | https://www.dws.gov.za | customercare@dws.gov.za | ✅ | 2026-06-09 | No separate provincial email. Regional phone: (021) 941 6000. Office: 52 Voortrekker Rd, Bellville. |
| 13 | DWS Gauteng | https://www.dws.gov.za | customercare@dws.gov.za | ✅ | 2026-06-09 | No separate provincial email. Regional phone: (012) 392 1300. Office: 285 Francis Baard St, Pretoria. |
| 14 | DWS KwaZulu-Natal | https://www.dws.gov.za | customercare@dws.gov.za | ✅ | 2026-06-09 | No separate provincial email. Regional phone: (031) 336 2700. Office: 88 Joe Slovo St, Durban. |
| 15 | DWS Free State | https://www.dws.gov.za | customercare@dws.gov.za | ✅ | 2026-06-09 | No separate provincial email. Regional phone: (051) 405 9000. Office: Bloem Plaza, Charlotte Maxeke St, Bloemfontein. |
| 16 | DWS Limpopo | https://www.dws.gov.za | customercare@dws.gov.za | ✅ | 2026-06-09 | No separate provincial email. Regional phone: (015) 290 1200. Office: Azmo Place, 49 Joubert St, Polokwane. |
| 17 | DWS Mpumalanga | https://www.dws.gov.za | customercare@dws.gov.za | ✅ | 2026-06-09 | No separate provincial email. Regional phone: (013) 759 7300. Office: Prorom Building, Nelspruit. |
| 18 | DWS North West | https://www.dws.gov.za | customercare@dws.gov.za | ✅ | 2026-06-09 | No separate provincial email. Regional phone: (018) 387 9500. Office: Mega City Complex, Mmabatho. |
| 19 | DWS Northern Cape | https://www.dws.gov.za | customercare@dws.gov.za | ✅ | 2026-06-09 | No separate provincial email. Regional phone: (053) 830 8800. Office: 28 Central Rd, Kimberley. |

## Tier 3 — Wave 2 expansion (2026-06-09)

### Eastern Cape — neighbours of Makana + districts

| Authority | Email | Status | Source |
|---|---|---|---|
| Ndlambe (Port Alfred) | complaints@ndlambe.gov.za | ✅ | ndlambe.gov.za/contact + municipalities.co.za. CC: info@ndlambe.gov.za. WhatsApp 073 384 0437. |
| Kouga (Jeffreys Bay) | registry@kouga.gov.za | ✅ | kouga.gov.za. Emergency 042 291 0250. |
| Dr Beyers Naudé (Graaff-Reinet) | danielse@bnlm.gov.za | ✅ | bnlm.gov.za/contacts. Customer Care line; CC mmoffice@bnlm.gov.za. |
| Amathole District (East London) | info@amathole.gov.za | ✅ | amathole.gov.za + municipalities.co.za. Customer Care: sibom@amathole.gov.za. |
| Chris Hani District (Komani) | email@chrishanidm.gov.za | ✅ | chrishanidm.gov.za. CC: communications@. Provides water via 8 satellite offices. |
| OR Tambo District (Mthatha) | info@ortambodm.gov.za | ✅ | ortambodm.gov.za/contact. Infrastructure/Water Services dept routes through main. |
| Blue Crane Route (Somerset East) | — | ❌ | No public email on bcrm.gov.za. Phone-only: 042 243 6400. Same problem as Makana. |

### Western Cape

| Authority | Email | Status | Source |
|---|---|---|---|
| Drakenstein (Paarl) | customercare@drakenstein.gov.za | ✅ | drakenstein.gov.za/contact-us. Water line 021 807 4715. |
| Stellenbosch | engineering.services@stellenbosch.gov.za | ✅ | stellenbosch.gov.za. Infrastructure Directorate. |
| George | gmun@george.gov.za | ✅ | george.gov.za/contact. After-hours 044 801 6300. |
| Saldanha Bay (Vredenburg) | mun@sbm.gov.za | ✅ | sbm.gov.za/contact. Call centre 022 701 7061. |
| Knysna | customercare@knysna.gov.za | ✅ | knysna.gov.za. CC: knysna@knysna.gov.za. Water leak line 044 302 6331. |
| Mossel Bay | spietersen@mosselbay.gov.za | ✅ | mosselbay.gov.za. Direct contact for water complaints. |

### KwaZulu-Natal

| Authority | Email | Status | Source |
|---|---|---|---|
| Msunduzi (Pietermaritzburg) | Billing@msunduzi.gov.za | ✅ | msunduzi.gov.za. CC: municipal.manager@. Toll-free 0800 001 868. |
| uMhlathuze (Richards Bay) | talk2us@umhlathuze.gov.za | ✅ | umhlathuze.gov.za. Call centre 0800 222 827. |
| Newcastle | dumisani.thabethe@newcastle.gov.za | ✅ | municipalities.co.za. Direct: Water Services Manager. CC: mm@newcastle.gov.za. |

### Gauteng (locals)

| Authority | Email | Status | Source |
|---|---|---|---|
| Emfuleni (Vereeniging) | customercare@emfuleni.gov.za | ✅ | emfuleni.gov.za. CC: madoda@ (Metsi-a-Lekoa water services Chief Director). |
| Mogale City (Krugersdorp) | watercomplaints@mogalecity.gov.za | ✅ | mogalecity.gov.za + verified on official Facebook. Water-specific email. |

### Limpopo

| Authority | Email | Status | Source |
|---|---|---|---|
| Polokwane | billingc@polokwane.gov.za | ⚠️ | polokwane.gov.za. Only public email is billing — water complaints route through phone (015 290 2376) + WhatsApp (068 290 8736). Email is fallback. |

### North West

| Authority | Email | Status | Source |
|---|---|---|---|
| Rustenburg | zmateta@rustenburg.gov.za | ✅ | municipalities.co.za. Direct: water department head. CC: munman@ (Service Delivery). |
| Madibeng (Brits) | ilsebrits@madibeng.gov.za | ✅ | madibeng.gov.za. Water & Sanitation Services direct contact. CC: customercare@. |

### Mpumalanga

| Authority | Email | Status | Source |
|---|---|---|---|
| City of Mbombela (Nelspruit) | customercare@mbombela.gov.za | ✅ | mbombela.gov.za. CC: info@. |
| Govan Mbeki (Secunda) | callcentre@govanmbeki.gov.za | ✅ | govanmbeki.gov.za. WhatsApp 083 790 0659. |
| Steve Tshwete (Middelburg) | council@stlm.gov.za | ✅ | stlm.gov.za/contact. |

### Northern Cape

| Authority | Email | Status | Source |
|---|---|---|---|
| Sol Plaatje (Kimberley) | info@solplaatje.org.za | ✅ | solplaatje.org.za + kimberley.org.za. SMS reporting 44204. |

### Free State

| Authority | Email | Status | Source |
|---|---|---|---|
| Matjhabeng (Welkom) | info@matjhabeng.co.za | ✅ | matjhabengmunicipality.co.za/ContactUs. |

---

## Oversight (already verified)

| # | Authority | Website | DB email | Status |
|---|---|---|---|---|
| ✓ | Public Protector South Africa | https://www.pprotect.org | registration@pprotect.org | ✅ |

---

## SQL templates — paste into Supabase SQL Editor when updating

### Mark an existing row as verified (no email change)

```sql
update authorities
set verified_at = current_date,
    notes = 'Verified on official website ' || current_date::text
where name = 'Makana Local Municipality';
```

### Update an email AND mark verified

```sql
update authorities
set email_primary = 'NEW_EMAIL_HERE',
    verified_at = current_date,
    notes = 'Replaced stale address found in initial seed; verified on official site ' || current_date::text
where name = 'Makana Local Municipality';
```

### Add a new municipality

```sql
insert into authorities (kind, name, match_aliases, province, email_primary, email_cc, website, verified_at)
values (
  'municipality',
  'City of Tshwane',
  array['Tshwane', 'Pretoria', 'CoT'],
  'Gauteng',
  'PRIMARY_EMAIL_HERE',
  array['ANY_CC_ADDRESSES'],
  'https://www.tshwane.gov.za',
  current_date
);
```

### Add a provincial DWS office

```sql
insert into authorities (kind, name, province, email_primary, website, verified_at, notes)
values (
  'province_dws',
  'DWS Eastern Cape',
  'Eastern Cape',
  'PROVINCIAL_DWS_EMAIL',
  'https://www.dws.gov.za',
  current_date,
  'Verified on DWS regional offices page ' || current_date::text
);
```

---

---

## Findings log — worked example: Makana (2026-06-07)

Process: Started at https://www.makana.gov.za → navigated via top nav "Contact Us"
which routed to https://www.makana.gov.za/customer-care/customer-care-unit/ →
followed link to the Contact List subpage.

The Contact List page is **phone-only**. No emails for any department —
including Water & Sanitation, Customer Care, or Service Delivery. Verified
phone numbers retrieved:

- **Water & Sanitation:** 046 603 6140 / 046 603 6069
- **Customer Care Hotline:** 080 111 6134 (toll-free)
- **Switchboard:** 046 603 6111

**Implication for complaint routing:** the seed email
`customercare@makana.gov.za` is a guess. Until someone confirms the address
actually exists (e.g. by sending and not getting a bounce), the platform
should display phone numbers as the primary contact and treat the email as
fallback. Filed as feature follow-up: support phone-only authorities in the
complaint flow.

---

## Tactical tips

- **Look for the "Contact Us" footer link first.** Most municipal sites bury water-specific contacts behind a "Customer Care" or "Service Delivery" subpage.
- **If only a phone number is listed**, note it in `phone` and leave `email_primary` as the closest fallback (often `info@<municipality>.gov.za`). Flag the row ⚠️.
- **If the site is broken / non-existent** (some municipalities have offline websites for months at a time), mark ❌ and move on. Skip rather than guess.
- **Screenshot proof.** Take a screenshot of each verified contact page. Save them in a folder. If a journalist or admissions reader ever questions whether you really did this work, you have evidence.
- **Time-box it.** 5 minutes per row, max. The point is verified coverage, not perfection.
