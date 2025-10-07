-- Add missing columns to ad_campaigns table
ALTER TABLE public.ad_campaigns 
ADD COLUMN IF NOT EXISTS advertiser text,
ADD COLUMN IF NOT EXISTS daily_window_start time,
ADD COLUMN IF NOT EXISTS daily_window_end time,
ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'draft';

-- Create ad_slots table for managing ad placements
CREATE TABLE IF NOT EXISTS public.ad_slots (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  code text NOT NULL UNIQUE,
  name text NOT NULL,
  width integer,
  height integer,
  allowed_formats text[] DEFAULT ARRAY['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml'],
  hide_if_empty boolean DEFAULT true,
  is_enabled boolean DEFAULT true,
  page_type text NOT NULL DEFAULT 'public', -- 'public' for non-connected pages, 'user' for connected user pages
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create ad_campaign_slots for mapping campaigns to slots
CREATE TABLE IF NOT EXISTS public.ad_campaign_slots (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  campaign_id uuid NOT NULL REFERENCES public.ad_campaigns(id) ON DELETE CASCADE,
  slot_id uuid NOT NULL REFERENCES public.ad_slots(id) ON DELETE CASCADE,
  weight integer DEFAULT 1,
  priority integer DEFAULT 0,
  is_enabled boolean DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(campaign_id, slot_id)
);

-- Enable RLS on new tables
ALTER TABLE public.ad_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ad_campaign_slots ENABLE ROW LEVEL SECURITY;

-- RLS policies for ad_slots
CREATE POLICY "Admins can manage all slots" 
ON public.ad_slots 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Public can view enabled slots" 
ON public.ad_slots 
FOR SELECT 
USING (is_enabled = true);

-- RLS policies for ad_campaign_slots
CREATE POLICY "Admins can manage all campaign slots" 
ON public.ad_campaign_slots 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Public can view enabled campaign slots" 
ON public.ad_campaign_slots 
FOR SELECT 
USING (
  is_enabled = true 
  AND EXISTS (
    SELECT 1 FROM public.ad_slots s 
    WHERE s.id = ad_campaign_slots.slot_id AND s.is_enabled = true
  )
  AND EXISTS (
    SELECT 1 FROM public.ad_campaigns c 
    WHERE c.id = ad_campaign_slots.campaign_id 
    AND c.is_active = true 
    AND c.start_date <= CURRENT_DATE 
    AND c.end_date >= CURRENT_DATE
  )
);

-- Create triggers for updated_at
CREATE TRIGGER update_ad_slots_updated_at
BEFORE UPDATE ON public.ad_slots
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert initial slots
INSERT INTO public.ad_slots (code, name, width, height, page_type, is_enabled, hide_if_empty) 
VALUES 
  ('ADS-LANDING-LEFT', 'Landing Page - Left Sidebar', 300, 600, 'public', true, true),
  ('ADS-LANDING-RIGHT', 'Landing Page - Right Sidebar', 300, 600, 'public', true, true),
  ('ADS-DASHBOARD-HEADER', 'Dashboard - Header Banner', 728, 90, 'user', true, true),
  ('ADS-DASHBOARD-SIDEBAR', 'Dashboard - Sidebar', 300, 250, 'user', true, true)
ON CONFLICT (code) DO NOTHING;

-- Insert global ad settings
INSERT INTO public.ad_settings (setting_key, setting_value) 
VALUES (
  'ads.global', 
  '{"enabled": true, "frequency_cap_per_session": 1, "click_throttle_ms": 2000, "hide_breakpoint": "xl"}'::jsonb
)
ON CONFLICT (setting_key) DO UPDATE SET 
  setting_value = EXCLUDED.setting_value,
  updated_at = now();