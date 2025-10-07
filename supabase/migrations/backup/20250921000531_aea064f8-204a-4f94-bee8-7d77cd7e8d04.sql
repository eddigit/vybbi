-- Add music_release_id column to radio_playlist_tracks table
ALTER TABLE public.radio_playlist_tracks 
ADD COLUMN music_release_id UUID;

-- Add foreign key constraint for music_release_id
ALTER TABLE public.radio_playlist_tracks 
ADD CONSTRAINT fk_radio_playlist_tracks_music_release 
FOREIGN KEY (music_release_id) REFERENCES public.music_releases(id) ON DELETE CASCADE;

-- Make media_asset_id nullable since we'll now use either media_asset_id OR music_release_id
ALTER TABLE public.radio_playlist_tracks 
ALTER COLUMN media_asset_id DROP NOT NULL;

-- Add a check constraint to ensure either media_asset_id or music_release_id is set, but not both
ALTER TABLE public.radio_playlist_tracks 
ADD CONSTRAINT check_track_source 
CHECK (
  (media_asset_id IS NOT NULL AND music_release_id IS NULL) OR 
  (media_asset_id IS NULL AND music_release_id IS NOT NULL)
);