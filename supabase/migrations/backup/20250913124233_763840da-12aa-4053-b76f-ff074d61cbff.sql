-- Add category and language columns to email_templates table
ALTER TABLE public.email_templates 
ADD COLUMN category text DEFAULT 'notifications',
ADD COLUMN language text DEFAULT 'fr';

-- Add check constraints for valid values
ALTER TABLE public.email_templates 
ADD CONSTRAINT email_templates_category_check 
CHECK (category IN ('notifications', 'artistes', 'lieux', 'agents'));

ALTER TABLE public.email_templates 
ADD CONSTRAINT email_templates_language_check 
CHECK (language IN ('fr', 'en'));

-- Update existing templates with default values
UPDATE public.email_templates 
SET category = 'notifications', language = 'fr' 
WHERE category IS NULL OR language IS NULL;