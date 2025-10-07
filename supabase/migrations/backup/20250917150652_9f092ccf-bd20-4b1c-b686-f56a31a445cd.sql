-- CORRECTION DES DEUX DERNIÈRES FONCTIONS SANS SEARCH_PATH
-- Basé sur les résultats de la requête précédente

ALTER FUNCTION public.create_workflow_tasks() 
SET search_path = public;

-- Double vérification pour auto_update_prospect_score (déjà fait mais on s'assure)
ALTER FUNCTION public.auto_update_prospect_score() 
SET search_path = public;

-- Vérification finale - Maintenant TOUTES les fonctions SECURITY DEFINER 
-- du schéma public ont un search_path sécurisé défini sur 'public'