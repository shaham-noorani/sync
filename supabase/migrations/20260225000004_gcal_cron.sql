-- Enable pg_cron and pg_net extensions (safe to run if already enabled)
create extension if not exists pg_cron;
create extension if not exists pg_net;

-- Schedule sync-gcal every 2 hours
-- sync-gcal is deployed with --no-verify-jwt so no Authorization header needed
select cron.schedule(
  'sync-gcal-every-2h',
  '0 */2 * * *',
  $$
  select net.http_post(
    url := 'https://hmnreygvxwkbsrzjxgvv.supabase.co/functions/v1/sync-gcal',
    headers := '{"Content-Type": "application/json"}'::jsonb,
    body := '{}'::jsonb
  );
  $$
);
