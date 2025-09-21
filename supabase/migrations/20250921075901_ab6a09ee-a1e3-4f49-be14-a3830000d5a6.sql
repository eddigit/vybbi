-- Create admin_secrets table for secure storage of sensitive information
CREATE TABLE public.admin_secrets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'general',
  value TEXT NOT NULL,
  description TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  last_accessed_at TIMESTAMP WITH TIME ZONE,
  last_accessed_by UUID REFERENCES auth.users(id)
);

-- Enable RLS
ALTER TABLE public.admin_secrets ENABLE ROW LEVEL SECURITY;

-- Create policies - only admins can access
CREATE POLICY "Only admins can manage secrets" 
ON public.admin_secrets 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Only admins can view secrets" 
ON public.admin_secrets 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create index for performance
CREATE INDEX idx_admin_secrets_category ON public.admin_secrets(category);
CREATE INDEX idx_admin_secrets_name ON public.admin_secrets(name);

-- Create trigger for updated_at
CREATE TRIGGER update_admin_secrets_updated_at
BEFORE UPDATE ON public.admin_secrets
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert blockchain roadmap items
INSERT INTO public.roadmap_items (type, title, description, status, priority, area, audience, sort_order) VALUES
  ('feature', 'Certification Blockchain pour Sorties Musicales', 'Protection et certification des créations musicales sur la blockchain Solana avec génération de hashes uniques et preuves d''antériorité immutables', 'done', 'high', 'Blockchain', 'Artistes', 1000),
  ('feature', 'Génération QR Code de Certification', 'Génération automatique de QR codes pour vérifier l''authenticité des certifications blockchain. Permet aux fans et professionnels de vérifier instantanément l''origine d''une œuvre', 'done', 'medium', 'Blockchain', 'Public', 1001),
  ('feature', 'Badge de Certification Blockchain', 'Affichage visuel des certifications blockchain sur les profils artistes et releases avec design distinctif pour renforcer la crédibilité', 'done', 'medium', 'UI/UX', 'Artistes', 1002),
  ('task', 'Intégration Solana pour Certificats', 'Implémentation de l''intégration avec la blockchain Solana pour stocker les hashes de certification et générer les preuves cryptographiques', 'done', 'critical', 'Backend', 'Technique', 1003),
  ('selling_point', 'Protection Blockchain de vos Œuvres Musicales', 'Certifiez et protégez vos créations avec la technologie blockchain. Preuves d''antériorité immutables, QR codes de vérification et reconnaissance mondiale de vos droits d''auteur', 'done', 'high', 'Marketing', 'Artistes', 1004),
  ('feature', 'Système de Vérification Publique', 'Interface publique permettant à quiconque de vérifier l''authenticité d''une certification blockchain via QR code ou hash', 'planned', 'medium', 'Blockchain', 'Public', 1005),
  ('task', 'Integration Portefeuille Crypto', 'Permettre aux artistes de connecter leur portefeuille crypto pour recevoir des royalties directement sur la blockchain', 'planned', 'high', 'Blockchain', 'Artistes', 1006);