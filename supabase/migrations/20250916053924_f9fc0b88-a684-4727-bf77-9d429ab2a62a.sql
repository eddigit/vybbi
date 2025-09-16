-- Phase 1: Enrichissement de la table prospects avec de nouveaux champs
ALTER TABLE public.prospects ADD COLUMN IF NOT EXISTS instagram_url TEXT;
ALTER TABLE public.prospects ADD COLUMN IF NOT EXISTS linkedin_url TEXT;
ALTER TABLE public.prospects ADD COLUMN IF NOT EXISTS twitter_url TEXT;
ALTER TABLE public.prospects ADD COLUMN IF NOT EXISTS tiktok_url TEXT;
ALTER TABLE public.prospects ADD COLUMN IF NOT EXISTS youtube_url TEXT;
ALTER TABLE public.prospects ADD COLUMN IF NOT EXISTS facebook_url TEXT;

-- Tags système pour catégorisation avancée
ALTER TABLE public.prospects ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}';
ALTER TABLE public.prospects ADD COLUMN IF NOT EXISTS priority_level TEXT DEFAULT 'medium' CHECK (priority_level IN ('low', 'medium', 'high', 'critical'));
ALTER TABLE public.prospects ADD COLUMN IF NOT EXISTS industry_sector TEXT;
ALTER TABLE public.prospects ADD COLUMN IF NOT EXISTS company_size TEXT DEFAULT 'unknown' CHECK (company_size IN ('startup', 'small', 'medium', 'large', 'enterprise', 'unknown'));
ALTER TABLE public.prospects ADD COLUMN IF NOT EXISTS estimated_budget INTEGER;
ALTER TABLE public.prospects ADD COLUMN IF NOT EXISTS influence_score INTEGER DEFAULT 0 CHECK (influence_score >= 0 AND influence_score <= 100);
ALTER TABLE public.prospects ADD COLUMN IF NOT EXISTS whatsapp_number TEXT;

-- Géolocalisation et marché
ALTER TABLE public.prospects ADD COLUMN IF NOT EXISTS region TEXT;
ALTER TABLE public.prospects ADD COLUMN IF NOT EXISTS country TEXT DEFAULT 'FR';
ALTER TABLE public.prospects ADD COLUMN IF NOT EXISTS timezone TEXT DEFAULT 'Europe/Paris';

-- Informations de networking
ALTER TABLE public.prospects ADD COLUMN IF NOT EXISTS referral_source TEXT;
ALTER TABLE public.prospects ADD COLUMN IF NOT EXISTS referral_prospect_id UUID REFERENCES public.prospects(id);
ALTER TABLE public.prospects ADD COLUMN IF NOT EXISTS collaboration_potential TEXT DEFAULT 'unknown' CHECK (collaboration_potential IN ('high', 'medium', 'low', 'unknown'));

-- Données d'engagement automatique
ALTER TABLE public.prospects ADD COLUMN IF NOT EXISTS last_engagement_score INTEGER DEFAULT 0;
ALTER TABLE public.prospects ADD COLUMN IF NOT EXISTS engagement_history JSONB DEFAULT '[]';
ALTER TABLE public.prospects ADD COLUMN IF NOT EXISTS auto_scoring_enabled BOOLEAN DEFAULT TRUE;

-- Créer la table pour les tags personnalisables
CREATE TABLE IF NOT EXISTS public.prospect_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  color TEXT DEFAULT '#3b82f6',
  description TEXT,
  category TEXT DEFAULT 'general',
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  is_system BOOLEAN DEFAULT FALSE
);

-- RLS pour prospect_tags
ALTER TABLE public.prospect_tags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage all tags" ON public.prospect_tags FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Users can view all active tags" ON public.prospect_tags FOR SELECT USING (TRUE);

-- Table pour l'import en masse
CREATE TABLE IF NOT EXISTS public.prospect_imports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  file_name TEXT NOT NULL,
  imported_by UUID REFERENCES auth.users(id),
  total_records INTEGER DEFAULT 0,
  successful_imports INTEGER DEFAULT 0,
  failed_imports INTEGER DEFAULT 0,
  import_status TEXT DEFAULT 'processing' CHECK (import_status IN ('processing', 'completed', 'failed')),
  error_details JSONB DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- RLS pour prospect_imports
ALTER TABLE public.prospect_imports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage imports" ON public.prospect_imports FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- Créer quelques tags système de base
INSERT INTO public.prospect_tags (name, color, description, category, is_system)
VALUES 
  ('VIP', '#ef4444', 'Prospect très important', 'priority', TRUE),
  ('Chaud', '#f97316', 'Prospect très intéressé', 'temperature', TRUE),
  ('Froid', '#3b82f6', 'Prospect peu engagé', 'temperature', TRUE),
  ('Influenceur', '#8b5cf6', 'Personnalité influente', 'type', TRUE),
  ('Sponsor Potentiel', '#eab308', 'Peut devenir sponsor', 'opportunity', TRUE),
  ('Média', '#06b6d4', 'Contact média/presse', 'type', TRUE),
  ('Festival', '#10b981', 'Organisateur festival', 'type', TRUE),
  ('Label', '#ec4899', 'Maison de disques', 'type', TRUE)
ON CONFLICT (name) DO NOTHING;