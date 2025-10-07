-- Fix search_path security issues for the new functions
CREATE OR REPLACE FUNCTION public.generate_affiliate_code(base_name TEXT DEFAULT NULL)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
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

-- Fix search_path security issues for the conversion tracking function
CREATE OR REPLACE FUNCTION public.track_affiliate_conversion(
  p_user_id UUID,
  p_conversion_type TEXT,
  p_conversion_value DECIMAL DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
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