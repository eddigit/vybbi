-- Phase 1: Automatic VYBBI Token Attribution System
-- Welcome tokens, daily login rewards, profile completion, and referral integration

-- Function to award welcome tokens on user creation
CREATE OR REPLACE FUNCTION public.award_welcome_tokens()
RETURNS TRIGGER AS $$
BEGIN
  -- Award 100 VYBBI welcome tokens to new users
  PERFORM public.award_vybbi_tokens(
    NEW.id,
    100,
    'welcome_bonus',
    'Bienvenue sur VYBBI ! Voici vos premiers jetons pour commencer.',
    'user_registration',
    NEW.id
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to award welcome tokens when auth user is created
DROP TRIGGER IF EXISTS on_user_welcome_tokens ON auth.users;
CREATE TRIGGER on_user_welcome_tokens
  AFTER INSERT ON auth.users
  FOR EACH ROW 
  EXECUTE FUNCTION public.award_welcome_tokens();

-- Function to track and award daily login tokens
CREATE OR REPLACE FUNCTION public.award_daily_login_tokens(user_id_param UUID)
RETURNS BOOLEAN AS $$
DECLARE
  last_login_date DATE;
  today_date DATE := CURRENT_DATE;
BEGIN
  -- Get last login token date
  SELECT MAX(DATE(created_at)) INTO last_login_date
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to award profile completion tokens
CREATE OR REPLACE FUNCTION public.award_profile_completion_tokens()
RETURNS TRIGGER AS $$
DECLARE
  old_completion INTEGER := COALESCE(OLD.profile_completion_percentage, 0);
  new_completion INTEGER := COALESCE(NEW.profile_completion_percentage, 0);
  tokens_to_award INTEGER := 0;
BEGIN
  -- Award tokens for completion milestones
  IF old_completion < 25 AND new_completion >= 25 THEN
    tokens_to_award := tokens_to_award + 25; -- 25% completion
  END IF;
  
  IF old_completion < 50 AND new_completion >= 50 THEN
    tokens_to_award := tokens_to_award + 50; -- 50% completion
  END IF;
  
  IF old_completion < 75 AND new_completion >= 75 THEN
    tokens_to_award := tokens_to_award + 75; -- 75% completion
  END IF;
  
  IF old_completion < 100 AND new_completion >= 100 THEN
    tokens_to_award := tokens_to_award + 100; -- 100% completion
  END IF;
  
  -- Award accumulated tokens
  IF tokens_to_award > 0 THEN
    PERFORM public.award_vybbi_tokens(
      NEW.user_id,
      tokens_to_award,
      'profile_completion',
      format('Profil complété à %s%% ! +%s VYBBI', new_completion, tokens_to_award),
      'profile_milestone',
      NEW.id
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for profile completion rewards
DROP TRIGGER IF EXISTS on_profile_completion_tokens ON public.profiles;
CREATE TRIGGER on_profile_completion_tokens
  AFTER UPDATE ON public.profiles
  FOR EACH ROW 
  EXECUTE FUNCTION public.award_profile_completion_tokens();

-- Enhanced affiliate conversion tracking with VYBBI tokens
CREATE OR REPLACE FUNCTION public.track_affiliate_conversion(
  p_user_id UUID,
  p_conversion_type TEXT,
  p_conversion_value NUMERIC DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
  session_data JSONB;
  visit_record RECORD;
  link_record RECORD;
  referrer_user_id UUID;
  conversion_id UUID;
  result JSONB;
BEGIN
  -- This would typically get session data from the frontend
  -- For now, we'll look for recent visits by this user
  SELECT INTO visit_record *
  FROM public.affiliate_visits av
  JOIN public.influencer_links il ON il.id = av.link_id
  WHERE av.visited_at > NOW() - INTERVAL '7 days'
    AND il.is_active = true
  ORDER BY av.visited_at DESC
  LIMIT 1;
  
  IF visit_record.id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'No recent affiliate visit found');
  END IF;
  
  -- Get link details
  SELECT * INTO link_record FROM public.influencer_links WHERE id = visit_record.link_id;
  
  -- Get referrer user ID
  SELECT user_id INTO referrer_user_id 
  FROM public.profiles 
  WHERE id = link_record.influencer_profile_id;
  
  -- Create conversion record
  INSERT INTO public.affiliate_conversions (
    link_id, visit_id, user_id, conversion_type, conversion_value,
    commission_rate, commission_amount
  ) VALUES (
    visit_record.link_id,
    visit_record.id,
    p_user_id,
    p_conversion_type,
    COALESCE(p_conversion_value, 25.00), -- Default subscription value
    0.20, -- 20% commission rate
    COALESCE(p_conversion_value, 25.00) * 0.20
  ) RETURNING id INTO conversion_id;
  
  -- Award VYBBI tokens to referrer (200 VYBBI per conversion)
  IF referrer_user_id IS NOT NULL THEN
    PERFORM public.award_vybbi_tokens(
      referrer_user_id,
      200,
      'referral_reward',
      format('Parrainage réussi ! %s s''est inscrit via votre lien', 
        (SELECT display_name FROM profiles WHERE user_id = p_user_id LIMIT 1)),
      'affiliate_conversion',
      conversion_id
    );
  END IF;
  
  -- Award bonus tokens to referred user (50 VYBBI)
  PERFORM public.award_vybbi_tokens(
    p_user_id,
    50,
    'referral_bonus',
    'Bonus de parrainage ! Merci de nous avoir rejoint.',
    'referred_signup',
    conversion_id
  );
  
  result := jsonb_build_object(
    'success', true,
    'conversion_id', conversion_id,
    'referrer_user_id', referrer_user_id,
    'tokens_awarded', jsonb_build_object(
      'referrer', 200,
      'referred', 50
    )
  );
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to implement real marketplace purchase effects
CREATE OR REPLACE FUNCTION public.process_marketplace_purchase(
  purchase_user_id UUID,
  option_id UUID,
  tokens_spent NUMERIC
)
RETURNS JSONB AS $$
DECLARE
  option_record RECORD;
  user_profile_record RECORD;
  result JSONB := '{"effects_applied": []}'::JSONB;
BEGIN
  -- Get spending option details
  SELECT * INTO option_record FROM public.token_spending_options WHERE id = option_id;
  
  -- Get user profile
  SELECT * INTO user_profile_record FROM public.profiles WHERE user_id = purchase_user_id;
  
  IF option_record.id IS NULL OR user_profile_record.id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Invalid option or user');
  END IF;
  
  -- Apply effects based on option type
  CASE option_record.option_type
    WHEN 'visibility_boost' THEN
      -- Create or update visibility boost record
      INSERT INTO public.profile_boosts (
        profile_id, boost_type, multiplier, expires_at, created_by_purchase
      ) VALUES (
        user_profile_record.id,
        'visibility',
        2.0, -- 2x visibility multiplier
        NOW() + INTERVAL '1 day' * COALESCE(option_record.duration_days, 7),
        TRUE
      ) ON CONFLICT (profile_id, boost_type) 
      DO UPDATE SET 
        expires_at = GREATEST(profile_boosts.expires_at, EXCLUDED.expires_at),
        multiplier = GREATEST(profile_boosts.multiplier, EXCLUDED.multiplier);
      
      result := jsonb_set(result, '{effects_applied}', 
        result->'effects_applied' || '["visibility_boost_activated"]'::jsonb);
    
    WHEN 'premium_features' THEN
      -- Activate premium features
      INSERT INTO public.user_subscriptions (
        user_id, subscription_type, status, starts_at, expires_at, paid_with_tokens
      ) VALUES (
        purchase_user_id,
        'premium',
        'active',
        NOW(),
        NOW() + INTERVAL '1 day' * COALESCE(option_record.duration_days, 30),
        TRUE
      ) ON CONFLICT (user_id, subscription_type)
      DO UPDATE SET 
        expires_at = GREATEST(user_subscriptions.expires_at, EXCLUDED.expires_at),
        status = 'active';
      
      result := jsonb_set(result, '{effects_applied}', 
        result->'effects_applied' || '["premium_features_activated"]'::jsonb);
    
    WHEN 'radio_priority' THEN
      -- Add radio priority boost
      INSERT INTO public.artist_radio_subscriptions (
        artist_profile_id, subscription_type, priority_boost, expires_at, is_active
      ) VALUES (
        user_profile_record.id,
        'priority',
        5, -- +5 priority boost
        NOW() + INTERVAL '1 day' * COALESCE(option_record.duration_days, 7),
        TRUE
      ) ON CONFLICT (artist_profile_id, subscription_type)
      DO UPDATE SET 
        expires_at = GREATEST(artist_radio_subscriptions.expires_at, EXCLUDED.expires_at),
        priority_boost = GREATEST(artist_radio_subscriptions.priority_boost, EXCLUDED.priority_boost);
      
      result := jsonb_set(result, '{effects_applied}', 
        result->'effects_applied' || '["radio_priority_activated"]'::jsonb);
  END CASE;
  
  -- Create purchase record
  INSERT INTO public.token_purchases (
    user_id, option_id, tokens_spent, effects_applied, created_at
  ) VALUES (
    purchase_user_id, option_id, tokens_spent, result->'effects_applied', NOW()
  );
  
  RETURN jsonb_set(result, '{success}', 'true'::jsonb);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create necessary support tables
CREATE TABLE IF NOT EXISTS public.profile_boosts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  boost_type TEXT NOT NULL,
  multiplier DECIMAL(4,2) NOT NULL DEFAULT 1.0,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_by_purchase BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(profile_id, boost_type)
);

CREATE TABLE IF NOT EXISTS public.user_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subscription_type TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  starts_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  paid_with_tokens BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, subscription_type)
);

CREATE TABLE IF NOT EXISTS public.token_purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  option_id UUID NOT NULL REFERENCES public.token_spending_options(id),
  tokens_spent NUMERIC(18,6) NOT NULL,
  effects_applied JSONB DEFAULT '[]'::JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on new tables
ALTER TABLE public.profile_boosts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.token_purchases ENABLE ROW LEVEL SECURITY;

-- RLS Policies for new tables
CREATE POLICY "Users can view their own boosts" ON public.profile_boosts
FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = profile_boosts.profile_id AND user_id = auth.uid())
);

CREATE POLICY "Users can view their own subscriptions" ON public.user_subscriptions
FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Admins can manage all subscriptions" ON public.user_subscriptions
FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can view their own purchases" ON public.token_purchases
FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Admins can view all purchases" ON public.token_purchases
FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));