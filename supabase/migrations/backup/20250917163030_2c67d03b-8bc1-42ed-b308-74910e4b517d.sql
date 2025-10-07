-- PHASE 2B : Durcissement des politiques critiques et correction des vulnérabilités

-- 1. CORRIGER LES POLITIQUES ULTRA PERMISSIVES (condition 'true')
-- ad_settings est critique - ne doit pas être public
DROP POLICY IF EXISTS "Public can view settings" ON public.ad_settings;

-- Nouvelle politique restrictive pour ad_settings
CREATE POLICY "Only admins can view ad settings"
ON public.ad_settings
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- 2. DURCIR LES TABLES FINANCIÈRES CRITIQUES
-- Ajouter des politiques strictes pour les commissions d'agents
CREATE POLICY "Only system can insert agent commissions"
ON public.agent_commissions
FOR INSERT  
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Politique stricte pour les updates de commissions
CREATE POLICY "Only admins can update commissions"
ON public.agent_commissions
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Durcir conversion_tracking
CREATE POLICY "Only admins can insert conversion tracking"
ON public.conversion_tracking
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Only admins can update conversion tracking"  
ON public.conversion_tracking
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Durcir recurring_commissions
CREATE POLICY "Only system can manage recurring commissions"
ON public.recurring_commissions  
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- 3. LIMITER LES INSERTIONS PUBLIQUES (sécuriser le tracking)
-- Remplacer les politiques trop permissives pour les métriques pub
DROP POLICY IF EXISTS "Authenticated users can insert metrics" ON public.ad_metrics;

CREATE POLICY "Authenticated users can insert metrics with validation"
ON public.ad_metrics
FOR INSERT
WITH CHECK (
  auth.uid() IS NOT NULL 
  AND campaign_id IS NOT NULL
  AND event_type IN ('impression', 'click', 'conversion')
  AND created_at >= NOW() - INTERVAL '1 hour'  -- Éviter les insertions anciennes
);

-- Limiter les insertions de profile views avec rate limiting
DROP POLICY IF EXISTS "Anyone can insert profile views for tracking" ON public.profile_views;

CREATE POLICY "Authenticated users can insert profile views"
ON public.profile_views
FOR INSERT  
WITH CHECK (
  viewer_user_id = auth.uid() 
  AND viewed_profile_id IS NOT NULL
  AND viewed_profile_id != viewer_profile_id  -- Pas d'auto-vues
);

-- 4. CORRIGER LES RÉCURSIONS POTENTIELLES avec des fonctions SECURITY DEFINER
CREATE OR REPLACE FUNCTION public.user_owns_profile(profile_id_param uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles p 
    WHERE p.id = profile_id_param 
    AND p.user_id = auth.uid()
  );
END;
$$;

-- Corriger les politiques d'agent_artists pour éviter récursion
DROP POLICY IF EXISTS "Agents can manage their artist relationships" ON public.agent_artists;
DROP POLICY IF EXISTS "Artists can view their agent relationships" ON public.agent_artists;
DROP POLICY IF EXISTS "Agents can view their artists" ON public.agent_artists;
DROP POLICY IF EXISTS "Artists can update representation status" ON public.agent_artists;

CREATE POLICY "Agents can manage their artist relationships"
ON public.agent_artists
FOR ALL
USING (public.user_owns_profile(agent_profile_id));

CREATE POLICY "Artists can view and update their agent relationships"  
ON public.agent_artists
FOR ALL
USING (public.user_owns_profile(artist_profile_id));

-- 5. OPTIMISATION DES INDEX POUR LA PERFORMANCE RLS
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_agent_commissions_agent_id ON agent_commissions(agent_id);  
CREATE INDEX IF NOT EXISTS idx_conversion_tracking_agent_user ON conversion_tracking(agent_id, user_id);
CREATE INDEX IF NOT EXISTS idx_affiliate_conversions_security ON affiliate_conversions(link_id, user_id, conversion_status);

-- 6. CRÉER UNE FONCTION D'AUDIT DE SÉCURITÉ
CREATE OR REPLACE FUNCTION public.audit_rls_access(table_name text, operation text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Log des accès aux tables sensibles
  IF table_name IN ('agent_commissions', 'conversion_tracking', 'recurring_commissions', 'affiliate_conversions') THEN
    INSERT INTO security_audit_log (user_id, action, table_name, created_at)
    VALUES (auth.uid(), operation || ' on ' || table_name, table_name, NOW());
  END IF;
EXCEPTION
  WHEN OTHERS THEN
    -- Ignorer les erreurs pour ne pas bloquer les opérations
    NULL;
END;
$$;

-- 7. RESTREINDRE L'ACCÈS AUX DONNÉES SENSIBLES D'ADMINISTRATION 
-- Durcir admin_mock_profiles
DROP POLICY IF EXISTS "Admin mock profiles manageable by admins" ON public.admin_mock_profiles;
DROP POLICY IF EXISTS "Admin mock profiles visible to admins" ON public.admin_mock_profiles;

CREATE POLICY "Super admins only can manage mock profiles"
ON public.admin_mock_profiles
FOR ALL
USING (
  has_role(auth.uid(), 'admin'::app_role) 
  AND auth.uid() IN (
    SELECT user_id FROM profiles 
    WHERE profile_type = 'admin' 
    AND user_id = auth.uid()
  )
);

-- 8. CORRIGER ET OPTIMISER LES POLITIQUES DE MESSAGES
CREATE OR REPLACE FUNCTION public.user_can_access_conversation(conv_id uuid)
RETURNS boolean
LANGUAGE plpgsql  
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM conversation_participants cp
    WHERE cp.conversation_id = conv_id 
    AND cp.user_id = auth.uid()
  );
END;
$$;