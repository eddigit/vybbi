-- Create representation_invitations table
CREATE TABLE IF NOT EXISTS public.representation_invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  artist_profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  invited_email TEXT NOT NULL,
  invited_name TEXT NOT NULL,
  invitation_type TEXT NOT NULL CHECK (invitation_type IN ('agent', 'manager')),
  token TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'expired', 'cancelled')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (now() + INTERVAL '7 days'),
  accepted_at TIMESTAMPTZ,
  accepted_by_user_id UUID REFERENCES auth.users(id)
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_representation_invitations_token ON public.representation_invitations(token);
CREATE INDEX IF NOT EXISTS idx_representation_invitations_email ON public.representation_invitations(invited_email);
CREATE INDEX IF NOT EXISTS idx_representation_invitations_artist ON public.representation_invitations(artist_profile_id);

-- Enable RLS
ALTER TABLE public.representation_invitations ENABLE ROW LEVEL SECURITY;

-- Artists can view and manage their own invitations
CREATE POLICY "Artists can manage their invitations"
ON public.representation_invitations
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = representation_invitations.artist_profile_id
    AND p.user_id = auth.uid()
  )
);

-- Anyone with a valid token can view the invitation (for accepting)
CREATE POLICY "Anyone can view invitations by token"
ON public.representation_invitations
FOR SELECT
USING (
  status = 'pending' 
  AND expires_at > now()
);

-- Admins can view all invitations
CREATE POLICY "Admins can view all invitations"
ON public.representation_invitations
FOR SELECT
USING (has_role(auth.uid(), 'admin'));

-- Function to clean up expired invitations
CREATE OR REPLACE FUNCTION public.cleanup_expired_invitations()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  expired_count INTEGER;
BEGIN
  UPDATE public.representation_invitations
  SET status = 'expired'
  WHERE status = 'pending'
    AND expires_at < now();
  
  GET DIAGNOSTICS expired_count = ROW_COUNT;
  RETURN expired_count;
END;
$$;