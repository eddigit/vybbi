-- Add header_url column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN header_url text DEFAULT NULL;