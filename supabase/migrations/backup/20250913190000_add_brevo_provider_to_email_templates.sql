-- Add provider and Brevo template support to email_templates
ALTER TABLE public.email_templates
  ADD COLUMN IF NOT EXISTS provider TEXT NOT NULL DEFAULT 'internal' CHECK (provider IN ('internal', 'brevo')),
  ADD COLUMN IF NOT EXISTS brevo_template_id INTEGER,
  ADD COLUMN IF NOT EXISTS required_variables JSONB DEFAULT '[]'::jsonb;

-- Optional: backfill provider to 'internal' where null
UPDATE public.email_templates SET provider = 'internal' WHERE provider IS NULL;

-- Comments for documentation
COMMENT ON COLUMN public.email_templates.provider IS 'Template provider: internal (HTML stored) or brevo (remote template by ID)';
COMMENT ON COLUMN public.email_templates.brevo_template_id IS 'Brevo template numerical ID when provider=brevo';
COMMENT ON COLUMN public.email_templates.required_variables IS 'Array of required variables (placeholders) for validation';
