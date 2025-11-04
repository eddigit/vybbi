-- Phase 1: Infrastructure de Monétisation (Corrigée)

-- 1. Ajout des colonnes d'abonnement à la table profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS subscription_tier TEXT DEFAULT 'freemium' CHECK (subscription_tier IN ('freemium', 'solo', 'pro', 'elite')),
ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'active' CHECK (subscription_status IN ('active', 'cancelled', 'expired', 'trialing')),
ADD COLUMN IF NOT EXISTS trial_ends_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS subscription_started_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS subscription_expires_at TIMESTAMP WITH TIME ZONE;

-- Index pour optimiser les recherches par tier
CREATE INDEX IF NOT EXISTS idx_profiles_subscription_tier ON public.profiles(subscription_tier);
CREATE INDEX IF NOT EXISTS idx_profiles_subscription_status ON public.profiles(subscription_status);

-- 2. Table pour suivre l'historique des abonnements et paiements Stripe
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  stripe_subscription_id TEXT UNIQUE,
  stripe_customer_id TEXT,
  tier TEXT NOT NULL CHECK (tier IN ('freemium', 'solo', 'pro', 'elite')),
  status TEXT NOT NULL CHECK (status IN ('active', 'cancelled', 'expired', 'trialing', 'past_due')),
  current_period_start TIMESTAMP WITH TIME ZONE,
  current_period_end TIMESTAMP WITH TIME ZONE,
  cancel_at_period_end BOOLEAN DEFAULT false,
  cancelled_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON public.subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_subscription_id ON public.subscriptions(stripe_subscription_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_profile_id ON public.subscriptions(profile_id);

ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own subscriptions"
  ON public.subscriptions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all subscriptions"
  ON public.subscriptions FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- 3. Table de gestion des quotas mensuels par utilisateur
CREATE TABLE IF NOT EXISTS public.user_quotas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  quota_type TEXT NOT NULL CHECK (quota_type IN (
    'radio_submissions', 
    'offer_responses', 
    'conversations', 
    'social_posts', 
    'blockchain_certifications',
    'profile_boosts'
  )),
  quota_limit INTEGER NOT NULL DEFAULT 0,
  quota_used INTEGER NOT NULL DEFAULT 0,
  reset_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, quota_type, reset_at)
);

CREATE INDEX IF NOT EXISTS idx_user_quotas_user_id ON public.user_quotas(user_id);
CREATE INDEX IF NOT EXISTS idx_user_quotas_profile_id ON public.user_quotas(profile_id);
CREATE INDEX IF NOT EXISTS idx_user_quotas_type ON public.user_quotas(quota_type);
CREATE INDEX IF NOT EXISTS idx_user_quotas_reset_at ON public.user_quotas(reset_at);

ALTER TABLE public.user_quotas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own quotas"
  ON public.user_quotas FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "System can manage all quotas"
  ON public.user_quotas FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- 4. Table pour système de boost de profil (mise en avant)
CREATE TABLE IF NOT EXISTS public.profile_boosts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  boost_type TEXT NOT NULL CHECK (boost_type IN ('tier_based', 'manual', 'promotional')),
  boost_priority INTEGER NOT NULL DEFAULT 0,
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true,
  days_per_month INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_profile_boosts_profile_id ON public.profile_boosts(profile_id);
CREATE INDEX IF NOT EXISTS idx_profile_boosts_active ON public.profile_boosts(is_active, expires_at);
CREATE INDEX IF NOT EXISTS idx_profile_boosts_priority ON public.profile_boosts(boost_priority DESC);

ALTER TABLE public.profile_boosts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own boosts"
  ON public.profile_boosts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all boosts"
  ON public.profile_boosts FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- 5. Fonction pour initialiser les quotas d'un utilisateur selon son tier
CREATE OR REPLACE FUNCTION public.initialize_user_quotas(p_user_id UUID, p_profile_id UUID, p_tier TEXT)
RETURNS VOID AS $$
DECLARE
  next_reset_date TIMESTAMP WITH TIME ZONE;
