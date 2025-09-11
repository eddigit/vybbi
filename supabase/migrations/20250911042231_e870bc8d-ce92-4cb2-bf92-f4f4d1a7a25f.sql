-- Create ad campaigns table
CREATE TABLE public.ad_campaigns (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  target_url TEXT,
  placement_type TEXT NOT NULL CHECK (placement_type IN ('header', 'sidebar_left', 'sidebar_right', 'banner_top', 'banner_bottom')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

-- Create ad assets table
CREATE TABLE public.ad_assets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  campaign_id UUID NOT NULL REFERENCES public.ad_campaigns(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_size INTEGER,
  width INTEGER,
  height INTEGER,
  alt_text TEXT,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create ad metrics table for tracking
CREATE TABLE public.ad_metrics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  campaign_id UUID NOT NULL REFERENCES public.ad_campaigns(id) ON DELETE CASCADE,
  asset_id UUID REFERENCES public.ad_assets(id) ON DELETE SET NULL,
  event_type TEXT NOT NULL CHECK (event_type IN ('impression', 'click')),
  user_id UUID REFERENCES auth.users(id),
  ip_address INET,
  user_agent TEXT,
  page_url TEXT,
  referrer TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create ad settings table for global configuration
CREATE TABLE public.ad_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  setting_key TEXT NOT NULL UNIQUE,
  setting_value JSONB NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_by UUID REFERENCES auth.users(id)
);

-- Enable RLS on all tables
ALTER TABLE public.ad_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ad_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ad_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ad_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for ad_campaigns
CREATE POLICY "Admins can manage all campaigns" ON public.ad_campaigns
  FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Public can view active campaigns" ON public.ad_campaigns
  FOR SELECT USING (is_active = true AND start_date <= CURRENT_DATE AND end_date >= CURRENT_DATE);

-- RLS Policies for ad_assets
CREATE POLICY "Admins can manage all assets" ON public.ad_assets
  FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Public can view assets for active campaigns" ON public.ad_assets
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM public.ad_campaigns c 
    WHERE c.id = ad_assets.campaign_id 
    AND c.is_active = true 
    AND c.start_date <= CURRENT_DATE 
    AND c.end_date >= CURRENT_DATE
  ));

-- RLS Policies for ad_metrics
CREATE POLICY "Admins can view all metrics" ON public.ad_metrics
  FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Anyone can insert metrics" ON public.ad_metrics
  FOR INSERT WITH CHECK (true);

-- RLS Policies for ad_settings
CREATE POLICY "Admins can manage settings" ON public.ad_settings
  FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Public can view settings" ON public.ad_settings
  FOR SELECT USING (true);

-- Create indexes for performance
CREATE INDEX idx_ad_campaigns_active_dates ON public.ad_campaigns(is_active, start_date, end_date);
CREATE INDEX idx_ad_campaigns_placement ON public.ad_campaigns(placement_type);
CREATE INDEX idx_ad_assets_campaign ON public.ad_assets(campaign_id);
CREATE INDEX idx_ad_metrics_campaign ON public.ad_metrics(campaign_id);
CREATE INDEX idx_ad_metrics_created_at ON public.ad_metrics(created_at);

-- Add triggers for updated_at
CREATE TRIGGER update_ad_campaigns_updated_at
  BEFORE UPDATE ON public.ad_campaigns
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_ad_settings_updated_at
  BEFORE UPDATE ON public.ad_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default ad settings
INSERT INTO public.ad_settings (setting_key, setting_value) VALUES 
('ads_enabled', '{"enabled": false}'),
('header_ads_enabled', '{"enabled": true}'),
('sidebar_ads_enabled', '{"enabled": true}');

-- Create storage bucket for ad assets
INSERT INTO storage.buckets (id, name, public) VALUES ('ad-assets', 'ad-assets', true);

-- Create storage policies for ad assets
CREATE POLICY "Ad assets are publicly accessible" ON storage.objects
  FOR SELECT USING (bucket_id = 'ad-assets');

CREATE POLICY "Admins can upload ad assets" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'ad-assets' 
    AND has_role(auth.uid(), 'admin'::app_role)
  );

CREATE POLICY "Admins can update ad assets" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'ad-assets' 
    AND has_role(auth.uid(), 'admin'::app_role)
  );

CREATE POLICY "Admins can delete ad assets" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'ad-assets' 
    AND has_role(auth.uid(), 'admin'::app_role)
  );