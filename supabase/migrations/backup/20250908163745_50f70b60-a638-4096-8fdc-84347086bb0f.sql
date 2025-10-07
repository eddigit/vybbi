-- Add social media URLs to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS spotify_url TEXT,
ADD COLUMN IF NOT EXISTS soundcloud_url TEXT,
ADD COLUMN IF NOT EXISTS youtube_url TEXT,
ADD COLUMN IF NOT EXISTS instagram_url TEXT,
ADD COLUMN IF NOT EXISTS tiktok_url TEXT;

-- Create storage buckets for user uploads
INSERT INTO storage.buckets (id, name, public) 
VALUES 
  ('avatars', 'avatars', true),
  ('media', 'media', true)
ON CONFLICT (id) DO NOTHING;

-- Create storage policies for avatars
CREATE POLICY "Avatar images are publicly accessible" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload their own avatar" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own avatar" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own avatar" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Create storage policies for media
CREATE POLICY "Media files are publicly accessible" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'media');

CREATE POLICY "Users can upload their own media" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'media' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own media" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'media' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own media" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'media' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Update media_assets RLS policies
DROP POLICY IF EXISTS "Users can update their own media assets" ON public.media_assets;
DROP POLICY IF EXISTS "Users can delete their own media assets" ON public.media_assets;

CREATE POLICY "Users can update their own media assets" 
ON public.media_assets 
FOR UPDATE 
USING (EXISTS (
  SELECT 1 FROM public.profiles 
  WHERE profiles.id = media_assets.profile_id 
    AND profiles.user_id = auth.uid()
));

CREATE POLICY "Users can delete their own media assets" 
ON public.media_assets 
FOR DELETE 
USING (EXISTS (
  SELECT 1 FROM public.profiles 
  WHERE profiles.id = media_assets.profile_id 
    AND profiles.user_id = auth.uid()
));

-- Create function to ensure user profile exists
CREATE OR REPLACE FUNCTION public.ensure_user_profile(
  _user_id UUID,
  _display_name TEXT DEFAULT NULL,
  _profile_type profile_type DEFAULT 'artist'
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _profile_id UUID;
  _role app_role;
BEGIN
  -- Map profile_type to app_role
  _role := _profile_type::text::app_role;
  
  -- Check if profile already exists
  SELECT id INTO _profile_id
  FROM public.profiles
  WHERE user_id = _user_id;
  
  -- If no profile exists, create one
  IF _profile_id IS NULL THEN
    INSERT INTO public.profiles (user_id, display_name, profile_type)
    VALUES (_user_id, COALESCE(_display_name, 'New User'), _profile_type)
    RETURNING id INTO _profile_id;
  END IF;
  
  -- Ensure user role exists
  INSERT INTO public.user_roles (user_id, role)
  VALUES (_user_id, _role)
  ON CONFLICT (user_id, role) DO NOTHING;
  
  RETURN _profile_id;
END;
$$;

-- Backfill profile and role for the artist user
SELECT public.ensure_user_profile(
  'bef868e7-7a4b-4e59-944f-1ff57cccccab'::UUID,
  'Artiste',
  'artist'::profile_type
);