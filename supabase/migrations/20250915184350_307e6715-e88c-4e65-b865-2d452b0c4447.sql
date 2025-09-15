-- Create cron job to automatically update trial offer on January 31st, 2026
-- This will switch from 30-day promotional offer to 7-day standard offer

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Schedule the cron job to run on January 31st, 2026 at 00:01 (1 minute past midnight)
-- The cron expression '1 0 31 1 *' means: minute=1, hour=0, day=31, month=1 (January), any day of week
SELECT cron.schedule(
  'update-trial-offer-january-31',
  '1 0 31 1 *',
  $$
  SELECT
    net.http_post(
        url:='https://fepxacqrrjvnvpgzwhyr.supabase.co/functions/v1/update-trial-offer',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZlcHhhY3Fycmp2bnZwZ3p3aHlyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTczNDI1NTMsImV4cCI6MjA3MjkxODU1M30.JK643QTk7c6wcmGZFwl-1C4t3M2uqgC4hE74S3kliZI"}'::jsonb,
        body:='{"scheduled": true, "date": "2026-01-31"}'::jsonb
    ) as request_id;
  $$
);

-- Also create a function to manually trigger the update if needed (for testing or manual execution)
CREATE OR REPLACE FUNCTION public.trigger_trial_offer_update()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result jsonb;
BEGIN
  -- Call the edge function via HTTP
  SELECT INTO result
    net.http_post(
        url:='https://fepxacqrrjvnvpgzwhyr.supabase.co/functions/v1/update-trial-offer',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZlcHhhY3Fycmp2bnZwZ3p3aHlyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTczNDI1NTMsImV4cCI6MjA3MjkxODU1M30.JK643QTk7c6wcmGZFwl-1C4t3M2uqgC4hE74S3kliZI"}'::jsonb,
        body:='{"manual_trigger": true}'::jsonb
    );
  
  RETURN result;
END;
$$;

-- Grant execute permission to admins
GRANT EXECUTE ON FUNCTION public.trigger_trial_offer_update() TO authenticated;