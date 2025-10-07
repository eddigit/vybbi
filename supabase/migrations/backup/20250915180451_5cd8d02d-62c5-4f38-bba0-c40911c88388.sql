-- Create music_releases table for comprehensive music metadata
CREATE TABLE public.music_releases (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id UUID NOT NULL,
  title TEXT NOT NULL,
  artist_name TEXT NOT NULL,
  album_name TEXT,
  cover_image_url TEXT,
  release_date DATE,
  duration_seconds INTEGER,
  genre TEXT,
  label TEXT,
  copyright_owner TEXT,
  isrc_code TEXT UNIQUE,
  distribution_service TEXT,
  spotify_url TEXT,
  apple_music_url TEXT,
  soundcloud_url TEXT,
  youtube_url TEXT,
  royalty_percentage DECIMAL(5,2) DEFAULT 100.00,
  is_original_composition BOOLEAN DEFAULT true,
  featured_artists JSONB DEFAULT '[]'::jsonb,
  credits JSONB DEFAULT '{}'::jsonb,
  lyrics TEXT,
  bpm INTEGER,
  key_signature TEXT,
  explicit_content BOOLEAN DEFAULT false,
  plays_count INTEGER DEFAULT 0,
  likes_count INTEGER DEFAULT 0,
  status TEXT DEFAULT 'draft'::text CHECK (status IN ('draft', 'published', 'private')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  FOREIGN KEY (profile_id) REFERENCES public.profiles(id) ON DELETE CASCADE
);

-- Add music-specific columns to media_assets
ALTER TABLE public.media_assets ADD COLUMN music_release_id UUID REFERENCES public.music_releases(id) ON DELETE CASCADE;
ALTER TABLE public.media_assets ADD COLUMN track_position INTEGER;
ALTER TABLE public.media_assets ADD COLUMN preview_url TEXT;
ALTER TABLE public.media_assets ADD COLUMN duration_seconds INTEGER;
ALTER TABLE public.media_assets ADD COLUMN waveform_data JSONB;

-- Create music_collaborators table for tracking collaborations
CREATE TABLE public.music_collaborators (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  music_release_id UUID NOT NULL REFERENCES public.music_releases(id) ON DELETE CASCADE,
  collaborator_profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  collaborator_name TEXT NOT NULL,
  role TEXT NOT NULL, -- 'featuring', 'producer', 'songwriter', 'composer', etc.
  royalty_percentage DECIMAL(5,2) DEFAULT 0.00,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create music_plays table for tracking play history
CREATE TABLE public.music_plays (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  music_release_id UUID NOT NULL REFERENCES public.music_releases(id) ON DELETE CASCADE,
  user_id UUID,
  played_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  duration_played INTEGER DEFAULT 0,
  ip_address INET,
  user_agent TEXT,
  source TEXT -- 'profile', 'radio', 'search', etc.
);

-- Create indexes for performance
CREATE INDEX idx_music_releases_profile_id ON public.music_releases(profile_id);
CREATE INDEX idx_music_releases_status ON public.music_releases(status);
CREATE INDEX idx_music_releases_genre ON public.music_releases(genre);
CREATE INDEX idx_music_releases_isrc ON public.music_releases(isrc_code);
CREATE INDEX idx_media_assets_music_release ON public.media_assets(music_release_id);
CREATE INDEX idx_music_collaborators_release ON public.music_collaborators(music_release_id);
CREATE INDEX idx_music_plays_release ON public.music_plays(music_release_id);
CREATE INDEX idx_music_plays_user ON public.music_plays(user_id);

-- Enable RLS
ALTER TABLE public.music_releases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.music_collaborators ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.music_plays ENABLE ROW LEVEL SECURITY;

-- RLS Policies for music_releases
CREATE POLICY "Users can view published music releases" ON public.music_releases
  FOR SELECT USING (status = 'published' OR (EXISTS (
    SELECT 1 FROM public.profiles p 
    WHERE p.id = music_releases.profile_id AND p.user_id = auth.uid()
  )));

CREATE POLICY "Artists can manage their own music releases" ON public.music_releases
  FOR ALL USING (EXISTS (
    SELECT 1 FROM public.profiles p 
    WHERE p.id = music_releases.profile_id AND p.user_id = auth.uid()
  ));

CREATE POLICY "Artists can create music releases" ON public.music_releases
  FOR INSERT WITH CHECK (EXISTS (
    SELECT 1 FROM public.profiles p 
    WHERE p.id = music_releases.profile_id AND p.user_id = auth.uid()
  ));

-- RLS Policies for music_collaborators
CREATE POLICY "Anyone can view collaborators for published releases" ON public.music_collaborators
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM public.music_releases mr 
    WHERE mr.id = music_collaborators.music_release_id AND mr.status = 'published'
  ));

CREATE POLICY "Release owners can manage collaborators" ON public.music_collaborators
  FOR ALL USING (EXISTS (
    SELECT 1 FROM public.music_releases mr 
    JOIN public.profiles p ON p.id = mr.profile_id
    WHERE mr.id = music_collaborators.music_release_id AND p.user_id = auth.uid()
  ));

-- RLS Policies for music_plays
CREATE POLICY "Anyone can insert play records" ON public.music_plays
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can view their own play history" ON public.music_plays
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Release owners can view play stats" ON public.music_plays
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM public.music_releases mr 
    JOIN public.profiles p ON p.id = mr.profile_id
    WHERE mr.id = music_plays.music_release_id AND p.user_id = auth.uid()
  ));

-- Trigger for updated_at
CREATE TRIGGER update_music_releases_updated_at
  BEFORE UPDATE ON public.music_releases
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Function to track music plays
CREATE OR REPLACE FUNCTION public.track_music_play(
  p_music_release_id UUID,
  p_duration_played INTEGER DEFAULT 0,
  p_source TEXT DEFAULT 'profile'
) RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  play_id UUID;
BEGIN
  INSERT INTO public.music_plays (
    music_release_id,
    user_id,
    duration_played,
    source
  ) VALUES (
    p_music_release_id,
    auth.uid(),
    p_duration_played,
    p_source
  ) RETURNING id INTO play_id;
  
  -- Update plays count
  UPDATE public.music_releases 
  SET plays_count = plays_count + 1 
  WHERE id = p_music_release_id;
  
  RETURN play_id;
END;
$$;