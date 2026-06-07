-- Amanz' Alert — civic-action layer.
-- Logs each time a resident drafts a formal complaint about an outage.
-- Run after 0004_auto_expire.sql.

create table if not exists complaints_filed (
  id uuid primary key default gen_random_uuid(),
  report_id uuid not null references reports(id) on delete cascade,
  reporter_fingerprint text,
  created_at timestamptz not null default now()
);

create index if not exists complaints_filed_report_idx
  on complaints_filed (report_id);

create index if not exists complaints_filed_created_at_idx
  on complaints_filed (created_at desc);

-- One complaint per device per report is enough for the count signal.
create unique index if not exists complaints_filed_unique_per_fp
  on complaints_filed (report_id, reporter_fingerprint)
  where reporter_fingerprint is not null;

alter table complaints_filed enable row level security;

drop policy if exists "anyone can read complaints" on complaints_filed;
create policy "anyone can read complaints"
  on complaints_filed for select using (true);

drop policy if exists "anyone can file complaint" on complaints_filed;
create policy "anyone can file complaint"
  on complaints_filed for insert with check (report_id is not null);

-- Rebuild reports_with_counts to include complaint_count.
drop view if exists reports_with_counts;

create view reports_with_counts as
  select
    r.*,
    coalesce((select count(*) from report_confirmations c
              where c.report_id = r.id and c.kind = 'still_out'), 0) as still_out_count,
    coalesce((select count(*) from report_confirmations c
              where c.report_id = r.id and c.kind = 'resolved'), 0) as resolved_count,
    coalesce((select count(*) from complaints_filed cf
              where cf.report_id = r.id), 0) as complaint_count
  from reports_public r;

do $$ begin
  alter publication supabase_realtime add table complaints_filed;
exception when duplicate_object then null; when undefined_object then null; end $$;
