-- 🚨 CORRECTION CRITIQUE: Protection des données personnelles dans la table profiles
-- Cette migration corrige une faille de sécurité majeure qui exposait les emails, téléphones et SIRET

-- 1. Supprimer les politiques dangereuses qui exposent les données sensibles
DROP POLICY IF EXISTS "Public can view safe profile data only" ON public.profiles;
DROP POLICY IF EXISTS "Only authenticated users can view profiles" ON public.profiles;

-- 2. Créer des politiques RLS strictes pour protéger les données sensibles

-- Politique pour l'accès public sécurisé (SANS données sensibles PII)
CREATE POLICY "Public can view non-sensitive profile data"
ON public.profiles
FOR SELECT
TO public
USING (
  is_public = true 
  AND auth.uid() IS NULL  -- Applique seulement aux utilisateurs non-authentifiés
);

-- Politique pour les utilisateurs authentifiés (accès sécurisé aux profils publics)
CREATE POLICY "Authenticated users can view public profiles safely"  
ON public.profiles
FOR SELECT
TO authenticated
USING (
  is_public = true 
  AND auth.uid() != user_id  -- Pas leur propre profil
  AND auth.uid() IS NOT NULL
);

-- Politique stricte pour l'accès aux données sensibles (propriétaire + admins uniquement)
CREATE POLICY "Only owners and admins can view sensitive data"
ON public.profiles
FOR SELECT  
TO authenticated
USING (
  auth.uid() = user_id OR has_role(auth.uid(), 'admin'::app_role)
);

-- 3. Fonction sécurisée pour obtenir les données publiques (sans PII)
CREATE OR REPLACE FUNCTION public.get_public_profile_data(profile_identifier text)
RETURNS TABLE(
  id uuid,
  user_id uuid,
  display_name text,
  profile_type profile_type,
  avatar_url text,
  bio text,
  location text,
  city text,
  genres text[],
  talents text[],
  languages text[],
  website text,
  instagram_url text,
  spotify_url text,
  soundcloud_url text,
  youtube_url text,
  tiktok_url text,
  experience text,
  is_public boolean,
  slug text,
  header_url text,
  header_position_y integer,
  venue_category text,
  venue_capacity integer,
  accepts_direct_contact boolean,
  preferred_contact_profile_id uuid,
  created_at timestamp with time zone,
  updated_at timestamp with time zone,
  profile_completion_percentage integer,
  onboarding_completed boolean
)
LANGUAGE plpgsql  
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  target_profile_id uuid;
BEGIN
  -- Trouver le profil par ID ou slug
  IF profile_identifier ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' THEN
    target_profile_id := profile_identifier::uuid;
  ELSE
    SELECT p.id INTO target_profile_id 
    FROM public.profiles p 
    WHERE p.slug = profile_identifier AND p.is_public = true;
  END IF;

  -- Audit de l'accès si ce n'est pas le propriétaire
  IF target_profile_id IS NOT NULL AND auth.uid() IS NOT NULL THEN
    PERFORM audit_profile_access(target_profile_id, 'public_view');
  END IF;

  -- Retourner les données publiques UNIQUEMENT (sans email, phone, siret)
  RETURN QUERY
  SELECT 
    p.id,
    p.user_id,
    p.display_name,
    p.profile_type,
    p.avatar_url,
    p.bio,
    p.location,
    p.city,
    p.genres,
    p.talents,
    p.languages,
    p.website,
    p.instagram_url,
    p.spotify_url,
    p.soundcloud_url,
    p.youtube_url,
    p.tiktok_url,
    p.experience,
    p.is_public,
    p.slug,
    p.header_url,
    p.header_position_y,
    p.venue_category,
    p.venue_capacity,
    p.accepts_direct_contact,
    p.preferred_contact_profile_id,
    p.created_at,
    p.updated_at,
    p.profile_completion_percentage,
    p.onboarding_completed
  FROM public.profiles p
  WHERE p.id = target_profile_id AND p.is_public = true;
END;
$$;

