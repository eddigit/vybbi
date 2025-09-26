-- Ajouter le champ profile_types pour spécifier les types de profils recherchés dans les annonces
ALTER TABLE public.annonces 
ADD COLUMN profile_types text[] DEFAULT NULL;

-- Ajouter un commentaire pour expliquer le champ
COMMENT ON COLUMN public.annonces.profile_types IS 'Types de profils recherchés pour les prestations artistiques (dj, chanteur, groupe, musicien, danseur, performer, magicien, etc.)';

-- Mettre à jour les annonces existantes avec des exemples de types de profils
UPDATE public.annonces 
SET profile_types = ARRAY['dj', 'musicien'] 
WHERE genres IS NOT NULL AND array_length(genres, 1) > 0;