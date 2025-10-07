-- Remove the incorrect artist role for this user
DELETE FROM public.user_roles 
WHERE user_id = '2457af1f-a5e8-4827-9be4-d6d87957e03f' 
AND role = 'artist';