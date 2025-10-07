-- Fix security linter issues from previous migration

-- Drop the security definer view and replace with a safer approach
DROP VIEW IF EXISTS public.public_profiles;

-- Instead, create a function that returns only safe public profile data
CREATE OR REPLACE FUNCTION public.get_safe_profile_data(profile_identifier text)
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
) 
LANGUAGE plpgsql 
SECURITY DEFINER 
STABLE
SET search_path = public
AS $$
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

-- Fix the previous function to include proper search_path
DROP FUNCTION IF EXISTS public.get_public_profile_data(text);

-- Create a simple policy for anonymous users to access only basic profile info via RPC
CREATE POLICY "Anonymous can access safe profile data via RPC" 
ON public.profiles 
FOR SELECT 
TO anon
USING (false); -- This stays false - anonymous users should use the RPC function instead

-- Grant execute permission on the safe function to anonymous users
GRANT EXECUTE ON FUNCTION public.get_safe_profile_data(text) TO anon;
GRANT EXECUTE ON FUNCTION public.get_safe_profile_data(text) TO authenticated;