-- Insert missing left sidebar ad slot for landing page
INSERT INTO ad_slots (
  code,
  name,
  page_type,
  width,
  height,
  is_enabled,
  hide_if_empty,
  allowed_formats
) 
VALUES (
  'ADS-LANDING-LEFT',
  'Landing Page - Left Sidebar', 
  'public',
  300,
  600,
  true,
  true,
  ARRAY['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml']
) 
ON CONFLICT (code) DO NOTHING;