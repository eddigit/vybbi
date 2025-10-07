-- Phase 2: Pipeline de prospection avancé avec workflows et relances automatiques

-- Table pour les workflows de prospection
CREATE TABLE IF NOT EXISTS public.prospecting_workflows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  prospect_type TEXT NOT NULL,
  trigger_conditions JSONB DEFAULT '{}',
  steps JSONB NOT NULL DEFAULT '[]',
  is_active BOOLEAN DEFAULT TRUE,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Table pour les tâches de follow-up automatiques
CREATE TABLE IF NOT EXISTS public.prospect_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prospect_id UUID REFERENCES public.prospects(id) ON DELETE CASCADE,
  workflow_id UUID REFERENCES public.prospecting_workflows(id),
  agent_id UUID REFERENCES public.vybbi_agents(id),
  task_type TEXT NOT NULL CHECK (task_type IN ('email', 'call', 'whatsapp', 'reminder', 'note')),
  title TEXT NOT NULL,
  description TEXT,
  scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'skipped', 'failed')),
  auto_created BOOLEAN DEFAULT TRUE,
  template_data JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Table pour l'historique de scoring automatique
CREATE TABLE IF NOT EXISTS public.prospect_scoring_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prospect_id UUID REFERENCES public.prospects(id) ON DELETE CASCADE,
  previous_score INTEGER,
  new_score INTEGER,
  score_type TEXT DEFAULT 'qualification',
  factors JSONB DEFAULT '{}',
  calculated_by TEXT DEFAULT 'auto_scoring_system',
  calculated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Table pour les règles de scoring automatique
CREATE TABLE IF NOT EXISTS public.scoring_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  rule_type TEXT NOT NULL CHECK (rule_type IN ('email_opened', 'link_clicked', 'website_visited', 'social_engagement', 'response_received', 'meeting_scheduled')),
  score_impact INTEGER NOT NULL,
  conditions JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Table pour les événements d'engagement
CREATE TABLE IF NOT EXISTS public.prospect_engagement_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prospect_id UUID REFERENCES public.prospects(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  event_data JSONB DEFAULT '{}',
  source TEXT,
  ip_address INET,
  user_agent TEXT,
  occurred_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- RLS pour toutes les nouvelles tables
ALTER TABLE public.prospecting_workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prospect_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prospect_scoring_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scoring_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prospect_engagement_events ENABLE ROW LEVEL SECURITY;

-- Policies pour workflows
CREATE POLICY "Admins can manage workflows" ON public.prospecting_workflows FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Agents can view active workflows" ON public.prospecting_workflows FOR SELECT USING (is_active = true);

-- Policies pour les tâches
CREATE POLICY "Agents can manage their tasks" ON public.prospect_tasks FOR ALL USING (
  EXISTS (SELECT 1 FROM public.vybbi_agents WHERE id = prospect_tasks.agent_id AND user_id = auth.uid())
);
CREATE POLICY "Admins can manage all tasks" ON public.prospect_tasks FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- Policies pour le scoring
CREATE POLICY "Admins can manage scoring history" ON public.prospect_scoring_history FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Agents can view prospect scoring" ON public.prospect_scoring_history FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.prospects p
    JOIN public.vybbi_agents va ON va.id = p.assigned_agent_id
    WHERE p.id = prospect_scoring_history.prospect_id AND va.user_id = auth.uid()
  )
);

CREATE POLICY "Admins can manage scoring rules" ON public.scoring_rules FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Users can view active scoring rules" ON public.scoring_rules FOR SELECT USING (is_active = true);

-- Policies pour les événements d'engagement
CREATE POLICY "Anyone can insert engagement events" ON public.prospect_engagement_events FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can view all engagement events" ON public.prospect_engagement_events FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Agents can view their prospects engagement" ON public.prospect_engagement_events FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.prospects p
    JOIN public.vybbi_agents va ON va.id = p.assigned_agent_id
    WHERE p.id = prospect_engagement_events.prospect_id AND va.user_id = auth.uid()
  )
);

-- Workflow par défaut pour les artistes
INSERT INTO public.prospecting_workflows (name, prospect_type, steps)
VALUES (
  'Workflow Artiste Standard',
  'artist',
  '[
    {
      "step": 1,
      "type": "email",
      "delay_hours": 0,
      "template": "first_contact_artist",
      "title": "Premier contact - Présentation Vybbi"
    },
    {
      "step": 2,
      "type": "reminder",
      "delay_hours": 72,
      "title": "Relance si pas de réponse",
      "condition": "no_response"
    },
    {
      "step": 3,
      "type": "whatsapp",
      "delay_hours": 168,
      "template": "follow_up_whatsapp",
      "title": "Contact WhatsApp",
      "condition": "still_no_response"
    },
    {
      "step": 4,
      "type": "call",
      "delay_hours": 336,
      "title": "Appel de suivi",
      "condition": "high_priority_only"
    }
  ]'
);

