-- Add temporal scheduling fields to site_ticker_messages table
ALTER TABLE public.site_ticker_messages 
ADD COLUMN IF NOT EXISTS start_date date,
ADD COLUMN IF NOT EXISTS end_date date,
ADD COLUMN IF NOT EXISTS days_of_week text[],
ADD COLUMN IF NOT EXISTS start_time time without time zone,
ADD COLUMN IF NOT EXISTS end_time time without time zone,
ADD COLUMN IF NOT EXISTS timezone text DEFAULT 'Europe/Paris',
ADD COLUMN IF NOT EXISTS priority integer DEFAULT 1;

-- Add index for better performance when filtering by schedule
CREATE INDEX IF NOT EXISTS idx_ticker_messages_schedule 
ON public.site_ticker_messages(is_active, start_date, end_date, priority);