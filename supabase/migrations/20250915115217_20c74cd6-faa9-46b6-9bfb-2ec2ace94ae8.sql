-- Fix remaining functions without secure search_path
-- Based on the function list, we need to update several functions

-- Fix update_community_member_count function
CREATE OR REPLACE FUNCTION public.update_community_member_count()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.communities 
    SET member_count = member_count + 1 
    WHERE id = NEW.community_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.communities 
    SET member_count = member_count - 1 
    WHERE id = OLD.community_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$function$;

-- Fix get_artist_radio_stats function
CREATE OR REPLACE FUNCTION public.get_artist_radio_stats(artist_profile_id uuid)
RETURNS TABLE(total_plays bigint, total_duration_seconds bigint, last_played_at timestamp with time zone, ranking_position integer)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*) as total_plays,
    COALESCE(SUM(rph.duration_seconds), 0) as total_duration_seconds,
    MAX(rph.played_at) as last_played_at,
    COALESCE((
      SELECT position FROM (
        SELECT 
          p.id,
          ROW_NUMBER() OVER (ORDER BY COUNT(rph2.id) DESC) as position
        FROM profiles p
        LEFT JOIN media_assets ma2 ON ma2.profile_id = p.id
        LEFT JOIN radio_play_history rph2 ON rph2.media_asset_id = ma2.id
        WHERE p.profile_type = 'artist' AND p.is_public = true
        GROUP BY p.id
      ) rankings WHERE rankings.id = artist_profile_id
    )::INTEGER, 999) as ranking_position
  FROM radio_play_history rph
  JOIN media_assets ma ON ma.id = rph.media_asset_id
  WHERE ma.profile_id = artist_profile_id;
END;
$function$;

-- Fix get_top_artists function  
CREATE OR REPLACE FUNCTION public.get_top_artists(limit_count integer DEFAULT 50, genre_filter text DEFAULT NULL::text)
RETURNS TABLE(profile_id uuid, display_name text, avatar_url text, location text, genres text[], total_plays bigint, avg_talent_score numeric, avg_professionalism_score numeric, avg_communication_score numeric, overall_score numeric, total_reviews bigint, combined_score numeric)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  RETURN QUERY
  SELECT 
    p.id as profile_id,
    p.display_name,
    p.avatar_url,
    p.location,
    p.genres,
    COALESCE(play_stats.total_plays, 0) as total_plays,
    COALESCE(review_stats.avg_talent_score, 0) as avg_talent_score,
    COALESCE(review_stats.avg_professionalism_score, 0) as avg_professionalism_score,
    COALESCE(review_stats.avg_communication_score, 0) as avg_communication_score,
    COALESCE(review_stats.overall_avg, 0) as overall_score,
    COALESCE(review_stats.total_reviews, 0) as total_reviews,
    (
      (COALESCE(play_stats.total_plays, 0) * 0.5) + 
      (COALESCE(review_stats.overall_avg, 0) * 20 * 0.3) + 
      (COALESCE(booking_stats.booking_count, 0) * 0.2)
    ) as combined_score
  FROM profiles p
  LEFT JOIN (
    SELECT 
      ma.profile_id,
      COUNT(rph.id) as total_plays
    FROM media_assets ma
    LEFT JOIN radio_play_history rph ON rph.media_asset_id = ma.id
    GROUP BY ma.profile_id
  ) play_stats ON play_stats.profile_id = p.id
  LEFT JOIN (
    SELECT 
      dr.reviewed_profile_id,
      AVG(dr.talent_score) as avg_talent_score,
      AVG(dr.professionalism_score) as avg_professionalism_score,
      AVG(dr.communication_score) as avg_communication_score,
      AVG(dr.overall_average) as overall_avg,
      COUNT(*) as total_reviews
    FROM detailed_reviews dr
    GROUP BY dr.reviewed_profile_id
  ) review_stats ON review_stats.reviewed_profile_id = p.id
  LEFT JOIN (
    SELECT 
      b.artist_profile_id,
      COUNT(*) as booking_count
    FROM bookings b
    WHERE b.status = 'confirmed'
    GROUP BY b.artist_profile_id
  ) booking_stats ON booking_stats.artist_profile_id = p.id
  WHERE p.profile_type = 'artist' 
    AND p.is_public = true
    AND (genre_filter IS NULL OR p.genres && ARRAY[genre_filter])
  ORDER BY combined_score DESC
  LIMIT limit_count;
END;
$function$;