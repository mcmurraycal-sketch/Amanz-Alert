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
| 2 | City of Cape Town | https://www.capetown.gov.za | customer.feedback@capetown.gov.za | ⬜ | | |
| 3 | City of Johannesburg | https://www.joburg.org.za | customercare@joburg.org.za | ⬜ | | |
| 4 | City of Tshwane (Pretoria) | https://www.tshwane.gov.za | — (not seeded) | ⬜ | | |
| 5 | eThekwini Metropolitan Municipality (Durban) | https://www.durban.gov.za | — (not seeded) | ⬜ | | |
| 6 | Ekurhuleni Metropolitan Municipality | https://www.ekurhuleni.gov.za | — (not seeded) | ⬜ | | |
| 7 | Buffalo City Metropolitan Municipality (East London) | https://www.buffalocity.gov.za | — (not seeded) | ⬜ | | |
| 8 | Nelson Mandela Bay (Gqeberha) | https://www.nelsonmandelabay.gov.za | — (not seeded) | ⬜ | | |
| 9 | Mangaung Metropolitan Municipality (Bloemfontein) | https://www.mangaung.co.za | — (not seeded) | ⬜ | | |

## Tier 2 — National + provincial DWS offices

| # | Authority | Website | Current DB email | Status | Verified date | Notes |
|---|---|---|---|---|---|---|
| 10 | Department of Water and Sanitation (national) | https://www.dws.gov.za | info@dws.gov.za | ⬜ | | |
| 11 | DWS Eastern Cape | https://www.dws.gov.za | — (not seeded) | ⬜ | | |
| 12 | DWS Western Cape | https://www.dws.gov.za | — (not seeded) | ⬜ | | |
| 13 | DWS Gauteng | https://www.dws.gov.za | — (not seeded) | ⬜ | | |
| 14 | DWS KwaZulu-Natal | https://www.dws.gov.za | — (not seeded) | ⬜ | | |
| 15 | DWS Free State | https://www.dws.gov.za | — (not seeded) | ⬜ | | |
| 16 | DWS Limpopo | https://www.dws.gov.za | — (not seeded) | ⬜ | | |
| 17 | DWS Mpumalanga | https://www.dws.gov.za | — (not seeded) | ⬜ | | |
| 18 | DWS North West | https://www.dws.gov.za | — (not seeded) | ⬜ | | |
| 19 | DWS Northern Cape | https://www.dws.gov.za | — (not seeded) | ⬜ | | |

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