BEGIN
  -- Calculer la date de reset (premier jour du mois prochain)
  next_reset_date := date_trunc('month', now() + INTERVAL '1 month');
  
  -- Supprimer les anciens quotas pour éviter les doublons
  DELETE FROM public.user_quotas WHERE user_id = p_user_id;
  
  -- Définir les quotas selon le tier
  CASE p_tier
    WHEN 'freemium' THEN
      INSERT INTO public.user_quotas (user_id, profile_id, quota_type, quota_limit, quota_used, reset_at)
      VALUES
        (p_user_id, p_profile_id, 'radio_submissions', 1, 0, next_reset_date),
        (p_user_id, p_profile_id, 'offer_responses', 5, 0, next_reset_date),
        (p_user_id, p_profile_id, 'conversations', 10, 0, next_reset_date),
        (p_user_id, p_profile_id, 'social_posts', 5, 0, next_reset_date),
        (p_user_id, p_profile_id, 'blockchain_certifications', 0, 0, next_reset_date);
    
    WHEN 'solo' THEN
      INSERT INTO public.user_quotas (user_id, profile_id, quota_type, quota_limit, quota_used, reset_at)
      VALUES
        (p_user_id, p_profile_id, 'radio_submissions', 3, 0, next_reset_date),
        (p_user_id, p_profile_id, 'offer_responses', 999999, 0, next_reset_date),
        (p_user_id, p_profile_id, 'conversations', 999999, 0, next_reset_date),
        (p_user_id, p_profile_id, 'social_posts', 999999, 0, next_reset_date),
        (p_user_id, p_profile_id, 'blockchain_certifications', 0, 0, next_reset_date),
        (p_user_id, p_profile_id, 'profile_boosts', 2, 0, next_reset_date);
    
    WHEN 'pro' THEN
      INSERT INTO public.user_quotas (user_id, profile_id, quota_type, quota_limit, quota_used, reset_at)
      VALUES
        (p_user_id, p_profile_id, 'radio_submissions', 10, 0, next_reset_date),
        (p_user_id, p_profile_id, 'offer_responses', 999999, 0, next_reset_date),
        (p_user_id, p_profile_id, 'conversations', 999999, 0, next_reset_date),
        (p_user_id, p_profile_id, 'social_posts', 999999, 0, next_reset_date),
        (p_user_id, p_profile_id, 'blockchain_certifications', 5, 0, next_reset_date),
        (p_user_id, p_profile_id, 'profile_boosts', 7, 0, next_reset_date);
    
    WHEN 'elite' THEN
      INSERT INTO public.user_quotas (user_id, profile_id, quota_type, quota_limit, quota_used, reset_at)
      VALUES
        (p_user_id, p_profile_id, 'radio_submissions', 999999, 0, next_reset_date),
        (p_user_id, p_profile_id, 'offer_responses', 999999, 0, next_reset_date),
        (p_user_id, p_profile_id, 'conversations', 999999, 0, next_reset_date),
        (p_user_id, p_profile_id, 'social_posts', 999999, 0, next_reset_date),
        (p_user_id, p_profile_id, 'blockchain_certifications', 999999, 0, next_reset_date),
        (p_user_id, p_profile_id, 'profile_boosts', 999999, 0, next_reset_date);
  END CASE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Fonction pour vérifier si un utilisateur peut utiliser une fonctionnalité (quota check)
CREATE OR REPLACE FUNCTION public.check_quota(p_user_id UUID, p_quota_type TEXT)
RETURNS JSONB AS $$
DECLARE
  quota_record RECORD;
  result JSONB;
BEGIN
  SELECT * INTO quota_record
  FROM public.user_quotas
  WHERE user_id = p_user_id 
    AND quota_type = p_quota_type
    AND reset_at > now()
  ORDER BY created_at DESC
  LIMIT 1;
  
  IF quota_record IS NULL THEN
    DECLARE
      user_profile_id UUID;
      user_tier TEXT;
    BEGIN
      SELECT id, subscription_tier INTO user_profile_id, user_tier
      FROM public.profiles WHERE user_id = p_user_id LIMIT 1;
      
      IF user_profile_id IS NOT NULL THEN
        PERFORM public.initialize_user_quotas(p_user_id, user_profile_id, COALESCE(user_tier, 'freemium'));
        
        SELECT * INTO quota_record
        FROM public.user_quotas
        WHERE user_id = p_user_id AND quota_type = p_quota_type
        ORDER BY created_at DESC LIMIT 1;
      END IF;
    END;
  END IF;
  
  IF quota_record IS NULL THEN
    result := jsonb_build_object(
      'allowed', false,
      'reason', 'No quota configuration found',
      'quota_used', 0,
      'quota_limit', 0
    );
  ELSIF quota_record.quota_used >= quota_record.quota_limit THEN
    result := jsonb_build_object(
      'allowed', false,
      'reason', 'Quota exceeded',
      'quota_used', quota_record.quota_used,
      'quota_limit', quota_record.quota_limit,
      'reset_at', quota_record.reset_at
    );
  ELSE
    result := jsonb_build_object(
      'allowed', true,
      'quota_used', quota_record.quota_used,
      'quota_limit', quota_record.quota_limit,
      'remaining', quota_record.quota_limit - quota_record.quota_used,
      'reset_at', quota_record.reset_at
    );
  END IF;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. Fonction pour incrémenter l'utilisation d'un quota
