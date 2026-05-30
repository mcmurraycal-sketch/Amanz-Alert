-- Amanz' Alert — confirmation/resolution flow.
-- Run this AFTER 0001_init.sql, in Supabase SQL Editor.

do $$ begin
  create type confirmation_kind as enum ('still_out', 'resolved');
exception when duplicate_object then null; end $$;

create table if not exists report_confirmations (
  id uuid primary key default gen_random_uuid(),
  report_id uuid not null references reports(id) on delete cascade,
  kind confirmation_kind not null,
  reporter_fingerprint text,
  created_at timestamptz not null default now()
);

create index if not exists report_confirmations_report_id_idx
  on report_confirmations (report_id);

-- One vote per kind per device per report.
create unique index if not exists report_confirmations_unique_per_fp
  on report_confirmations (report_id, reporter_fingerprint, kind)
  where reporter_fingerprint is not null;

alter table report_confirmations enable row level security;

drop policy if exists "anyone can read confirmations" on report_confirmations;
create policy "anyone can read confirmations"
  on report_confirmations for select using (true);

drop policy if exists "anyone can insert confirmations" on report_confirmations;
create policy "anyone can insert confirmations"
  on report_confirmations for insert with check (kind is not null);

-- Auto-resolve a report once 2+ devices say "water's back".
create or replace function auto_resolve_on_confirmations()
returns trigger language plpgsql as $$
declare resolved_count int;
begin
  if new.kind = 'resolved' then
    select count(distinct reporter_fingerprint) into resolved_count
      from report_confirmations
      where report_id = new.report_id and kind = 'resolved';
    if resolved_count >= 2 then
      update reports set resolved_at = now()
        where id = new.report_id and resolved_at is null;
    end if;
  end if;
  return new;
end $$;

drop trigger if exists report_confirmations_auto_resolve on report_confirmations;
create trigger report_confirmations_auto_resolve
  after insert on report_confirmations
  for each row execute function auto_resolve_on_confirmations();

-- Counts view, joined with reports for easy querying.
create or replace view reports_with_counts as
  select
    r.*,
    coalesce((select count(*) from report_confirmations c
              where c.report_id = r.id and c.kind = 'still_out'), 0) as still_out_count,
    coalesce((select count(*) from report_confirmations c
              where c.report_id = r.id and c.kind = 'resolved'), 0) as resolved_count
  from reports_public r;

-- Realtime for the new table.
do $$ begin
  alter publication supabase_realtime add table report_confirmations;
exception when duplicate_object then null; when undefined_object then null; end $$;