-- Workflow pour les lieux/clubs
INSERT INTO public.prospecting_workflows (name, prospect_type, steps)
VALUES (
  'Workflow Lieux & Clubs',
  'venue',
  '[
    {
      "step": 1,
      "type": "email",
      "delay_hours": 0,
      "template": "first_contact_venue",
      "title": "Présentation partenariat lieux"
    },
    {
      "step": 2,
      "type": "reminder",
      "delay_hours": 48,
      "title": "Relance rapide (secteur très réactif)",
      "condition": "no_response"
    },
    {
      "step": 3,
      "type": "whatsapp",
      "delay_hours": 120,
      "template": "venue_whatsapp_follow_up",
      "title": "WhatsApp avec proposition concrete"
    }
  ]'
);

-- Workflow pour les sponsors/partenaires
INSERT INTO public.prospecting_workflows (name, prospect_type, steps)
VALUES (
  'Workflow Sponsors & Partenaires',
  'sponsors',
  '[
    {
      "step": 1,
      "type": "email",
      "delay_hours": 0,
      "template": "sponsor_introduction",
      "title": "Introduction partenariat Vybbi"
    },
    {
      "step": 2,
      "type": "reminder",
      "delay_hours": 120,
      "title": "Relance avec métriques",
      "condition": "no_response"
    },
    {
      "step": 3,
      "type": "call",
      "delay_hours": 240,
      "title": "Appel commercial personnalisé"
    }
  ]'
);

-- Règles de scoring par défaut
INSERT INTO public.scoring_rules (name, rule_type, score_impact, conditions)
VALUES 
  ('Email ouvert', 'email_opened', 5, '{"min_opens": 1}'),
  ('Lien cliqué dans email', 'link_clicked', 15, '{"source": "email"}'),
  ('Réponse reçue', 'response_received', 25, '{}'),
  ('Meeting planifié', 'meeting_scheduled', 50, '{}'),
  ('Visite site web', 'website_visited', 10, '{"min_duration_seconds": 30}'),
  ('Engagement réseaux sociaux', 'social_engagement', 8, '{"platform": "any"}');

-- Trigger pour le scoring automatique
CREATE OR REPLACE FUNCTION public.auto_update_prospect_score()
RETURNS TRIGGER AS $$
DECLARE
  current_score INTEGER;
  new_score INTEGER;
  rule_record RECORD;
BEGIN
  -- Récupérer le score actuel
  SELECT qualification_score INTO current_score
  FROM public.prospects 
  WHERE id = NEW.prospect_id;
  
  new_score := current_score;
  
  -- Appliquer les règles de scoring correspondantes
  FOR rule_record IN 
    SELECT * FROM public.scoring_rules 
    WHERE rule_type = NEW.event_type AND is_active = true
  LOOP
    new_score := LEAST(new_score + rule_record.score_impact, 100);
  END LOOP;
  
  -- Mettre à jour le score si changement
  IF new_score != current_score THEN
    UPDATE public.prospects 
    SET 
      qualification_score = new_score,
      last_engagement_score = new_score,
      engagement_history = COALESCE(engagement_history, '[]'::jsonb) || jsonb_build_object(
        'timestamp', now(),
        'event_type', NEW.event_type,
        'score_change', new_score - current_score,
        'new_score', new_score
      )
    WHERE id = NEW.prospect_id;
    
    -- Enregistrer l'historique
    INSERT INTO public.prospect_scoring_history (
      prospect_id, previous_score, new_score, factors
    ) VALUES (
      NEW.prospect_id, current_score, new_score,
      jsonb_build_object('trigger_event', NEW.event_type, 'event_data', NEW.event_data)
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Créer le trigger
CREATE TRIGGER trigger_auto_scoring
  AFTER INSERT ON public.prospect_engagement_events
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_update_prospect_score();

-- Trigger pour créer les tâches de workflow automatiquement
CREATE OR REPLACE FUNCTION public.create_workflow_tasks()
RETURNS TRIGGER AS $$
DECLARE
  workflow_record RECORD;
  step_record JSONB;
  task_scheduled_at TIMESTAMP WITH TIME ZONE;
BEGIN
  -- Chercher le workflow correspondant au type de prospect
  SELECT * INTO workflow_record
  FROM public.prospecting_workflows
  WHERE prospect_type = NEW.prospect_type 
    AND is_active = true
  ORDER BY created_at DESC
  LIMIT 1;
  
  IF workflow_record.id IS NOT NULL THEN
    -- Créer une tâche pour chaque étape du workflow
    FOR step_record IN SELECT * FROM jsonb_array_elements(workflow_record.steps)
    LOOP
      task_scheduled_at := NEW.created_at + (step_record->>'delay_hours')::INTEGER * INTERVAL '1 hour';
      
      INSERT INTO public.prospect_tasks (
        prospect_id,
        workflow_id,
        agent_id,
        task_type,
        title,
        description,
        scheduled_at,
        template_data
      ) VALUES (
        NEW.id,
        workflow_record.id,
        NEW.assigned_agent_id,
        step_record->>'type',
        step_record->>'title',
        COALESCE(step_record->>'description', 'Tâche générée automatiquement par workflow'),
        task_scheduled_at,
        jsonb_build_object(
          'step', step_record->>'step',
          'template', step_record->>'template',
          'condition', step_record->>'condition'
        )
      );
    END LOOP;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Créer le trigger pour les nouveaux prospects
CREATE TRIGGER trigger_create_workflow_tasks
  AFTER INSERT ON public.prospects
  FOR EACH ROW
  EXECUTE FUNCTION public.create_workflow_tasks();