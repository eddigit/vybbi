-- Add music_release_id column to radio_play_history table
ALTER TABLE public.radio_play_history 
ADD COLUMN music_release_id uuid REFERENCES public.music_releases(id);

-- Make media_asset_id nullable since we now have two ways to reference tracks
ALTER TABLE public.radio_play_history 
ALTER COLUMN media_asset_id DROP NOT NULL;

-- Add constraint to ensure either media_asset_id or music_release_id is present
ALTER TABLE public.radio_play_history 
ADD CONSTRAINT radio_play_history_track_reference_check 
CHECK (
  (media_asset_id IS NOT NULL AND music_release_id IS NULL) OR 
  (media_asset_id IS NULL AND music_release_id IS NOT NULL)
);