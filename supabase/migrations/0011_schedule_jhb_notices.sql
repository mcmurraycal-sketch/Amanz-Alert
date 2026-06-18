-- Schedule the JHB notices ingestion edge function to run daily.
-- 04:00 UTC = 06:00 SAST. The anon key is a valid signed JWT and satisfies the
-- function's verify_jwt; it is already public (embedded in the web client).
--
-- Prerequisite: set the ANTHROPIC_API_KEY secret on the edge function:
--   supabase secrets set ANTHROPIC_API_KEY=sk-ant-...

create extension if not exists pg_net;

select cron.schedule(
  'ingest-jhb-notices-daily',
  '0 4 * * *',
  $$
  select net.http_post(
    url := 'https://anxewbwyeaedcnrkdhrk.supabase.co/functions/v1/ingest-jhb-notices',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || '<ANON_KEY>'
    ),
    body := '{}'::jsonb,
    timeout_milliseconds := 120000
  );
  $$
);
