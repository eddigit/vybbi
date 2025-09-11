-- Grant admin role to the current user to unblock ad management actions
-- Uses the user id observed in recent logs: 048d6a10-1072-444f-abc3-b18cef7d940f

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = '048d6a10-1072-444f-abc3-b18cef7d940f'::uuid
      AND role = 'admin'::app_role
  ) THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES ('048d6a10-1072-444f-abc3-b18cef7d940f'::uuid, 'admin'::app_role);
  END IF;
END $$;