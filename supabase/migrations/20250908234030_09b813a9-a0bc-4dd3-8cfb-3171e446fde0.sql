-- Add talents column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN talents TEXT[] DEFAULT NULL;