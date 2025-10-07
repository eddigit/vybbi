-- Fix security warnings for VYBBI functions - set proper search_path

-- Fix search path for award_daily_login_tokens
CREATE OR REPLACE FUNCTION public.award_daily_login_tokens(user_id_param UUID)
RETURNS BOOLEAN 
LANGUAGE plpgsql 
SECURITY DEFINER 
SET search_path = public
AS $$
DECLARE
  last_login_date DATE;
  today_date DATE := CURRENT_DATE;
BEGIN
  -- Get last login token date
  SELECT MAX(DATE(processed_at)) INTO last_login_date
  FROM public.token_transactions
  WHERE user_id = user_id_param 
    AND reason = 'daily_login'
    AND transaction_type = 'earned';
  
  -- If no login today, award tokens
  IF last_login_date IS NULL OR last_login_date < today_date THEN
    PERFORM public.award_vybbi_tokens(
      user_id_param,
      10,
      'daily_login',
      'Connexion quotidienne récompensée !',
      'daily_activity',
      user_id_param
    );
    RETURN TRUE;
  END IF;
  
  RETURN FALSE;
END;
$$;

-- Fix search path for track_affiliate_conversion_with_tokens
CREATE OR REPLACE FUNCTION public.track_affiliate_conversion_with_tokens(
  p_user_id UUID,
  p_conversion_type TEXT,
  p_conversion_value NUMERIC DEFAULT 25.00
)
RETURNS JSONB 
LANGUAGE plpgsql 
SECURITY DEFINER 
SET search_path = public
AS $$
DECLARE
  recent_visit RECORD;
  referrer_user_id UUID;
  conversion_id UUID;
BEGIN
  -- Look for recent affiliate visit by this user
  SELECT av.*, il.influencer_profile_id INTO recent_visit
  FROM public.affiliate_visits av
  JOIN public.influencer_links il ON il.id = av.link_id
  WHERE av.visited_at > NOW() - INTERVAL '30 days'
    AND il.is_active = true
  ORDER BY av.visited_at DESC
  LIMIT 1;
  
  IF recent_visit.id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'No recent affiliate visit found');
  END IF;
  
  -- Get referrer user ID from influencer profile
  SELECT user_id INTO referrer_user_id 
  FROM public.profiles 
  WHERE id = recent_visit.influencer_profile_id;
  
  -- Create conversion record
  INSERT INTO public.affiliate_conversions (
    link_id, visit_id, user_id, conversion_type, conversion_value,
    commission_rate, commission_amount, conversion_status
  ) VALUES (
    recent_visit.link_id,
    recent_visit.id,
    p_user_id,
    p_conversion_type,
    p_conversion_value,
    0.20,
    p_conversion_value * 0.20,
    'confirmed'
  ) RETURNING id INTO conversion_id;
  
  -- Award VYBBI tokens to referrer (200 VYBBI per successful referral)
  IF referrer_user_id IS NOT NULL THEN
    PERFORM public.award_vybbi_tokens(
      referrer_user_id,
      200,
      'referral_reward',
      'Parrainage réussi ! Nouveau membre via votre lien (+200 VYBBI)',
      'affiliate_conversion',
      conversion_id
    );
  END IF;
  
  -- Award bonus tokens to referred user (50 VYBBI welcome bonus)
  PERFORM public.award_vybbi_tokens(
    p_user_id,
    50,
    'referral_bonus',
    'Bonus de parrainage ! Merci de nous avoir rejoint (+50 VYBBI)',
    'referred_signup',
    conversion_id
  );
  
  RETURN jsonb_build_object(
    'success', true,
    'conversion_id', conversion_id,
    'referrer_user_id', referrer_user_id,
    'tokens_awarded', jsonb_build_object(
      'referrer', 200,
      'referred', 50
    )
  );
END;
$$;