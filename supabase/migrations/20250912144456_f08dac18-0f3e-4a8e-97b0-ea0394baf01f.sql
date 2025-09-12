-- Add onboarding fields to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS onboarding_completed boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS profile_completion_percentage integer DEFAULT 0;

-- Update existing profiles to calculate completion percentage
UPDATE public.profiles 
SET profile_completion_percentage = (
  CASE 
    WHEN display_name IS NOT NULL AND display_name != '' THEN 10 ELSE 0 END +
  CASE 
    WHEN bio IS NOT NULL AND bio != '' THEN 15 ELSE 0 END +
  CASE 
    WHEN avatar_url IS NOT NULL AND avatar_url != '' THEN 15 ELSE 0 END +
  CASE 
    WHEN location IS NOT NULL AND location != '' THEN 10 ELSE 0 END +
  CASE 
    WHEN genres IS NOT NULL AND array_length(genres, 1) > 0 THEN 15 ELSE 0 END +
  CASE 
    WHEN (profile_type = 'artist' AND (spotify_url IS NOT NULL OR soundcloud_url IS NOT NULL OR youtube_url IS NOT NULL)) 
         OR (profile_type IN ('agent', 'manager', 'lieu') AND email IS NOT NULL) THEN 15 ELSE 0 END +
  CASE 
    WHEN experience IS NOT NULL AND experience != '' THEN 10 ELSE 0 END +
  CASE 
    WHEN languages IS NOT NULL AND array_length(languages, 1) > 0 THEN 10 ELSE 0 END
);

-- Mark profiles as completed if they have a completion percentage >= 70%
UPDATE public.profiles 
SET onboarding_completed = true 
WHERE profile_completion_percentage >= 70;

-- Create function to calculate profile completion percentage
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

-- Create trigger to automatically update completion percentage
CREATE OR REPLACE FUNCTION update_profile_completion()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  NEW.profile_completion_percentage := calculate_profile_completion(NEW);
  NEW.onboarding_completed := NEW.profile_completion_percentage >= 70;
  RETURN NEW;
END;
$$;

-- Create trigger
DROP TRIGGER IF EXISTS profile_completion_trigger ON public.profiles;
CREATE TRIGGER profile_completion_trigger
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_profile_completion();