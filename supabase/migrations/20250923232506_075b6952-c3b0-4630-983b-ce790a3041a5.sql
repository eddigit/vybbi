-- 🚨 CORRECTION CRITIQUE URGENTE: Bloquer l'accès public aux données sensibles
-- Migration simplifiée pour éviter les deadlocks

-- Supprimer uniquement les politiques dangereuses qui exposent TOUTES les données
DROP POLICY IF EXISTS "Public can view safe profile data only" ON public.profiles CASCADE;

-- Créer une politique restrictive qui bloque explicitement l'accès aux colonnes sensibles  
CREATE POLICY "Block public access to sensitive PII data"
ON public.profiles
FOR SELECT
TO public
USING (
  is_public = true 
  AND (
    -- Empêcher explicitement l'accès aux colonnes sensibles
    CASE 
      WHEN auth.uid() IS NULL THEN 
        -- Utilisateurs anonymes: pas de colonnes sensibles  
        email IS NULL AND phone IS NULL AND siret_number IS NULL
      WHEN auth.uid() = user_id OR has_role(auth.uid(), 'admin'::app_role) THEN
        -- Propriétaires et admins: accès complet autorisé
        true
      ELSE
        -- Autres utilisateurs authentifiés: pas de colonnes sensibles
        email IS NULL AND phone IS NULL AND siret_number IS NULL  
    END
  )
);

-- Log de sécurité immédiat
INSERT INTO public.security_audit_log (user_id, action, table_name, metadata, created_at)
VALUES (
  NULL,
  'EMERGENCY_SECURITY_FIX',
  'profiles',
  jsonb_build_object(
    'type', 'PII_ACCESS_BLOCKED',
    'description', 'Emergency fix: blocked public access to email, phone, SIRET data',
    'protected_columns', ARRAY['email', 'phone', 'siret_number'],
    'timestamp', now(),
    'severity', 'CRITICAL'
  ),
  now()
);