-- Fix security issue with resolve_profile function by setting search_path
CREATE OR REPLACE FUNCTION public.resolve_profile(identifier text)
RETURNS TABLE (
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
  email text,
  phone text,
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
  is_slug_match boolean
) 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Try to find by slug first
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
    p.email,
    p.phone,
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
    true as is_slug_match
  FROM profiles p
  WHERE p.slug = identifier AND p.is_public = true
  LIMIT 1;

  -- If not found by slug, try by ID (UUID)
  IF NOT FOUND THEN
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
      p.email,
      p.phone,
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
      false as is_slug_match
    FROM profiles p
    WHERE p.id::text = identifier AND p.is_public = true
    LIMIT 1;
  END IF;
END;
$$;