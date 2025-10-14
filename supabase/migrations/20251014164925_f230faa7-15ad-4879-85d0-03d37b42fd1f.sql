-- Add admin privileges for profile editing and create audit log

-- Update RLS policies on profiles to allow admin access
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;

CREATE POLICY "Users and admins can view profiles"
ON public.profiles
FOR SELECT
USING (
  is_public = true 
  OR user_id = auth.uid() 
  OR has_role(auth.uid(), 'admin'::app_role)
);

CREATE POLICY "Users and admins can update profiles"
ON public.profiles
FOR UPDATE
USING (
  user_id = auth.uid() 
  OR has_role(auth.uid(), 'admin'::app_role)
);

-- Create admin profile edits audit log table
CREATE TABLE IF NOT EXISTS public.admin_profile_edits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  edited_profile_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  changes jsonb NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL
);

-- Enable RLS on admin_profile_edits
ALTER TABLE public.admin_profile_edits ENABLE ROW LEVEL SECURITY;

-- Only admins can view the audit log
CREATE POLICY "Only admins can view edit logs"
ON public.admin_profile_edits
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- System can insert audit logs
CREATE POLICY "System can insert edit logs"
ON public.admin_profile_edits
FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_admin_profile_edits_profile 
ON public.admin_profile_edits(edited_profile_id);

CREATE INDEX IF NOT EXISTS idx_admin_profile_edits_admin 
ON public.admin_profile_edits(admin_user_id);