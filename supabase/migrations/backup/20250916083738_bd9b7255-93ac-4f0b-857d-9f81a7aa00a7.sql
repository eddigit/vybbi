-- Supprimer tous les rôles de l'utilisateur sauf admin
DELETE FROM public.user_roles 
WHERE user_id = '9f7bfae4-4b73-416e-b658-c7a668e2c271' 
  AND role != 'admin';

-- S'assurer qu'il a le rôle admin
INSERT INTO public.user_roles (user_id, role)
VALUES ('9f7bfae4-4b73-416e-b658-c7a668e2c271', 'admin')
ON CONFLICT (user_id, role) DO NOTHING;