-- Migration demo sécurisée pour tester le workflow Staging
-- Cette migration ajoute une table simple pour les notes de démonstration

-- Créer une table demo_notes si elle n'existe pas déjà
CREATE TABLE IF NOT EXISTS public.demo_notes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    content TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id),
    is_demo BOOLEAN DEFAULT true
);

-- Activer RLS
ALTER TABLE public.demo_notes ENABLE ROW LEVEL SECURITY;

-- Politique de lecture publique
CREATE POLICY "Demo notes are readable by everyone" ON public.demo_notes
    FOR SELECT USING (true);

-- Politique d'écriture pour les utilisateurs authentifiés
CREATE POLICY "Users can create demo notes" ON public.demo_notes
    FOR INSERT WITH CHECK (auth.uid() = created_by);

-- Ajouter un index pour les performances
CREATE INDEX IF NOT EXISTS demo_notes_created_at_idx ON public.demo_notes(created_at);

-- Insérer une note de démonstration
INSERT INTO public.demo_notes (title, content, created_by) 
VALUES (
    'Note de test Vybbi Staging',
    'Cette note confirme que le workflow de migration fonctionne correctement sur l''environnement Staging.',
    NULL
) ON CONFLICT DO NOTHING;