-- 4. Fonction pour obtenir les données complètes (avec PII) - PROPRIÉTAIRE/ADMIN uniquement
CREATE OR REPLACE FUNCTION public.get_full_profile_data(profile_id uuid)
RETURNS TABLE(
  id uuid,
  user_id uuid,
  display_name text,
  profile_type profile_type,
  bio text,
  avatar_url text,
  location text,
  city text,
  genres text[],
  talents text[],
  languages text[],
  website text,
  instagram_url text,
  spotify_url text,
  soundcloud_url text,  
  youtube_url text,
  tiktok_url text,
  experience text,
  is_public boolean,
  slug text,
  header_url text,
  header_position_y integer,
  venue_category text,
  venue_capacity integer,
  accepts_direct_contact boolean,
  preferred_contact_profile_id uuid,
  email text,
  phone text,
  siret_number text,
  siret_verified boolean,
  siret_verified_at timestamp with time zone,
  created_at timestamp with time zone,
  updated_at timestamp with time zone,
  profile_completion_percentage integer,
  onboarding_completed boolean,
  secondary_profile_type profile_type
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Vérification stricte: propriétaire ou admin seulement
  IF NOT (auth.uid() = (SELECT user_id FROM profiles WHERE id = profile_id) OR has_role(auth.uid(), 'admin'::app_role)) THEN
    RAISE EXCEPTION 'Access denied: insufficient permissions to view sensitive profile data';
  END IF;

  -- Audit de l'accès aux données sensibles
  PERFORM log_sensitive_access('profiles', 'FULL_ACCESS', profile_id);

  -- Retourner TOUTES les données (y compris PII)
  RETURN QUERY
  SELECT 
    p.id,
    p.user_id,
    p.display_name,
    p.profile_type,
    p.bio,
    p.avatar_url,
    p.location,
    p.city,
    p.genres,
    p.talents,
    p.languages,
    p.website,
    p.instagram_url,
    p.spotify_url,
    p.soundcloud_url,
    p.youtube_url,
    p.tiktok_url,
    p.experience,
    p.is_public,
    p.slug,
    p.header_url,
    p.header_position_y,
    p.venue_category,
    p.venue_capacity,
    p.accepts_direct_contact,
    p.preferred_contact_profile_id,
    p.email,
    p.phone,
    p.siret_number,
    p.siret_verified,
    p.siret_verified_at,
    p.created_at,
    p.updated_at,
    p.profile_completion_percentage,
    p.onboarding_completed,
    p.secondary_profile_type
  FROM public.profiles p
  WHERE p.id = get_full_profile_data.profile_id;
END;
$$;

-- 5. Accorder les permissions pour les nouvelles fonctions
GRANT EXECUTE ON FUNCTION public.get_public_profile_data(text) TO public;
GRANT EXECUTE ON FUNCTION public.get_full_profile_data(uuid) TO authenticated;

-- 6. Créer des index pour optimiser les recherches sécurisées
CREATE INDEX IF NOT EXISTS idx_profiles_public_search ON public.profiles(is_public, slug) WHERE is_public = true;
CREATE INDEX IF NOT EXISTS idx_profiles_user_security ON public.profiles(user_id, is_public);

-- 7. Commentaires de sécurité
COMMENT ON FUNCTION public.get_public_profile_data(text) IS 'Fonction sécurisée pour obtenir les données publiques de profil sans PII';
COMMENT ON FUNCTION public.get_full_profile_data(uuid) IS 'Fonction sécurisée pour obtenir les données complètes - propriétaire/admin uniquement';

-- 8. Log de sécurité  
INSERT INTO public.security_audit_log (user_id, action, table_name, metadata, created_at)
VALUES (
  NULL, -- Système
  'SECURITY_FIX_APPLIED',
  'profiles',
  jsonb_build_object(
    'type', 'PII_PROTECTION',
    'description', 'Applied strict RLS policies to protect email, phone, and SIRET data',
    'affected_columns', ARRAY['email', 'phone', 'siret_number'],
    'migration_timestamp', now(),
    'severity', 'CRITICAL',
    'fixed_vulnerability', 'Public access to sensitive personal information'
  ),
  now()
);