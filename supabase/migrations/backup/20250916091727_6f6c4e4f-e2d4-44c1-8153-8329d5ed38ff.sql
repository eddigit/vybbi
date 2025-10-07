-- Corriger la politique RLS pour permettre l'accès aux communautés publiques sans authentification
DROP POLICY IF EXISTS "Public communities are viewable by everyone" ON public.communities;

-- Nouvelle politique permettant l'accès aux communautés publiques même sans authentification
CREATE POLICY "Public communities are viewable by everyone" ON public.communities
FOR SELECT USING (
  (type = 'public' AND is_active = true) 
  OR 
  (auth.uid() IS NOT NULL AND EXISTS (
    SELECT 1 FROM community_members cm 
    WHERE cm.community_id = id AND cm.user_id = auth.uid()
  ))
);