-- Official municipal water notices, ingested automatically from publishers
-- like Johannesburg Water. Distinct from community `reports`: these are
-- authoritative planned/unplanned interruption notices, not crowd reports.

create table if not exists official_notices (
  id uuid primary key default gen_random_uuid(),
  source text not null,                     -- e.g. 'jhb_water'
  municipality text,                        -- e.g. 'City of Johannesburg'
  province text,                            -- e.g. 'Gauteng'
  notice_date date not null,                -- date the notice covers
  period text,                              -- 'morning' | 'afternoon' | null
  notice_type text,                         -- 'planned' | 'unplanned' | 'recovery' | 'unknown'
  area text,                                -- system / region grouping if given
  suburb text,                              -- the affected suburb / locality
  starts_text text,                         -- human-readable start (as printed)
  ends_text text,                           -- human-readable end (as printed)
  description text,                         -- any extra detail from the notice
  source_url text,                          -- the page the notice came from
  image_url text not null,                  -- the specific notice image parsed
  raw_extract jsonb,                        -- full model extraction, for audit
  created_at timestamptz not null default now()
);

-- One row per (image, suburb) — re-running ingestion is idempotent.
create unique index if not exists official_notices_dedupe_idx
  on official_notices (image_url, coalesce(suburb, ''));

create index if not exists official_notices_date_idx
  on official_notices (notice_date desc);
create index if not exists official_notices_suburb_idx
  on official_notices (suburb);

-- Tracks which notice images have been processed, so the cron can skip
-- images it has already parsed (saves repeated vision calls).
create table if not exists official_notice_runs (
  image_url text primary key,
  source text not null,
  notice_date date,
  period text,
  rows_extracted int not null default 0,
  status text not null default 'ok',        -- 'ok' | 'error'
  error text,
  processed_at timestamptz not null default now()
);

-- Public read access; writes happen only from the service-role edge function.
alter table official_notices enable row level security;
alter table official_notice_runs enable row level security;

drop policy if exists official_notices_select on official_notices;
create policy official_notices_select
  on official_notices for select to anon, authenticated using (true);

-- Public view for the app: only current/future notices, newest first.
drop view if exists official_notices_public;
create view official_notices_public as
  select id, source, municipality, province, notice_date, period,
         notice_type, area, suburb, starts_text, ends_text, description,
         source_url, image_url, created_at
  from official_notices
  where notice_date >= current_date - interval '2 days'
  order by notice_date desc, suburb;
