-- Add slug column to profiles table
ALTER TABLE public.profiles ADD COLUMN slug TEXT;

-- Create unique index on slug
CREATE UNIQUE INDEX idx_profiles_slug ON public.profiles(slug) WHERE slug IS NOT NULL;

-- Function to generate URL-friendly slug from text
CREATE OR REPLACE FUNCTION public.generate_slug(input_text TEXT)
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  base_slug TEXT;
  final_slug TEXT;
  counter INTEGER := 1;
BEGIN
  -- Convert to lowercase, replace spaces with hyphens, remove special chars
  base_slug := lower(trim(input_text));
  base_slug := regexp_replace(base_slug, '[àáâãäå]', 'a', 'g');
  base_slug := regexp_replace(base_slug, '[èéêë]', 'e', 'g');
  base_slug := regexp_replace(base_slug, '[ìíîï]', 'i', 'g');
  base_slug := regexp_replace(base_slug, '[òóôõö]', 'o', 'g');
  base_slug := regexp_replace(base_slug, '[ùúûü]', 'u', 'g');
  base_slug := regexp_replace(base_slug, '[ý]', 'y', 'g');
  base_slug := regexp_replace(base_slug, '[ñ]', 'n', 'g');
  base_slug := regexp_replace(base_slug, '[ç]', 'c', 'g');
  base_slug := regexp_replace(base_slug, '[^a-z0-9\-]', '-', 'g');
  base_slug := regexp_replace(base_slug, '-+', '-', 'g');
  base_slug := trim(base_slug, '-');
  
  -- Ensure slug is not empty
  IF length(base_slug) = 0 THEN
    base_slug := 'profile';
  END IF;
  
  final_slug := base_slug;
  
  -- Check for conflicts and add counter if needed
  WHILE EXISTS (SELECT 1 FROM public.profiles WHERE slug = final_slug) LOOP
    counter := counter + 1;
    final_slug := base_slug || '-' || counter::TEXT;
  END LOOP;
  
  RETURN final_slug;
END;
$$;

-- Function to auto-generate slug from display_name
CREATE OR REPLACE FUNCTION public.set_profile_slug()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  -- Only generate slug if it's not already set
  IF NEW.slug IS NULL OR NEW.slug = '' THEN
    NEW.slug := public.generate_slug(NEW.display_name);
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger to auto-generate slugs
CREATE TRIGGER trigger_set_profile_slug
  BEFORE INSERT OR UPDATE OF display_name ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.set_profile_slug();

-- Generate slugs for existing profiles
UPDATE public.profiles 
SET slug = public.generate_slug(display_name) 
WHERE slug IS NULL;

-- Function to resolve profile by slug or ID
CREATE OR REPLACE FUNCTION public.resolve_profile(identifier TEXT)
RETURNS TABLE(
  id UUID,
  user_id UUID,
  display_name TEXT,
  profile_type profile_type,
  avatar_url TEXT,
  bio TEXT,
  location TEXT,
  city TEXT,
  genres TEXT[],
  talents TEXT[],
  languages TEXT[],
  email TEXT,
  phone TEXT,
  website TEXT,
  instagram_url TEXT,
  spotify_url TEXT,
  soundcloud_url TEXT,
  youtube_url TEXT,
  tiktok_url TEXT,
  experience TEXT,
  is_public BOOLEAN,
  slug TEXT,
  header_url TEXT,
  header_position_y INTEGER,
  venue_category TEXT,
  venue_capacity INTEGER,
  accepts_direct_contact BOOLEAN,
  preferred_contact_profile_id UUID,
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE,
  is_slug_match BOOLEAN
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- First try to match by slug
  RETURN QUERY
  SELECT 
    p.id, p.user_id, p.display_name, p.profile_type, p.avatar_url, p.bio, 
    p.location, p.city, p.genres, p.talents, p.languages, p.email, p.phone, 
    p.website, p.instagram_url, p.spotify_url, p.soundcloud_url, p.youtube_url, 
    p.tiktok_url, p.experience, p.is_public, p.slug, p.header_url, 
    p.header_position_y, p.venue_category, p.venue_capacity, p.accepts_direct_contact, 
    p.preferred_contact_profile_id, p.created_at, p.updated_at,
    TRUE as is_slug_match
  FROM public.profiles p
  WHERE p.slug = identifier AND p.is_public = TRUE;
  
  -- If no slug match found, try UUID
  IF NOT FOUND THEN
    RETURN QUERY
    SELECT 
      p.id, p.user_id, p.display_name, p.profile_type, p.avatar_url, p.bio, 
      p.location, p.city, p.genres, p.talents, p.languages, p.email, p.phone, 
      p.website, p.instagram_url, p.spotify_url, p.soundcloud_url, p.youtube_url, 
      p.tiktok_url, p.experience, p.is_public, p.slug, p.header_url, 
      p.header_position_y, p.venue_category, p.venue_capacity, p.accepts_direct_contact, 
      p.preferred_contact_profile_id, p.created_at, p.updated_at,
      FALSE as is_slug_match
    FROM public.profiles p
    WHERE p.id::TEXT = identifier AND p.is_public = TRUE;
  END IF;
END;
$$;