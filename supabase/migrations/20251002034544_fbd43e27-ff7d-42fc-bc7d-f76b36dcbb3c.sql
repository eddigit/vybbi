
-- ============================================
-- FIX: Strict Column-Level PII Protection
-- ============================================
-- This migration implements strict column-level access control
-- to prevent ANY unauthorized access to email, phone, and siret fields.

-- Drop the permissive policies
DROP POLICY IF EXISTS "Public can view non-sensitive profile data only" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their complete profile" ON public.profiles;

-- Create a view for safe public profile access (NO PII)
DROP VIEW IF EXISTS public.safe_public_profiles CASCADE;
CREATE VIEW public.safe_public_profiles AS
SELECT 
  id, user_id, display_name, profile_type, avatar_url, bio,
  location, city, genres, talents, languages, website,
  instagram_url, spotify_url, soundcloud_url, youtube_url, tiktok_url,
  experience, is_public, slug, header_url, header_position_y,
  venue_category, venue_capacity, accepts_direct_contact,
  preferred_contact_profile_id, created_at, updated_at,
  profile_completion_percentage, onboarding_completed
FROM public.profiles
WHERE is_public = true;

-- Grant access to the safe view
GRANT SELECT ON public.safe_public_profiles TO public, anon, authenticated;

-- Implement STRICT RLS policies on profiles table
-- Policy 1: Users can ONLY see their own complete profile
CREATE POLICY "Users can only view their own complete profile"
ON public.profiles
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Policy 2: Admins can view all profiles
CREATE POLICY "Admins can view all profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- Policy 3: Public/Anon users have NO direct access to profiles table
-- They MUST use safe_public_profiles view or get_safe_profile_data() function
-- This policy explicitly denies access
CREATE POLICY "Public has no direct access to profiles"
ON public.profiles
FOR SELECT
TO public, anon
USING (false);

-- Update the get_safe_profile_data function to use the view
CREATE OR REPLACE FUNCTION public.get_safe_profile_data(profile_identifier text)
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
  -- Find profile by ID or slug
  IF profile_identifier ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' THEN
    target_profile_id := profile_identifier::uuid;
  ELSE
    SELECT p.id INTO target_profile_id 
    FROM public.safe_public_profiles p 
    WHERE p.slug = profile_identifier;
  END IF;

  -- Audit access (only if authenticated)
  IF target_profile_id IS NOT NULL AND auth.uid() IS NOT NULL THEN
    PERFORM audit_profile_access(target_profile_id, 'safe_view');
  END IF;

  -- Return ONLY non-sensitive data using the safe view
  RETURN QUERY
  SELECT 
    p.id, p.user_id, p.display_name, p.profile_type, p.avatar_url,
    p.bio, p.location, p.city, p.genres, p.talents, p.languages,
    p.website, p.instagram_url, p.spotify_url, p.soundcloud_url,
    p.youtube_url, p.tiktok_url, p.experience, p.is_public, p.slug,
    p.header_url, p.header_position_y, p.venue_category, p.venue_capacity,
    p.accepts_direct_contact, p.preferred_contact_profile_id,
    p.created_at, p.updated_at, p.profile_completion_percentage, p.onboarding_completed
  FROM public.safe_public_profiles p
  WHERE p.id = target_profile_id;
END;
$$;

-- Ensure proper permissions
GRANT EXECUTE ON FUNCTION public.get_safe_profile_data(text) TO public, anon, authenticated;

-- Add security comments
COMMENT ON VIEW public.safe_public_profiles IS 
'SECURITY: Safe view of profiles table that NEVER exposes email, phone, or siret_number. Use this for public profile access.';

COMMENT ON POLICY "Users can only view their own complete profile" ON public.profiles IS
'Users can access their own complete profile including PII fields (email, phone, siret)';

COMMENT ON POLICY "Admins can view all profiles" ON public.profiles IS
'Administrators can access all profiles including PII for moderation purposes';

COMMENT ON POLICY "Public has no direct access to profiles" ON public.profiles IS
'Public users MUST use safe_public_profiles view or get_safe_profile_data() function. Direct access is denied.';
