-- Add 'influenceur' to profile_type and app_role enums
ALTER TYPE profile_type ADD VALUE IF NOT EXISTS 'influenceur';
ALTER TYPE app_role ADD VALUE IF NOT EXISTS 'influenceur';

-- Create influencer_links table for tracking affiliate links
CREATE TABLE public.influencer_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  influencer_profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  code TEXT NOT NULL UNIQUE,
  name TEXT,
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  clicks_count INTEGER NOT NULL DEFAULT 0,
  conversions_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create affiliate_visits table for tracking clicks/visits
CREATE TABLE public.affiliate_visits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  link_id UUID NOT NULL REFERENCES public.influencer_links(id) ON DELETE CASCADE,
  session_id UUID NOT NULL DEFAULT gen_random_uuid(),
  visitor_ip INET,
  user_agent TEXT,
  referrer TEXT,
  page_url TEXT,
  country TEXT,
  city TEXT,
  visited_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create affiliate_conversions table for tracking user conversions
CREATE TABLE public.affiliate_conversions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  link_id UUID NOT NULL REFERENCES public.influencer_links(id) ON DELETE CASCADE,
  visit_id UUID REFERENCES public.affiliate_visits(id) ON DELETE SET NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  conversion_type TEXT NOT NULL CHECK (conversion_type IN ('registration', 'subscription', 'booking')),
  conversion_value DECIMAL(10,2),
  commission_rate DECIMAL(5,4) DEFAULT 0.05, -- 5% default commission
  commission_amount DECIMAL(10,2),
  conversion_status TEXT NOT NULL DEFAULT 'pending' CHECK (conversion_status IN ('pending', 'confirmed', 'paid', 'cancelled')),
  converted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  confirmed_at TIMESTAMP WITH TIME ZONE,
  paid_at TIMESTAMP WITH TIME ZONE
);

-- Create indexes for better performance
CREATE INDEX idx_influencer_links_profile ON public.influencer_links(influencer_profile_id);
CREATE INDEX idx_influencer_links_code ON public.influencer_links(code);
CREATE INDEX idx_affiliate_visits_link ON public.affiliate_visits(link_id);
CREATE INDEX idx_affiliate_visits_session ON public.affiliate_visits(session_id);
CREATE INDEX idx_affiliate_conversions_link ON public.affiliate_conversions(link_id);
CREATE INDEX idx_affiliate_conversions_user ON public.affiliate_conversions(user_id);

-- Enable RLS on new tables
ALTER TABLE public.influencer_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.affiliate_visits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.affiliate_conversions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for influencer_links
CREATE POLICY "Influencers can manage their own links" ON public.influencer_links
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.profiles p 
    WHERE p.id = influencer_links.influencer_profile_id 
    AND p.user_id = auth.uid()
  )
);

CREATE POLICY "Admins can manage all influencer links" ON public.influencer_links
FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Active links are viewable for tracking" ON public.influencer_links
FOR SELECT USING (is_active = true);

-- RLS Policies for affiliate_visits
CREATE POLICY "Anyone can insert visits for tracking" ON public.affiliate_visits
FOR INSERT WITH CHECK (true);

CREATE POLICY "Influencers can view visits to their links" ON public.affiliate_visits
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.influencer_links il
    JOIN public.profiles p ON p.id = il.influencer_profile_id
    WHERE il.id = affiliate_visits.link_id 
    AND p.user_id = auth.uid()
  )
);

CREATE POLICY "Admins can view all visits" ON public.affiliate_visits
FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies for affiliate_conversions
CREATE POLICY "System can insert conversions" ON public.affiliate_conversions
FOR INSERT WITH CHECK (true);

CREATE POLICY "Influencers can view their conversions" ON public.affiliate_conversions
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.influencer_links il
    JOIN public.profiles p ON p.id = il.influencer_profile_id
    WHERE il.id = affiliate_conversions.link_id 
    AND p.user_id = auth.uid()
  )
);

CREATE POLICY "Admins can manage all conversions" ON public.affiliate_conversions
FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- Create trigger for updating updated_at
CREATE TRIGGER update_influencer_links_updated_at
  BEFORE UPDATE ON public.influencer_links
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Function to generate unique affiliate codes
CREATE OR REPLACE FUNCTION public.generate_affiliate_code(base_name TEXT DEFAULT NULL)
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  code TEXT;
  counter INTEGER := 1;
  base_code TEXT;
BEGIN
  -- Create base code from name or random string
  IF base_name IS NOT NULL THEN
    base_code := upper(regexp_replace(base_name, '[^a-zA-Z0-9]', '', 'g'));
    base_code := left(base_code, 6);
  ELSE
    base_code := upper(substring(gen_random_uuid()::text, 1, 6));
  END IF;
  
  -- Ensure base_code is not empty
  IF length(base_code) = 0 THEN
    base_code := 'AFF';
  END IF;
  
  code := base_code;
  
  -- Check for conflicts and add counter if needed
  WHILE EXISTS (SELECT 1 FROM public.influencer_links WHERE code = code) LOOP
    counter := counter + 1;
    code := base_code || counter::TEXT;
  END LOOP;
  
  RETURN code;
END;
$$;

-- Function to track affiliate conversion
CREATE OR REPLACE FUNCTION public.track_affiliate_conversion(
  p_user_id UUID,
  p_conversion_type TEXT,
  p_conversion_value DECIMAL DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  visit_record RECORD;
  conversion_id UUID;
  commission DECIMAL;
BEGIN
  -- Find the most recent affiliate visit for this user's session
  SELECT av.*, il.id as link_id, il.influencer_profile_id
  INTO visit_record
  FROM public.affiliate_visits av
  JOIN public.influencer_links il ON il.id = av.link_id
  WHERE av.session_id IN (
    SELECT DISTINCT session_id 
    FROM public.affiliate_visits 
    WHERE visited_at > NOW() - INTERVAL '30 days'
  )
  AND il.is_active = true
  ORDER BY av.visited_at DESC
  LIMIT 1;
  
  IF visit_record.link_id IS NOT NULL THEN
    -- Calculate commission (5% default)
    commission := COALESCE(p_conversion_value * 0.05, 0);
    
    -- Insert conversion
    INSERT INTO public.affiliate_conversions (
      link_id,
      visit_id,
      user_id,
      conversion_type,
      conversion_value,
      commission_amount
    ) VALUES (
      visit_record.link_id,
      visit_record.id,
      p_user_id,
      p_conversion_type,
      p_conversion_value,
      commission
    ) RETURNING id INTO conversion_id;
    
    -- Update link stats
    UPDATE public.influencer_links 
    SET conversions_count = conversions_count + 1
    WHERE id = visit_record.link_id;
    
    RETURN conversion_id;
  END IF;
  
  RETURN NULL;
END;
$$;