-- Auto-expire stale reports after 24 hours unless recently confirmed "still out".
-- Requires pg_cron (enabled by default on Supabase).

create or replace function expire_stale_reports()
returns int language plpgsql as $$
declare expired_count int;
begin
  with stale as (
    select r.id
    from reports r
    where r.resolved_at is null
      and r.created_at < now() - interval '24 hours'
      and not exists (
        select 1 from report_confirmations c
        where c.report_id = r.id
          and c.kind = 'still_out'
          and c.created_at > now() - interval '24 hours'
      )
  )
  update reports
  set resolved_at = now()
  where id in (select id from stale)
    and resolved_at is null;

  get diagnostics expired_count = row_count;
  return expired_count;
end $$;

-- Schedule hourly cleanup. Drop first to make migration idempotent.
select cron.unschedule('expire-stale-reports')
  where exists (
    select 1 from cron.job where jobname = 'expire-stale-reports'
  );

select cron.schedule(
  'expire-stale-reports',
  '0 * * * *',
  $$select expire_stale_reports()$$
);
