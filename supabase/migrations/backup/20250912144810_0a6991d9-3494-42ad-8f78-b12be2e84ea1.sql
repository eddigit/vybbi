-- Fix security warnings by updating functions with proper search_path
CREATE OR REPLACE FUNCTION calculate_profile_completion(profile_row profiles)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  completion_score integer := 0;
BEGIN
  -- Basic information (60% total)
  IF profile_row.display_name IS NOT NULL AND profile_row.display_name != '' THEN
    completion_score := completion_score + 10;
  END IF;
  
  IF profile_row.bio IS NOT NULL AND profile_row.bio != '' THEN
    completion_score := completion_score + 15;
  END IF;
  
  IF profile_row.avatar_url IS NOT NULL AND profile_row.avatar_url != '' THEN
    completion_score := completion_score + 15;
  END IF;
  
  IF profile_row.location IS NOT NULL AND profile_row.location != '' THEN
    completion_score := completion_score + 10;
  END IF;
  
  IF profile_row.genres IS NOT NULL AND array_length(profile_row.genres, 1) > 0 THEN
    completion_score := completion_score + 15;
  END IF;
  
  -- Profile type specific information (25% total)
  IF profile_row.profile_type = 'artist' THEN
    IF profile_row.spotify_url IS NOT NULL OR profile_row.soundcloud_url IS NOT NULL OR profile_row.youtube_url IS NOT NULL THEN
      completion_score := completion_score + 15;
    END IF;
  ELSE
    IF profile_row.email IS NOT NULL AND profile_row.email != '' THEN
      completion_score := completion_score + 15;
    END IF;
  END IF;
  
  -- Additional information (15% total)
  IF profile_row.experience IS NOT NULL AND profile_row.experience != '' THEN
    completion_score := completion_score + 10;
  END IF;
  
  IF profile_row.languages IS NOT NULL AND array_length(profile_row.languages, 1) > 0 THEN
    completion_score := completion_score + 10;
  END IF;
  
  RETURN LEAST(completion_score, 100);
END;
$$;

CREATE OR REPLACE FUNCTION update_profile_completion()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  NEW.profile_completion_percentage := public.calculate_profile_completion(NEW);
  NEW.onboarding_completed := NEW.profile_completion_percentage >= 70;
  RETURN NEW;
END;
$$;