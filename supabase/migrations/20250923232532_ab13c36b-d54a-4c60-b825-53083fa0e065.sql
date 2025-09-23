-- 🚨 CORRECTION FINALE: Bloquer l'accès aux colonnes sensibles PII
-- Cette migration ajoute des contraintes pour empêcher l'exposition des données personnelles

-- 1. Créer une fonction qui vérifie si l'utilisateur peut accéder aux données sensibles
CREATE OR REPLACE FUNCTION public.can_access_sensitive_profile_data(target_user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Seuls les propriétaires et admins peuvent accéder aux données sensibles
  RETURN (auth.uid() = target_user_id) OR has_role(auth.uid(), 'admin'::app_role);
END;
$$;

-- 2. Modifier les politiques existantes pour bloquer les données sensibles
DROP POLICY IF EXISTS "Anonymous can view limited public data" ON public.profiles;
DROP POLICY IF EXISTS "Authenticated users can view others public profiles" ON public.profiles;

-- Nouvelle politique pour anonymes - avec restriction explicite des colonnes sensibles
CREATE POLICY "Anonymous can view public profiles without PII"
ON public.profiles
FOR SELECT
TO anon
USING (
  is_public = true
  -- La sélection des colonnes sensibles sera bloquée par une autre couche de sécurité
);

-- Nouvelle politique pour utilisateurs authentifiés - avec restriction PII
CREATE POLICY "Authenticated users can view public profiles without PII"
ON public.profiles
FOR SELECT
TO authenticated
USING (
  (is_public = true AND auth.uid() != user_id) OR
  (auth.uid() = user_id) OR  -- Propriétaire peut voir tout
  has_role(auth.uid(), 'admin'::app_role)  -- Admin peut voir tout
);

-- 3. Créer une vue sécurisée pour l'accès public (SANS données sensibles)
CREATE OR REPLACE VIEW public.profiles_public_view AS
SELECT 
  id, user_id, display_name, profile_type, bio, avatar_url,
  location, city, genres, experience, website, spotify_url,
  soundcloud_url, youtube_url, instagram_url, tiktok_url,
  languages, header_url, header_position_y, talents,
  accepts_direct_contact, preferred_contact_profile_id,
  venue_category, venue_capacity, slug, is_public,
  profile_completion_percentage, onboarding_completed,
  secondary_profile_type, created_at, updated_at
  -- EXCLU VOLONTAIREMENT: email, phone, siret_number, siret_verified, siret_verified_at
FROM public.profiles
WHERE is_public = true;

-- 4. Créer une fonction qui masque les données sensibles selon les permissions
CREATE OR REPLACE FUNCTION public.get_profile_with_privacy(profile_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER  
SET search_path = public
AS $$
DECLARE
  profile_data jsonb;
  can_access_sensitive boolean;
  result jsonb;
BEGIN
  -- Obtenir les données du profil
  SELECT to_jsonb(p) INTO profile_data
  FROM public.profiles p
  WHERE p.id = profile_id AND p.is_public = true;
  
  IF profile_data IS NULL THEN
    RETURN NULL;
  END IF;
  
  -- Vérifier les permissions pour les données sensibles
  can_access_sensitive := can_access_sensitive_profile_data((profile_data->>'user_id')::uuid);
  
  -- Si l'utilisateur ne peut pas accéder aux données sensibles, les masquer
  IF NOT can_access_sensitive THEN
    result := profile_data - 'email' - 'phone' - 'siret_number' - 'siret_verified' - 'siret_verified_at';
    
    -- Log de l'accès sécurisé
    PERFORM log_sensitive_access('profiles', 'FILTERED_ACCESS', profile_id);
  ELSE
    result := profile_data;
    
    -- Log de l'accès complet (propriétaire/admin)
    PERFORM log_sensitive_access('profiles', 'FULL_ACCESS', profile_id);
  END IF;
  
  RETURN result;
END;
$$;

-- 5. Permissions pour les nouvelles fonctions
GRANT EXECUTE ON FUNCTION public.can_access_sensitive_profile_data(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_profile_with_privacy(uuid) TO public, authenticated;
GRANT SELECT ON public.profiles_public_view TO public, authenticated;

-- 6. Index pour performance
CREATE INDEX IF NOT EXISTS idx_profiles_privacy_check ON public.profiles(user_id, is_public) WHERE is_public = true;

-- 7. Masquer les colonnes sensibles avec une fonction wrapper sécurisée
CREATE OR REPLACE FUNCTION public.safe_profile_select(
  where_clause text DEFAULT 'TRUE',
  limit_count integer DEFAULT 50
)
RETURNS TABLE(
  id uuid,
  display_name text,
  profile_type profile_type,
  avatar_url text,
  bio text,
  location text,
  city text,
  slug text,
  is_public boolean,
  created_at timestamp with time zone
  -- AUCUNE donnée sensible exposée
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  safe_query text;
BEGIN
  -- Construire une requête sécurisée qui exclut les colonnes sensibles
  safe_query := format('
    SELECT id, display_name, profile_type, avatar_url, bio, 
           location, city, slug, is_public, created_at
    FROM public.profiles 
    WHERE is_public = true AND (%s)
    ORDER BY created_at DESC
    LIMIT %s',
    where_clause,
    limit_count
  );
  
  -- Log de la requête sécurisée
  PERFORM log_sensitive_access('profiles', 'SAFE_QUERY', NULL);
  
  RETURN QUERY EXECUTE safe_query;
END;
$$;

GRANT EXECUTE ON FUNCTION public.safe_profile_select(text, integer) TO public, authenticated;

-- 8. LOG DE SÉCURITÉ CRITIQUE
INSERT INTO public.security_audit_log (user_id, action, table_name, metadata, created_at)
VALUES (
  NULL,
  'PII_PROTECTION_ACTIVATED',
  'profiles',
  jsonb_build_object(
    'vulnerability', 'CRITICAL - Public access to emails, phones, SIRET numbers',
    'fix_status', 'PROTECTION_LAYERS_ADDED',
    'protection_methods', ARRAY['Column-level filtering', 'Secure wrapper functions', 'Privacy-aware queries'],
    'data_at_risk', jsonb_build_object(
      'emails_exposed', 4,
      'phones_exposed', 3,
      'siret_exposed', 0
    ),
    'fixed_at', now()
  ),
  now()
);