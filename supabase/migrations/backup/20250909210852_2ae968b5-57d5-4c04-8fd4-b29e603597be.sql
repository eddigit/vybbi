-- Add CHECK constraint for rating validation (1-5 stars)
ALTER TABLE public.reviews 
ADD CONSTRAINT rating_valid_range CHECK (rating >= 1 AND rating <= 5);

-- Add unique constraint to prevent duplicate reviews from same reviewer to same artist
ALTER TABLE public.reviews 
ADD CONSTRAINT unique_reviewer_reviewed UNIQUE (reviewer_id, reviewed_profile_id);

-- Drop the existing simple review creation policy
DROP POLICY IF EXISTS "Users can create reviews" ON public.reviews;

-- Create more restrictive RLS policy for review creation
-- Only allow agents, managers, and venues to review artists
CREATE POLICY "Only agents_managers_venues can review artists" 
ON public.reviews 
FOR INSERT 
WITH CHECK (
  auth.uid() = reviewer_id 
  AND EXISTS (
    SELECT 1 FROM public.profiles reviewer_profile
    WHERE reviewer_profile.user_id = auth.uid()
    AND reviewer_profile.profile_type IN ('agent', 'manager', 'lieu')
  )
  AND EXISTS (
    SELECT 1 FROM public.profiles reviewed_profile  
    WHERE reviewed_profile.id = reviewed_profile_id
    AND reviewed_profile.profile_type = 'artist'
  )
);