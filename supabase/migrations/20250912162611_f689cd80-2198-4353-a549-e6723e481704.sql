-- Créer la table pour stocker les interactions avec Vybbi
CREATE TABLE public.vybbi_interactions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  message text NOT NULL,
  response text NOT NULL,
  action text,
  filters jsonb,
  user_id uuid REFERENCES auth.users(id),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.vybbi_interactions ENABLE ROW LEVEL SECURITY;

-- Politiques RLS
CREATE POLICY "Admins can view all Vybbi interactions" 
ON public.vybbi_interactions 
FOR SELECT 
USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can insert Vybbi interactions" 
ON public.vybbi_interactions 
FOR INSERT 
WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

-- Trigger pour updated_at
CREATE TRIGGER update_vybbi_interactions_updated_at
  BEFORE UPDATE ON public.vybbi_interactions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();