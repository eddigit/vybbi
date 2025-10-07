-- Extension de la table events pour supporter les événements créés par les artistes
ALTER TABLE public.events 
ADD COLUMN created_by_artist boolean DEFAULT false,
ADD COLUMN created_by_user_id uuid REFERENCES auth.users(id),
ADD COLUMN artist_profile_id uuid REFERENCES public.profiles(id);

-- Nouvelle politique RLS pour permettre aux artistes de créer leurs événements
CREATE POLICY "Artists can create their own events" 
ON public.events 
FOR INSERT 
WITH CHECK (
  created_by_artist = true 
  AND created_by_user_id = auth.uid() 
  AND EXISTS (
    SELECT 1 FROM public.profiles p 
    WHERE p.id = events.artist_profile_id 
    AND p.user_id = auth.uid() 
    AND p.profile_type = 'artist'
  )
);

-- Politique pour que les artistes puissent gérer leurs propres événements
CREATE POLICY "Artists can manage their own events" 
ON public.events 
FOR ALL 
USING (
  created_by_artist = true 
  AND created_by_user_id = auth.uid()
);

-- Mise à jour des événements existants pour compatibilité
UPDATE public.events 
SET created_by_artist = false 
WHERE created_by_artist IS NULL;