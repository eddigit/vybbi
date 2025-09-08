-- Add header position field to profiles table
ALTER TABLE public.profiles 
ADD COLUMN header_position_y INTEGER DEFAULT 50;