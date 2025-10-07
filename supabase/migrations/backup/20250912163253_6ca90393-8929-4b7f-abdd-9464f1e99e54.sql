-- Mise à jour des politiques RLS pour vybbi_interactions
-- Permettre à tous les utilisateurs connectés d'utiliser Vybbi

-- Supprimer les anciennes politiques admin-only
DROP POLICY IF EXISTS "Admins can view all Vybbi interactions" ON public.vybbi_interactions;
DROP POLICY IF EXISTS "Admins can insert Vybbi interactions" ON public.vybbi_interactions;

-- Nouvelles politiques pour tous les utilisateurs connectés
CREATE POLICY "Authenticated users can insert Vybbi interactions" 
ON public.vybbi_interactions 
FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can view their own Vybbi interactions" 
ON public.vybbi_interactions 
FOR SELECT 
USING (user_id = auth.uid());

-- Politique spéciale pour les admins (peuvent voir toutes les interactions)
CREATE POLICY "Admins can view all Vybbi interactions" 
ON public.vybbi_interactions 
FOR SELECT 
USING (public.has_role(auth.uid(), 'admin'::app_role));