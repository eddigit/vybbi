-- Create roadmap_items table (assuming enums might already exist)
CREATE TABLE IF NOT EXISTS public.roadmap_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  type TEXT NOT NULL CHECK (type IN ('feature', 'task', 'selling_point')),
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'planned' CHECK (status IN ('done', 'in_progress', 'planned', 'on_hold', 'cancelled')),
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  area TEXT, -- e.g., 'messaging', 'events', 'profiles', etc.
  audience TEXT, -- e.g., 'artists', 'venues', 'agents', 'all'
  due_date DATE,
  sort_order INTEGER DEFAULT 0,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.roadmap_items ENABLE ROW LEVEL SECURITY;

-- Create policies for admin-only access
CREATE POLICY "Only admins can view roadmap items" 
ON public.roadmap_items 
FOR SELECT 
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can create roadmap items" 
ON public.roadmap_items 
FOR INSERT 
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can update roadmap items" 
ON public.roadmap_items 
FOR UPDATE 
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can delete roadmap items" 
ON public.roadmap_items 
FOR DELETE 
USING (public.has_role(auth.uid(), 'admin'));

-- Create trigger for updated_at
CREATE TRIGGER update_roadmap_items_updated_at
BEFORE UPDATE ON public.roadmap_items
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert initial roadmap data
INSERT INTO public.roadmap_items (type, title, description, status, priority, area, audience, sort_order) VALUES
-- Completed Features
('feature', 'Authentication System', 'Complete user authentication with profile creation and role management', 'done', 'critical', 'authentication', 'all', 1),
('feature', 'Messaging System', 'Direct messaging between users with conversation management', 'done', 'high', 'messaging', 'all', 2),
('feature', 'Event Management', 'Create, edit, and manage events with publication system', 'done', 'high', 'events', 'venues', 3),
('feature', 'Announcements System', 'Job posting system with application management', 'done', 'high', 'announcements', 'venues', 4),
('feature', 'Artist Representation', 'Agent/Manager to Artist relationship management', 'done', 'medium', 'representation', 'agents,managers,artists', 5),
('feature', 'Profile Management', 'Comprehensive profile system with media assets', 'done', 'high', 'profiles', 'all', 6),
('feature', 'Review System', 'Rating and review system for artists', 'done', 'medium', 'reviews', 'venues,agents,managers', 7),
('feature', 'Dashboard Analytics', 'Basic dashboard structure with metric cards', 'done', 'medium', 'dashboard', 'all', 8),
('feature', 'Notification System', 'Real-time notifications with sound and permissions', 'done', 'medium', 'notifications', 'all', 9),

-- Planned/In Progress Tasks
('task', 'Implement Booking UI', 'Create user interface for event booking management', 'planned', 'high', 'events', 'artists,venues', 10),
('task', 'Artist Availability Management', 'UI for managing artist availability slots', 'planned', 'high', 'availability', 'artists', 11),
('task', 'Integrate Blocked Users in Messaging', 'Connect blocked_users table with messaging UI', 'planned', 'medium', 'messaging', 'all', 12),
('task', 'Admin Role Management', 'Create admin interface for managing user roles', 'planned', 'high', 'admin', 'admin', 13),
('task', 'Connect Real Data to Dashboards', 'Replace mock data with real database queries', 'planned', 'medium', 'dashboard', 'all', 14),
('task', 'Advanced Event Filters', 'Implement search and filtering for events', 'done', 'medium', 'events', 'all', 15),
('task', 'File Upload System', 'Implement media upload for profiles and messages', 'planned', 'medium', 'media', 'all', 16),

-- Commercial Arguments/Selling Points
('selling_point', 'Plateforme Tout-en-Un', 'Une seule plateforme pour gérer tous vos besoins artistiques: événements, représentation, communication', 'done', 'high', 'platform', 'all', 17),
('selling_point', 'Mise en Relation Facilitée', 'Connectez facilement artistes, agents, managers et lieux grâce à notre système de messagerie intégré', 'done', 'high', 'networking', 'all', 18),
('selling_point', 'Gestion Événementielle Complète', 'Créez, gérez et promouvez vos événements avec notre système complet de gestion', 'done', 'high', 'events', 'venues', 19),
('selling_point', 'Système de Réputation', 'Avis et évaluations pour garantir la qualité des collaborations', 'done', 'medium', 'trust', 'all', 20),
('selling_point', 'Tableau de Bord Personnalisé', 'Suivez vos performances et analytics avec des tableaux de bord adaptés à votre profil', 'done', 'medium', 'analytics', 'all', 21),
('selling_point', 'Notifications Temps Réel', 'Ne ratez jamais une opportunité grâce aux notifications instantanées', 'done', 'medium', 'notifications', 'all', 22),
('selling_point', 'Profils Professionnels', 'Showcases complets avec galeries média, bio, et informations de contact', 'done', 'high', 'profiles', 'all', 23),
('selling_point', 'Respect de la Vie Privée', 'Contrôlez qui peut vous contacter et comment avec nos paramètres de confidentialité', 'done', 'medium', 'privacy', 'all', 24);