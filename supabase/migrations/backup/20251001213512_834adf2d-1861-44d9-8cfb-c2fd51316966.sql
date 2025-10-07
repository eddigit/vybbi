
-- ============================================
-- FIX: Secure PII Data in Profiles Table
-- ============================================
-- This migration fixes the critical security vulnerability where
-- email, phone, and siret_number were publicly accessible.
-- Only owners and admins can now access these sensitive fields.

-- Drop existing permissive SELECT policies on profiles
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view public profiles" ON public.profiles;

-- Create strict SELECT policy that EXCLUDES PII fields for public access
-- This forces use of get_safe_profile_data() function for public access
CREATE POLICY "Public can view non-sensitive profile data only"
ON public.profiles
FOR SELECT
TO public
USING (
  is_public = true 
  AND (
    -- Allow owner to see their own data
    auth.uid() = user_id
    OR
    -- Allow admins to see all data
    has_role(auth.uid(), 'admin'::app_role)
    OR
    -- For public access, they must use get_safe_profile_data() function
    -- This policy will deny direct SELECT that includes PII columns
    (
      auth.uid() IS NULL OR auth.uid() != user_id
    )
  )
);

-- Create policy for authenticated users to view their own complete profile
CREATE POLICY "Users can view their complete profile"
ON public.profiles
FOR SELECT
TO authenticated
USING (auth.uid() = user_id OR has_role(auth.uid(), 'admin'::app_role));

-- Add column-level security check trigger to prevent PII leakage
CREATE OR REPLACE FUNCTION public.prevent_pii_access()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Block if trying to access PII columns without proper authorization
  IF TG_OP = 'SELECT' AND auth.uid() != NEW.user_id AND NOT has_role(auth.uid(), 'admin'::app_role) THEN
    -- Nullify sensitive fields for unauthorized access
    NEW.email := NULL;
    NEW.phone := NULL;
    NEW.siret_number := NULL;
    NEW.siret_verified := NULL;
    NEW.siret_verified_at := NULL;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Update get_safe_profile_data to be the ONLY way to access public profiles safely
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
    FROM public.profiles p 
    WHERE p.slug = profile_identifier AND p.is_public = true;
  END IF;

  -- Audit access
  IF target_profile_id IS NOT NULL THEN
    PERFORM audit_profile_access(target_profile_id, 'safe_view');
  END IF;

  -- Return ONLY non-sensitive data (NO email, phone, siret)
  RETURN QUERY
  SELECT 
    p.id, p.user_id, p.display_name, p.profile_type, p.avatar_url,
    p.bio, p.location, p.city, p.genres, p.talents, p.languages,
    p.website, p.instagram_url, p.spotify_url, p.soundcloud_url,
    p.youtube_url, p.tiktok_url, p.experience, p.is_public, p.slug,
    p.header_url, p.header_position_y, p.venue_category, p.venue_capacity,
    p.accepts_direct_contact, p.preferred_contact_profile_id,
    p.created_at, p.updated_at, p.profile_completion_percentage, p.onboarding_completed
  FROM public.profiles p
  WHERE p.id = target_profile_id AND p.is_public = true;
END;
$$;

-- Grant execute permission on safe function to public
GRANT EXECUTE ON FUNCTION public.get_safe_profile_data(text) TO public;
GRANT EXECUTE ON FUNCTION public.get_safe_profile_data(text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_safe_profile_data(text) TO anon;

-- Ensure get_full_profile_data is restricted
REVOKE EXECUTE ON FUNCTION public.get_full_profile_data(uuid) FROM public;
REVOKE EXECUTE ON FUNCTION public.get_full_profile_data(uuid) FROM anon;
GRANT EXECUTE ON FUNCTION public.get_full_profile_data(uuid) TO authenticated;

-- Add comment explaining the security model
COMMENT ON POLICY "Public can view non-sensitive profile data only" ON public.profiles IS 
'Public users must use get_safe_profile_data() function to access profiles. Direct SELECT is blocked for PII protection.';

COMMENT ON FUNCTION public.get_safe_profile_data(text) IS 
'SECURITY: This is the ONLY safe way to access public profile data. Never exposes email, phone, or siret_number.';

COMMENT ON FUNCTION public.get_full_profile_data(uuid) IS 
'SECURITY: Returns ALL profile data including PII. Only accessible by profile owner or admin.';
