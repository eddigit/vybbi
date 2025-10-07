-- Fix security vulnerability: Restrict public access to profiles table
-- Remove overly permissive policy and create secure ones

-- Drop the problematic policy that exposes all profile data
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;

-- Create a secure policy for public profile viewing that only exposes safe information
CREATE POLICY "Public can view safe profile data" 
ON public.profiles 
FOR SELECT 
TO public
USING (
  is_public = true 
  AND (
    -- Only allow access to these safe columns for public viewing
    current_setting('request.columns', true) IS NULL
    OR current_setting('request.columns', true) !~ '(email|phone)'
  )
);

-- Alternative approach using a view for public profiles with only safe data
CREATE OR REPLACE VIEW public.public_profiles AS
SELECT 
  id,
  user_id,
  display_name,
  profile_type,
  avatar_url,
  bio,
  location,
  city,
  genres,
  talents,
  languages,
  website,
  instagram_url,
  spotify_url,
  soundcloud_url,
  youtube_url,
  tiktok_url,
  experience,
  is_public,
  slug,
  header_url,
  header_position_y,
  venue_category,
  venue_capacity,
  accepts_direct_contact,
  preferred_contact_profile_id,
  created_at,
  updated_at,
  profile_completion_percentage,
  onboarding_completed
FROM public.profiles
WHERE is_public = true;

-- Grant SELECT access on the public view
GRANT SELECT ON public.public_profiles TO public;

-- Create a more restrictive policy for the main profiles table
DROP POLICY IF EXISTS "Public can view safe profile data" ON public.profiles;

CREATE POLICY "Only authenticated users can view profiles" 
ON public.profiles 
FOR SELECT 
TO authenticated
USING (
  -- Users can always see their own profile
  auth.uid() = user_id 
  OR 
  -- Or public profiles (but only authenticated users can access the main table)
  is_public = true
);

-- Ensure anonymous users cannot access the main profiles table directly
CREATE POLICY "Anonymous users cannot access profiles" 
ON public.profiles 
FOR ALL 
TO anon
USING (false);

-- Update function for profile resolution to use secure data
CREATE OR REPLACE FUNCTION public.get_public_profile_data(profile_identifier text)
RETURNS TABLE(
  id uuid,
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
  updated_at timestamp with time zone
) LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
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
    p.updated_at
  FROM public.profiles p
  WHERE (p.slug = profile_identifier OR p.id::text = profile_identifier)
    AND p.is_public = true;
END;
$$;