-- Add new roadmap items for affiliate system
INSERT INTO roadmap_items (type, title, description, status, priority, area, audience, sort_order) VALUES
('feature', 'Système d''Affiliation Complet', 'Système d''affiliation avec commissions one-shot (2€) et récurrentes (0,50€/mois) pour influenceurs avec suivi SIRET', 'done', 'high', 'Monétisation', 'Influenceurs', 100),
('feature', 'Calcul Automatique Commissions', 'Edge function pour calculer automatiquement les commissions mensuelles récurrentes des affiliés', 'done', 'high', 'Technique', 'Système', 101),
('feature', 'Dashboard Influenceur', 'Interface dédiée aux influenceurs pour suivre leurs liens, clics, conversions et revenus en temps réel', 'done', 'medium', 'Analytics', 'Influenceurs', 102),
('feature', 'Landing Page Influenceurs', 'Page dédiée au programme d''affiliation avec calculateur de revenus et arguments marketing', 'done', 'medium', 'Marketing', 'Influenceurs', 103),
('task', 'Champ SIRET Obligatoire', 'Ajout du champ SIRET obligatoire pour les influenceurs (conformité légale française)', 'done', 'critical', 'Technique', 'Influenceurs', 104),
('task', 'Edge Function Commissions Mensuelles', 'Développement de la fonction de calcul mensuel automatique des commissions récurrentes', 'done', 'high', 'Technique', 'Système', 105),
('selling_point', 'Programme Exclusif Jusqu''au 31/01/2026', 'Exclusivité temporelle du programme d''affiliation avec commissions récurrentes', 'done', 'high', 'Commercial', 'Influenceurs', 106),
('selling_point', 'Revenus Récurrents 0,50€/mois', 'Modèle de commission récurrente unique sur le marché pour fidéliser les influenceurs', 'done', 'high', 'Commercial', 'Influenceurs', 107),
('selling_point', 'Potentiel 7000€/an', 'Potentiel de revenus élevé pour les top performers du programme d''affiliation', 'done', 'medium', 'Commercial', 'Influenceurs', 108);