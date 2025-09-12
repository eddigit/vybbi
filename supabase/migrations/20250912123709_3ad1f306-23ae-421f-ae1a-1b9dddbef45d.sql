-- Create radio management tables

-- Table for radio playlists
CREATE TABLE public.radio_playlists (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  priority INTEGER NOT NULL DEFAULT 1,
  schedule_start TIME,
  schedule_end TIME,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

-- Table for radio tracks in playlists
CREATE TABLE public.radio_playlist_tracks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  playlist_id UUID NOT NULL REFERENCES public.radio_playlists(id) ON DELETE CASCADE,
  media_asset_id UUID NOT NULL REFERENCES public.media_assets(id) ON DELETE CASCADE,
  weight INTEGER NOT NULL DEFAULT 1,
  play_count INTEGER NOT NULL DEFAULT 0,
  last_played_at TIMESTAMP WITH TIME ZONE,
  is_approved BOOLEAN NOT NULL DEFAULT false,
  added_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  added_by UUID REFERENCES auth.users(id),
  UNIQUE(playlist_id, media_asset_id)
);

-- Table for artist radio subscriptions
CREATE TABLE public.artist_radio_subscriptions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  artist_profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  subscription_type TEXT NOT NULL CHECK (subscription_type IN ('basic', 'premium', 'vip')),
  credits_remaining INTEGER NOT NULL DEFAULT 0,
  auto_approve_tracks BOOLEAN NOT NULL DEFAULT false,
  priority_boost INTEGER NOT NULL DEFAULT 0,
  starts_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table for radio play history
CREATE TABLE public.radio_play_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  media_asset_id UUID NOT NULL REFERENCES public.media_assets(id),
  playlist_id UUID REFERENCES public.radio_playlists(id),
  played_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  user_id UUID REFERENCES auth.users(id),
  duration_seconds INTEGER,
  completed BOOLEAN NOT NULL DEFAULT false
);

-- Enable Row Level Security
ALTER TABLE public.radio_playlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.radio_playlist_tracks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.artist_radio_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.radio_play_history ENABLE ROW LEVEL SECURITY;

-- RLS Policies for radio_playlists
CREATE POLICY "Admins can manage all playlists" ON public.radio_playlists
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Public can view active playlists" ON public.radio_playlists
  FOR SELECT TO anon, authenticated
  USING (is_active = true);

-- RLS Policies for radio_playlist_tracks
CREATE POLICY "Admins can manage all playlist tracks" ON public.radio_playlist_tracks
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Public can view approved tracks" ON public.radio_playlist_tracks
  FOR SELECT TO anon, authenticated
  USING (is_approved = true);

CREATE POLICY "Artists can add tracks to playlists" ON public.radio_playlist_tracks
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.media_assets ma
      JOIN public.profiles p ON p.id = ma.profile_id
      WHERE ma.id = media_asset_id AND p.user_id = auth.uid()
    )
  );

-- RLS Policies for artist_radio_subscriptions
CREATE POLICY "Admins can manage all subscriptions" ON public.artist_radio_subscriptions
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Artists can view their own subscriptions" ON public.artist_radio_subscriptions
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = artist_profile_id AND p.user_id = auth.uid()
    )
  );

-- RLS Policies for radio_play_history
CREATE POLICY "Anyone can insert play history" ON public.radio_play_history
  FOR INSERT TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Admins can view all play history" ON public.radio_play_history
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can view their own play history" ON public.radio_play_history
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

-- Create triggers for updated_at
CREATE TRIGGER update_radio_playlists_updated_at
  BEFORE UPDATE ON public.radio_playlists
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_artist_radio_subscriptions_updated_at
  BEFORE UPDATE ON public.artist_radio_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to get radio playlist with tracks
CREATE OR REPLACE FUNCTION public.get_radio_playlist()
RETURNS TABLE(
  track_id UUID,
  media_asset_id UUID,
  file_url TEXT,
  file_name TEXT,
  artist_name TEXT,
  artist_avatar TEXT,
  artist_profile_id UUID,
  weight INTEGER,
  priority_boost INTEGER,
  subscription_type TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    rpt.id as track_id,
    ma.id as media_asset_id,
    ma.file_url,
    ma.file_name,
    p.display_name as artist_name,
    p.avatar_url as artist_avatar,
    p.id as artist_profile_id,
    rpt.weight,
    COALESCE(ars.priority_boost, 0) as priority_boost,
    COALESCE(ars.subscription_type, 'none') as subscription_type
  FROM radio_playlist_tracks rpt
  JOIN media_assets ma ON ma.id = rpt.media_asset_id
  JOIN profiles p ON p.id = ma.profile_id
  JOIN radio_playlists rp ON rp.id = rpt.playlist_id
  LEFT JOIN artist_radio_subscriptions ars ON ars.artist_profile_id = p.id AND ars.is_active = true
  WHERE rpt.is_approved = true
    AND rp.is_active = true
    AND ma.media_type = 'audio'
    AND p.is_public = true
    AND (rp.schedule_start IS NULL OR rp.schedule_end IS NULL OR 
         CURRENT_TIME BETWEEN rp.schedule_start AND rp.schedule_end)
  ORDER BY 
    (rpt.weight + COALESCE(ars.priority_boost, 0)) DESC,
    RANDOM();
END;
$$;