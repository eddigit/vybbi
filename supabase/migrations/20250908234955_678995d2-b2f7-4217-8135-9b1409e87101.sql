-- Create Agent profile for user 2457af1f-a5e8-4827-9be4-d6d87957e03f
INSERT INTO public.profiles (user_id, display_name, profile_type)
VALUES ('2457af1f-a5e8-4827-9be4-d6d87957e03f', 'Agent', 'agent')
ON CONFLICT (user_id) DO UPDATE SET
  profile_type = 'agent',
  display_name = CASE WHEN profiles.display_name = 'New User' THEN 'Agent' ELSE profiles.display_name END;

-- Add agent role for this user
INSERT INTO public.user_roles (user_id, role)
VALUES ('2457af1f-a5e8-4827-9be4-d6d87957e03f', 'agent')
ON CONFLICT (user_id, role) DO NOTHING;