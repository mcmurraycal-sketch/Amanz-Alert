-- Amanz' Alert — Authority directory.
-- A typed list of complaint recipients. Each report's complaint is routed to:
--   * its matched municipality (by name or alias),
--   * its province's DWS office (looked up via the municipality's province),
--   * always the national oversight tier (DWS national + Public Protector).
--
-- VERIFY every email_primary value against the authority's own website
-- before relying on it. Email addresses change. Add a verified_at date
-- whenever you confirm one. Use the seed rows as a template.

do $$ begin
  create type authority_kind as enum (
    'municipality',
    'district',
    'province_dws',
    'national',
    'oversight'
  );
exception when duplicate_object then null; end $$;

create table if not exists authorities (
  id uuid primary key default gen_random_uuid(),
  kind authority_kind not null,
  name text not null,
  match_aliases text[] not null default '{}',
  province text,
  email_primary text not null,
  email_cc text[] not null default '{}',
  phone text,
  website text,
  verified_at date,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists authorities_kind_idx on authorities (kind);
create index if not exists authorities_province_idx on authorities (province);
create index if not exists authorities_name_lower_idx on authorities (lower(name));

alter table authorities enable row level security;

drop policy if exists "anyone can read authorities" on authorities;
create policy "anyone can read authorities"
  on authorities for select using (true);

-- Seed: oversight (always CC'd).
insert into authorities (kind, name, email_primary, website, notes, verified_at)
select 'oversight', 'Public Protector South Africa', 'registration@pprotect.org',
       'https://www.pprotect.org',
       'Standard intake address for written complaints about poor service delivery.',
       current_date
where not exists (select 1 from authorities where name = 'Public Protector South Africa');

-- Seed: national (always CC'd). VERIFY THIS ADDRESS before going live.
insert into authorities (kind, name, email_primary, website, notes, verified_at)
select 'national', 'Department of Water and Sanitation',
       'info@dws.gov.za',
       'https://www.dws.gov.za',
       'NEEDS VERIFICATION — confirm current feedback address on dws.gov.za before launch.',
       null
where not exists (select 1 from authorities where name = 'Department of Water and Sanitation');

-- Seed: Makana (pilot region). VERIFY before launch.
insert into authorities (kind, name, match_aliases, province, email_primary, website, notes, verified_at)
select 'municipality', 'Makana Local Municipality',
       array['Makana', 'Makhanda', 'Makhanda Municipality', 'Makana LM'],
       'Eastern Cape',
       'customercare@makana.gov.za',
       'https://www.makana.gov.za',
       'NEEDS VERIFICATION — listed on makana.gov.za contact page.',
       null
where not exists (select 1 from authorities where name = 'Makana Local Municipality');

-- Seed: Cape Town (example metro template).
insert into authorities (kind, name, match_aliases, province, email_primary, website, notes, verified_at)
select 'municipality', 'City of Cape Town',
       array['Cape Town', 'CCT', 'CoCT'],
       'Western Cape',
       'customer.feedback@capetown.gov.za',
       'https://www.capetown.gov.za',
       'NEEDS VERIFICATION — confirm current address.',
       null
where not exists (select 1 from authorities where name = 'City of Cape Town');

-- Seed: Johannesburg (example metro template).
insert into authorities (kind, name, match_aliases, province, email_primary, website, notes, verified_at)
select 'municipality', 'City of Johannesburg',
       array['Joburg', 'Johannesburg', 'CoJ', 'Jhb'],
       'Gauteng',
       'customercare@joburg.org.za',
       'https://www.joburg.org.za',
       'NEEDS VERIFICATION — confirm current address.',
       null
where not exists (select 1 from authorities where name = 'City of Johannesburg');

-- TEMPLATE for adding more municipalities. Copy, edit, run.
--
-- insert into authorities (kind, name, match_aliases, province, email_primary, email_cc, website, verified_at)
-- values (
--   'municipality',
--   'eThekwini Metropolitan Municipality',
--   array['eThekwini', 'Durban', 'eThekwini Metro'],
--   'KwaZulu-Natal',
--   'water@durban.gov.za',
--   array['contactus@durban.gov.za'],
--   'https://www.durban.gov.za',
--   current_date
-- );
