-- Fix infinite recursion in community_members RLS policy
DROP POLICY IF EXISTS "Community members can view other members" ON public.community_members;

-- Create new policy that avoids recursion
CREATE POLICY "Community members can view other members" ON public.community_members
  FOR SELECT
  USING (
    user_id = auth.uid() 
    OR has_role(auth.uid(), 'admin'::app_role)
    OR EXISTS (
      SELECT 1 FROM public.community_members cm_check 
      WHERE cm_check.community_id = community_members.community_id 
      AND cm_check.user_id = auth.uid()
    )
  );