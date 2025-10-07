-- Fix the user profile to be an agent instead of artist
UPDATE public.profiles 
SET profile_type = 'agent'
WHERE user_id = '2457af1f-a5e8-4827-9be4-d6d87957e03f';

-- Update the user role to be agent
UPDATE public.user_roles 
SET role = 'agent'
WHERE user_id = '2457af1f-a5e8-4827-9be4-d6d87957e03f';

-- If no role exists, insert it
INSERT INTO public.user_roles (user_id, role)
VALUES ('2457af1f-a5e8-4827-9be4-d6d87957e03f', 'agent')
ON CONFLICT (user_id, role) DO NOTHING;