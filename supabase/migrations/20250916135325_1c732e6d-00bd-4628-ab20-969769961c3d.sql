-- Fix search_path for the newly created functions
CREATE OR REPLACE FUNCTION public.track_affiliate_visit(
  p_affiliate_code text,
  p_session_id uuid,
  p_user_agent text DEFAULT NULL,
  p_referrer text DEFAULT NULL,
  p_page_url text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  link_record RECORD;
  visit_id UUID;
  result jsonb;
BEGIN
  -- Find the affiliate link
  SELECT id, clicks_count, influencer_profile_id
  INTO link_record
  FROM public.influencer_links
  WHERE code = p_affiliate_code 
    AND is_active = true;
    
  IF link_record.id IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Invalid or inactive affiliate code'
    );
  END IF;
  
  -- Check if visit already exists for this session
  IF EXISTS (
    SELECT 1 FROM public.affiliate_visits 
    WHERE session_id = p_session_id 
      AND link_id = link_record.id
  ) THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Visit already tracked for this session'
    );
  END IF;
  
  -- Insert the visit
  INSERT INTO public.affiliate_visits (
    link_id,
    session_id,
    user_agent,
    referrer,
    page_url
  ) VALUES (
    link_record.id,
    p_session_id,
    p_user_agent,
    p_referrer,
    p_page_url
  ) RETURNING id INTO visit_id;
  
  -- Update clicks count atomically
  UPDATE public.influencer_links 
  SET clicks_count = COALESCE(clicks_count, 0) + 1,
      updated_at = now()
  WHERE id = link_record.id;
  
  RETURN jsonb_build_object(
    'success', true,
    'visit_id', visit_id,
    'link_id', link_record.id,
    'clicks_count', COALESCE(link_record.clicks_count, 0) + 1
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.update_affiliate_clicks_on_visit()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Update the clicks count for the link
  UPDATE public.influencer_links 
  SET clicks_count = COALESCE(clicks_count, 0) + 1,
      updated_at = now()
  WHERE id = NEW.link_id;
  
  RETURN NEW;
END;
$$;