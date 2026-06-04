-- Amanz' Alert — add outage cause to reports.
-- Run this AFTER 0001_init.sql and 0002_confirmations.sql.

do $$ begin
  create type outage_cause as enum (
    'burst_pipe',
    'planned_maintenance',
    'pump_failure',
    'theft_vandalism',
    'drought',
    'unknown'
  );
exception when duplicate_object then null; end $$;

alter table reports add column if not exists cause outage_cause;

-- Postgres won't let CREATE OR REPLACE VIEW insert a column in the middle of
-- an existing view's column list, so drop + recreate. Views hold no data.
drop view if exists reports_with_counts;
drop view if exists reports_public;

create view reports_public as
  select id, created_at, lat, lng, severity, cause, note, photo_url,
         municipality, suburb, resolved_at
  from reports;

create view reports_with_counts as
  select
    r.*,
    coalesce((select count(*) from report_confirmations c
              where c.report_id = r.id and c.kind = 'still_out'), 0) as still_out_count,
    coalesce((select count(*) from report_confirmations c
              where c.report_id = r.id and c.kind = 'resolved'), 0) as resolved_count
  from reports_public r;
