-- Ajouter le rôle admin à l'utilisateur partenaire
INSERT INTO public.user_roles (user_id, role)
VALUES ('9f7bfae4-4b73-416e-b658-c7a668e2c271', 'admin')
ON CONFLICT (user_id, role) DO NOTHING;