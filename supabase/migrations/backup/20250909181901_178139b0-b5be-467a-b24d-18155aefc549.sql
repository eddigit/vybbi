-- Add image position field to annonces table
ALTER TABLE public.annonces ADD COLUMN image_position_y integer DEFAULT 50;