-- Fix security warnings by setting search_path for functions

-- Function to generate URL-friendly slug from text
CREATE OR REPLACE FUNCTION public.generate_slug(input_text TEXT)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
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
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Only generate slug if it's not already set
  IF NEW.slug IS NULL OR NEW.slug = '' THEN
    NEW.slug := public.generate_slug(NEW.display_name);
  END IF;
  
  RETURN NEW;
END;
$$;