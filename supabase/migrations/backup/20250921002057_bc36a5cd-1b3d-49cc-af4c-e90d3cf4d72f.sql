-- Update get_radio_playlist function to include direct audio file URLs from media_assets
CREATE OR REPLACE FUNCTION public.get_radio_playlist()
RETURNS TABLE(
  track_id uuid, 
  music_release_id uuid, 
  title text, 
  artist_name text, 
  artist_avatar text, 
  artist_profile_id uuid, 
  weight integer, 
  priority_boost integer, 
  subscription_type text,
  youtube_url text,
  spotify_url text,
  soundcloud_url text,
  cover_image_url text,
  file_url text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  RETURN QUERY
  SELECT 
    rpt.id as track_id,
    mr.id as music_release_id,
    mr.title,
    COALESCE(p.display_name, mr.artist_name) as artist_name,
    p.avatar_url as artist_avatar,
    p.id as artist_profile_id,
    rpt.weight,
    COALESCE(ars.priority_boost, 0) as priority_boost,
    COALESCE(ars.subscription_type, 'none') as subscription_type,
    mr.youtube_url,
    mr.spotify_url,
    mr.soundcloud_url,
    mr.cover_image_url,
    ma.file_url
  FROM radio_playlist_tracks rpt
  JOIN music_releases mr ON mr.id = rpt.music_release_id
  JOIN profiles p ON p.id = mr.profile_id
  JOIN radio_playlists rp ON rp.id = rpt.playlist_id
  LEFT JOIN artist_radio_subscriptions ars ON ars.artist_profile_id = p.id AND ars.is_active = true
  LEFT JOIN media_assets ma ON ma.profile_id = p.id AND ma.media_type = 'audio' AND ma.file_url IS NOT NULL
  WHERE rpt.is_approved = true
    AND rp.is_active = true
    AND mr.status = 'published'
    AND p.is_public = true
    AND (rp.schedule_start IS NULL OR rp.schedule_end IS NULL OR 
         CURRENT_TIME BETWEEN rp.schedule_start AND rp.schedule_end)
  ORDER BY 
    (rpt.weight + COALESCE(ars.priority_boost, 0)) DESC,
    RANDOM();
END;
$function$