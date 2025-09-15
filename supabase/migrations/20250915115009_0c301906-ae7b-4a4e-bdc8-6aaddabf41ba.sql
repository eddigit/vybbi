-- Create secure RPC functions with proper search_path

-- Function to get user profile with security
CREATE OR REPLACE FUNCTION public.get_user_profile(user_id UUID)
RETURNS TABLE (
  id UUID,
  display_name TEXT,
  profile_type profile_type,
  avatar_url TEXT,
  bio TEXT,
  city TEXT,
  is_public BOOLEAN
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only allow users to get their own profile or public profiles
  IF auth.uid() = user_id OR EXISTS (
    SELECT 1 FROM profiles p 
    WHERE p.user_id = get_user_profile.user_id 
    AND p.is_public = true
  ) THEN
    RETURN QUERY
    SELECT p.id, p.display_name, p.profile_type, p.avatar_url, p.bio, p.city, p.is_public
    FROM profiles p
    WHERE p.user_id = get_user_profile.user_id;
  END IF;
END;
$$;

-- Function to safely resolve profile by slug
CREATE OR REPLACE FUNCTION public.resolve_profile_by_slug(profile_slug TEXT)
RETURNS TABLE (
  id UUID,
  slug TEXT,
  profile_type profile_type,
  display_name TEXT,
  avatar_url TEXT,
  is_public BOOLEAN,
  bio TEXT,
  city TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only return public profiles
  RETURN QUERY
  SELECT p.id, p.slug, p.profile_type, p.display_name, p.avatar_url, p.is_public, p.bio, p.city
  FROM profiles p
  WHERE p.slug = profile_slug
  AND p.is_public = true;
END;
$$;

-- Function to get profile statistics safely
CREATE OR REPLACE FUNCTION public.get_profile_stats(profile_id UUID)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result JSON;
  profile_record profiles%ROWTYPE;
BEGIN
  -- Get the profile
  SELECT * INTO profile_record FROM profiles WHERE id = profile_id AND is_public = true;
  
  IF profile_record.id IS NULL THEN
    RETURN '{"error": "Profile not found or not public"}'::JSON;
  END IF;

  -- Build stats based on profile type
  IF profile_record.profile_type = 'artist' THEN
    SELECT json_build_object(
      'events_count', COALESCE((
        SELECT COUNT(*) FROM bookings b 
        WHERE b.artist_profile_id = profile_id 
        AND b.status = 'confirmed'
      ), 0),
      'reviews_count', COALESCE((
        SELECT COUNT(*) FROM detailed_reviews dr
        WHERE dr.reviewed_profile_id = profile_id
      ), 0),
      'average_rating', COALESCE((
        SELECT AVG(dr.overall_average) FROM detailed_reviews dr
        WHERE dr.reviewed_profile_id = profile_id
      ), 0)
    ) INTO result;
  
  ELSIF profile_record.profile_type = 'lieu' THEN
    SELECT json_build_object(
      'events_count', COALESCE((
        SELECT COUNT(*) FROM events e 
        WHERE e.venue_profile_id = profile_id 
        AND e.status = 'published'
        AND e.event_date >= CURRENT_DATE
      ), 0),
      'total_events', COALESCE((
        SELECT COUNT(*) FROM events e 
        WHERE e.venue_profile_id = profile_id 
        AND e.status = 'published'
      ), 0)
    ) INTO result;
  
  ELSE
    SELECT json_build_object(
      'type', profile_record.profile_type
    ) INTO result;
  END IF;

  RETURN result;
END;
$$;