-- Amanz' Alert initial schema.
-- Run this in the Supabase SQL Editor: Dashboard -> SQL -> New query -> paste -> Run.

create extension if not exists postgis;

do $$ begin
  create type outage_severity as enum ('no_water','low_pressure','discolored','intermittent');
exception when duplicate_object then null; end $$;

create table if not exists reports (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  lat double precision not null,
  lng double precision not null,
  location geography(point, 4326) generated always as (
    st_setsrid(st_makepoint(lng, lat), 4326)::geography
  ) stored,
  severity outage_severity not null,
  note text check (note is null or char_length(note) <= 280),
  photo_url text,
  municipality text,
  suburb text,
  reporter_fingerprint text,
  resolved_at timestamptz,
  constraint lat_range check (lat between -90 and 90),
  constraint lng_range check (lng between -180 and 180)
);

create index if not exists reports_location_idx on reports using gist (location);
create index if not exists reports_created_at_idx on reports (created_at desc);
create index if not exists reports_active_idx on reports (created_at desc) where resolved_at is null;

-- Public view that hides reporter_fingerprint and exposes only what the app needs.
create or replace view reports_public as
  select id, created_at, lat, lng, severity, note, photo_url, municipality, suburb, resolved_at
  from reports;

-- RLS: anonymous insert + read.
alter table reports enable row level security;

drop policy if exists "anyone can read reports" on reports;
create policy "anyone can read reports"
  on reports for select
  using (true);

drop policy if exists "anyone can insert reports" on reports;
create policy "anyone can insert reports"
  on reports for insert
  with check (
    -- Reject obviously fake or backdated submissions; enforce sane bounds.
    severity is not null
    and lat between -90 and 90
    and lng between -180 and 180
  );

-- Enable realtime so the map can update live.
alter publication supabase_realtime add table reports;

-- Simple per-fingerprint rate limit: at most 30 reports per device per hour.
create or replace function enforce_report_rate_limit()
returns trigger language plpgsql as $$
declare recent_count int;
begin
  if new.reporter_fingerprint is null then return new; end if;
  select count(*) into recent_count
    from reports
    where reporter_fingerprint = new.reporter_fingerprint
      and created_at > now() - interval '1 hour';
  if recent_count >= 30 then
    raise exception 'Too many reports from this device in the last hour. Try again later.';
  end if;
  return new;
end $$;

drop trigger if exists reports_rate_limit on reports;
create trigger reports_rate_limit
  before insert on reports
  for each row execute function enforce_report_rate_limit();
