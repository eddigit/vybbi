-- CORRECTION URGENTE : Récursion infinie dans community_members
-- Problème : Les politiques RLS font des requêtes sur la même table qu'elles protègent

-- 1. Créer une fonction SECURITY DEFINER pour vérifier l'appartenance aux communautés
CREATE OR REPLACE FUNCTION public.is_community_member(community_id_param uuid, user_id_param uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM community_members cm
    WHERE cm.community_id = community_id_param 
    AND cm.user_id = user_id_param
  );
END;
$$;

-- 2. Supprimer les politiques problématiques existantes
DROP POLICY IF EXISTS "Community members can view other members" ON public.community_members;
DROP POLICY IF EXISTS "Community admins can manage members" ON public.community_members;
DROP POLICY IF EXISTS "Users can join public communities" ON public.community_members;

-- 3. Créer de nouvelles politiques sans récursion
-- Politique pour que les utilisateurs voient leur propre appartenance
CREATE POLICY "Users can view their own memberships"
ON public.community_members
FOR SELECT
USING (user_id = auth.uid());

-- Politique pour que les admins généraux voient tous les membres
CREATE POLICY "Admins can view all memberships"
ON public.community_members  
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Politique pour que les créateurs de communautés voient leurs membres
CREATE POLICY "Community creators can view their members"
ON public.community_members
FOR SELECT
USING (EXISTS (
  SELECT 1 FROM communities c 
  WHERE c.id = community_members.community_id 
  AND c.created_by = auth.uid()
));

-- Politique pour que les modérateurs voient les membres (sans récursion)
CREATE POLICY "Community moderators can view members"
ON public.community_members
FOR SELECT  
USING (user_id = auth.uid() OR auth.uid() IN (
  SELECT cm2.user_id FROM community_members cm2 
  WHERE cm2.community_id = community_members.community_id 
  AND cm2.role IN ('owner', 'admin', 'moderator')
  AND cm2.user_id = auth.uid()
));

-- Politique d'insertion pour rejoindre des communautés publiques
CREATE POLICY "Users can join public communities"
ON public.community_members
FOR INSERT
WITH CHECK (
  user_id = auth.uid() 
  AND EXISTS (
    SELECT 1 FROM communities c 
    WHERE c.id = community_members.community_id 
    AND c.type = 'public' 
    AND c.is_active = true
  )
);

-- Politique pour que les admins de communauté gèrent les membres
CREATE POLICY "Community admins can manage members"
ON public.community_members
FOR ALL
USING (
  has_role(auth.uid(), 'admin'::app_role) 
  OR EXISTS (
    SELECT 1 FROM communities c 
    WHERE c.id = community_members.community_id 
    AND c.created_by = auth.uid()
  )
);

-- 4. Corriger également la politique des communautés qui utilise community_members
DROP POLICY IF EXISTS "Private communities viewable by members" ON public.communities;

-- Nouvelle politique pour les communautés privées sans récursion
CREATE POLICY "Private communities viewable by members"
ON public.communities
FOR SELECT
USING (
  (type = 'public' AND is_active = true)
  OR has_role(auth.uid(), 'admin'::app_role) 
  OR created_by = auth.uid()
  OR public.is_community_member(id, auth.uid())
);

-- 5. Ajouter un index pour optimiser les performances
CREATE INDEX IF NOT EXISTS idx_community_members_lookup 
ON community_members(community_id, user_id, role);

-- 6. Optimiser la politique des messages communautaires
DROP POLICY IF EXISTS "Community members can view messages" ON public.community_messages;
DROP POLICY IF EXISTS "Community members can send messages" ON public.community_messages;

CREATE POLICY "Community members can view messages"
ON public.community_messages
FOR SELECT
USING (
  has_role(auth.uid(), 'admin'::app_role)
  OR EXISTS (
    SELECT 1 FROM community_channels cc
    JOIN communities c ON c.id = cc.community_id
    WHERE cc.id = community_messages.channel_id 
    AND (c.created_by = auth.uid() OR public.is_community_member(c.id, auth.uid()))
  )
);

CREATE POLICY "Community members can send messages"  
ON public.community_messages
FOR INSERT
WITH CHECK (
  sender_id = auth.uid() 
  AND EXISTS (
    SELECT 1 FROM community_channels cc
    JOIN communities c ON c.id = cc.community_id  
    WHERE cc.id = community_messages.channel_id
    AND public.is_community_member(c.id, auth.uid())
    AND NOT EXISTS (
      SELECT 1 FROM community_members cm 
      WHERE cm.community_id = c.id 
      AND cm.user_id = auth.uid() 
      AND cm.is_muted = true
    )
  )
);