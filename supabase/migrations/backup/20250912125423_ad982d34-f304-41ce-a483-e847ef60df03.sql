-- Create detailed reviews table with 3 criteria
CREATE TABLE IF NOT EXISTS public.detailed_reviews (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  reviewer_id UUID NOT NULL,
  reviewed_profile_id UUID NOT NULL,
  talent_score INTEGER NOT NULL CHECK (talent_score >= 1 AND talent_score <= 5),
  professionalism_score INTEGER NOT NULL CHECK (professionalism_score >= 1 AND professionalism_score <= 5),
  communication_score INTEGER NOT NULL CHECK (communication_score >= 1 AND communication_score <= 5),
  overall_average DECIMAL(3,2) GENERATED ALWAYS AS ((talent_score + professionalism_score + communication_score)::DECIMAL / 3) STORED,
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(reviewer_id, reviewed_profile_id)
);

-- Enable Row Level Security
ALTER TABLE public.detailed_reviews ENABLE ROW LEVEL SECURITY;

-- Create policies for detailed reviews
CREATE POLICY "Only agents_managers_venues can create detailed reviews" 
ON public.detailed_reviews 
FOR INSERT 
WITH CHECK (
  (auth.uid() = reviewer_id) AND 
  (EXISTS (
    SELECT 1 FROM profiles reviewer_profile 
    WHERE reviewer_profile.user_id = auth.uid() 
    AND reviewer_profile.profile_type = ANY(ARRAY['agent'::profile_type, 'manager'::profile_type, 'lieu'::profile_type])
  )) AND 
  (EXISTS (
    SELECT 1 FROM profiles reviewed_profile 
    WHERE reviewed_profile.id = detailed_reviews.reviewed_profile_id 
    AND reviewed_profile.profile_type = 'artist'::profile_type
  ))
);

CREATE POLICY "Detailed reviews are viewable through public profiles" 
ON public.detailed_reviews 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = detailed_reviews.reviewed_profile_id 
    AND profiles.is_public = true
  )
);

-- Create function to get detailed artist statistics
CREATE OR REPLACE FUNCTION public.get_artist_radio_stats(artist_profile_id UUID)
RETURNS TABLE(
  total_plays BIGINT,
  total_duration_seconds BIGINT,
  last_played_at TIMESTAMP WITH TIME ZONE,
  ranking_position INTEGER
) LANGUAGE plpgsql SECURITY DEFINER AS $$
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
$$;

-- Create function to get Top 50 artists
CREATE OR REPLACE FUNCTION public.get_top_artists(
  limit_count INTEGER DEFAULT 50,
  genre_filter TEXT DEFAULT NULL
)
RETURNS TABLE(
  profile_id UUID,
  display_name TEXT,
  avatar_url TEXT,
  location TEXT,
  genres TEXT[],
  total_plays BIGINT,
  avg_talent_score DECIMAL(3,2),
  avg_professionalism_score DECIMAL(3,2),
  avg_communication_score DECIMAL(3,2),
  overall_score DECIMAL(3,2),
  total_reviews BIGINT,
  combined_score DECIMAL(5,2)
) LANGUAGE plpgsql SECURITY DEFINER AS $$
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
$$;

-- Create table for radio likes
CREATE TABLE IF NOT EXISTS public.radio_likes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  media_asset_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, media_asset_id)
);

-- Enable RLS for radio likes
ALTER TABLE public.radio_likes ENABLE ROW LEVEL SECURITY;

-- Create policies for radio likes
CREATE POLICY "Users can manage their own likes" 
ON public.radio_likes 
FOR ALL 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Public can view like counts" 
ON public.radio_likes 
FOR SELECT 
USING (true);