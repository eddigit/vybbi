-- Enable realtime for radio playlists table
ALTER TABLE public.radio_playlists REPLICA IDENTITY FULL;

-- Add to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.radio_playlists;