-- CORRECTION DE LA DERNIÈRE FONCTION SANS SEARCH_PATH
-- Correction uniquement de auto_update_prospect_score

-- Vérification et correction de la fonction auto_update_prospect_score
-- Même si elle était dans la migration précédente, elle semble ne pas avoir été appliquée correctement
DO $$
BEGIN
  -- Vérifier si la fonction existe avant de la corriger
  IF EXISTS (
    SELECT 1 FROM pg_proc p
    JOIN pg_namespace n ON p.pronamespace = n.oid
    WHERE n.nspname = 'public' 
    AND p.proname = 'auto_update_prospect_score'
    AND p.prosecdef = true
  ) THEN
    -- Appliquer le search_path sécurisé
    ALTER FUNCTION public.auto_update_prospect_score() 
    SET search_path = public;
  END IF;
END $$;

-- Maintenant toutes les fonctions SECURITY DEFINER ont un search_path sécurisé