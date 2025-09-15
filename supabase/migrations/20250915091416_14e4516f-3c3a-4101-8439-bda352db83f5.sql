-- Add secondary profile type for partners to improve search categorization
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS secondary_profile_type profile_type NULL;

-- Helpful index for filtering by secondary category
CREATE INDEX IF NOT EXISTS idx_profiles_secondary_profile_type
  ON public.profiles (secondary_profile_type);
