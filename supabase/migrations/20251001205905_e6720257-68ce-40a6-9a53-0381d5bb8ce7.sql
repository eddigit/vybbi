-- Améliorer la fonction generate_slug pour des slugs plus courts et optimisés
CREATE OR REPLACE FUNCTION public.generate_slug(input_text text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  base_slug TEXT;
  final_slug TEXT;
  counter INTEGER := 1;
  words TEXT[];
  first_word TEXT;
BEGIN
  -- Convert to lowercase and clean
  base_slug := lower(trim(input_text));
  
  -- Remove common artist prefixes (DJ, MC, etc.)
  base_slug := regexp_replace(base_slug, '^(dj|mc|mr|mrs|ms|dr)\s+', '', 'gi');
  
  -- Split into words
  words := regexp_split_to_array(base_slug, '\s+');
  
  -- If multiple words, prefer first word (if > 3 chars) or first two words
  IF array_length(words, 1) > 1 THEN
    first_word := words[1];
    IF length(first_word) >= 3 THEN
      base_slug := first_word;
    ELSE
      -- Use first two words if first is too short
      base_slug := words[1] || '-' || words[2];
    END IF;
  END IF;
  
  -- Normalize accents
  base_slug := regexp_replace(base_slug, '[àáâãäå]', 'a', 'g');
  base_slug := regexp_replace(base_slug, '[èéêë]', 'e', 'g');
  base_slug := regexp_replace(base_slug, '[ìíîï]', 'i', 'g');
  base_slug := regexp_replace(base_slug, '[òóôõö]', 'o', 'g');
  base_slug := regexp_replace(base_slug, '[ùúûü]', 'u', 'g');
  base_slug := regexp_replace(base_slug, '[ý]', 'y', 'g');
  base_slug := regexp_replace(base_slug, '[ñ]', 'n', 'g');
  base_slug := regexp_replace(base_slug, '[ç]', 'c', 'g');
  
  -- Remove special characters, keep only alphanumeric and hyphens
  base_slug := regexp_replace(base_slug, '[^a-z0-9\-]', '-', 'g');
  base_slug := regexp_replace(base_slug, '-+', '-', 'g');
  base_slug := trim(base_slug, '-');
  
  -- Limit length to 20 characters
  IF length(base_slug) > 20 THEN
    base_slug := substring(base_slug from 1 for 20);
    base_slug := trim(base_slug, '-');
  END IF;
  
  -- Ensure slug is not empty
  IF length(base_slug) = 0 THEN
    base_slug := 'artiste';
  END IF;
  
  final_slug := base_slug;
  
  -- Check for conflicts and add counter if needed
  WHILE EXISTS (SELECT 1 FROM public.profiles WHERE slug = final_slug) LOOP
    counter := counter + 1;
    final_slug := base_slug || '-' || counter::TEXT;
  END LOOP;
  
  RETURN final_slug;
END;
$function$;

-- Fonction pour vérifier la disponibilité d'un slug
CREATE OR REPLACE FUNCTION public.check_slug_availability(desired_slug text, profile_id_to_exclude uuid DEFAULT NULL)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  RETURN NOT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE slug = desired_slug 
    AND (profile_id_to_exclude IS NULL OR id != profile_id_to_exclude)
  );
END;
$function$;