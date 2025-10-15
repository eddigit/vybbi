-- Add GA4 Property ID to admin settings
INSERT INTO admin_settings (setting_key, setting_value, description)
VALUES (
  'ga4_property_id',
  '"464099935"'::jsonb,
  'Google Analytics 4 Property ID for API integration'
)
ON CONFLICT (setting_key) DO UPDATE 
SET 
  setting_value = '"464099935"'::jsonb,
  description = 'Google Analytics 4 Property ID for API integration',
  updated_at = now();