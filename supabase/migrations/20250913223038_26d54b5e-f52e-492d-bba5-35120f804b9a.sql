-- Add missing columns to email_templates table
ALTER TABLE public.email_templates 
ADD COLUMN IF NOT EXISTS provider text DEFAULT 'brevo',
ADD COLUMN IF NOT EXISTS brevo_template_id text,
ADD COLUMN IF NOT EXISTS required_variables jsonb DEFAULT '[]'::jsonb;

-- Backfill provider column for existing records
UPDATE public.email_templates 
SET provider = 'brevo' 
WHERE provider IS NULL;