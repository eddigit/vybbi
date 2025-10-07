-- CORRECTION FINALE DES 2 DERNIÈRES FONCTIONS SANS SEARCH_PATH
-- Identification précise et correction des fonctions restantes

-- Fonction auto_update_prospect_score (était manquée dans la correction précédente)
ALTER FUNCTION public.auto_update_prospect_score() 
SET search_path = public;

-- Fonction create_workflow_tasks
ALTER FUNCTION public.create_workflow_tasks(jsonb) 
SET search_path = public;

-- Vérification finale : toutes les fonctions SECURITY DEFINER ont maintenant un search_path sécurisé
-- Ceci devrait éliminer définitivement tous les avertissements "Function Search Path Mutable"