CREATE OR REPLACE FUNCTION public.increment_quota(p_user_id UUID, p_quota_type TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  quota_check JSONB;
BEGIN
  quota_check := public.check_quota(p_user_id, p_quota_type);
  
  IF (quota_check->>'allowed')::BOOLEAN = false THEN
    RETURN false;
  END IF;
  
  UPDATE public.user_quotas
  SET quota_used = quota_used + 1,
      updated_at = now()
  WHERE user_id = p_user_id 
    AND quota_type = p_quota_type
    AND reset_at > now();
  
  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. Fonction pour activer le boost d'un profil selon son tier
CREATE OR REPLACE FUNCTION public.activate_tier_boost(p_profile_id UUID)
RETURNS VOID AS $$
DECLARE
  profile_record RECORD;
  boost_priority INTEGER;
  boost_days INTEGER;
  boost_expires TIMESTAMP WITH TIME ZONE;
BEGIN
  SELECT * INTO profile_record
  FROM public.profiles
  WHERE id = p_profile_id;
  
  IF profile_record IS NULL THEN
    RETURN;
  END IF;
  
  CASE profile_record.subscription_tier
    WHEN 'freemium' THEN
      RETURN;
    WHEN 'solo' THEN
      boost_priority := 10;
      boost_days := 2;
      boost_expires := now() + INTERVAL '2 days';
    WHEN 'pro' THEN
      boost_priority := 50;
      boost_days := 7;
      boost_expires := now() + INTERVAL '7 days';
    WHEN 'elite' THEN
      boost_priority := 100;
      boost_days := NULL;
      boost_expires := NULL;
    ELSE
      RETURN;
  END CASE;
  
  UPDATE public.profile_boosts
  SET is_active = false
  WHERE profile_id = p_profile_id AND boost_type = 'tier_based';
  
  INSERT INTO public.profile_boosts (
    profile_id, user_id, boost_type, boost_priority, 
    started_at, expires_at, days_per_month, is_active
  ) VALUES (
    p_profile_id, profile_record.user_id, 'tier_based', boost_priority,
    now(), boost_expires, boost_days, true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 9. Trigger pour activer automatiquement le boost quand subscription_tier change
CREATE OR REPLACE FUNCTION public.handle_subscription_tier_change()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.subscription_tier != OLD.subscription_tier OR OLD.subscription_tier IS NULL THEN
    PERFORM public.initialize_user_quotas(NEW.user_id, NEW.id, NEW.subscription_tier);
    PERFORM public.activate_tier_boost(NEW.id);
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trigger_subscription_tier_change
  AFTER INSERT OR UPDATE OF subscription_tier ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_subscription_tier_change();

-- 10. Fonction pour obtenir les profils boostés actifs
CREATE OR REPLACE FUNCTION public.is_profile_boosted(p_profile_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profile_boosts
    WHERE profile_id = p_profile_id
      AND is_active = true
      AND (expires_at IS NULL OR expires_at > now())
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Initialiser les quotas UNIQUEMENT pour les profils qui ont un user_id valide dans auth.users
DO $$
DECLARE
  profile_rec RECORD;
BEGIN
  FOR profile_rec IN 
    SELECT p.id, p.user_id, p.subscription_tier 
    FROM public.profiles p
    INNER JOIN auth.users u ON u.id = p.user_id
    WHERE p.subscription_tier IS NOT NULL
  LOOP
    PERFORM public.initialize_user_quotas(
      profile_rec.user_id, 
      profile_rec.id, 
      COALESCE(profile_rec.subscription_tier, 'freemium')
    );
  END LOOP;
END $$;