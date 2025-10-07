-- Marquer comme DONE les fonctionnalités récemment implémentées
UPDATE roadmap_items 
SET status = 'done', updated_at = NOW()
WHERE title IN (
  'Widget Statistiques Artiste',
  'Contrôle Visibilité Profils',
  'Optimisation Mobile-First',
  'Génération Press Kit PDF'
);

-- Phase 1: Consolidation - Fonctionnalités en cours à finaliser
INSERT INTO roadmap_items (type, title, description, status, priority, area, audience, due_date, sort_order) VALUES
('feature', 'Radio Vybbi Premium', 'Finaliser le système d''abonnements premium pour la radio avec playlists exclusives', 'in_progress', 'high', 'Multimédia', 'Artistes', '2025-03-31', 100),
('feature', 'Web TV Vybbi', 'Lancer la plateforme de streaming vidéo avec studio live intégré', 'in_progress', 'high', 'Multimédia', 'Tous', '2025-03-31', 110),
('feature', 'Système Prospection IA', 'Optimiser les algorithmes de détection de prospects et de talents', 'in_progress', 'critical', 'Analytics', 'Professionnels', '2025-03-15', 120);

-- Phase 2: Nouvelles fonctionnalités prioritaires (Avril-Juin 2025)
-- Monétisation Avancée
INSERT INTO roadmap_items (type, title, description, status, priority, area, audience, due_date, sort_order) VALUES
('feature', 'Abonnements Multi-Niveaux', 'Système Freemium/Pro/Premium pour chaque type d''utilisateur avec fonctionnalités exclusives', 'planned', 'critical', 'Monétisation', 'Tous', '2025-04-30', 200),
('feature', 'Marketplace Services Étendu', 'Mixing, mastering, coaching, session musiciens avec commission automatisée', 'planned', 'high', 'Commercial', 'Artistes', '2025-05-31', 210),
('feature', 'Programme Affiliation V2', 'QR codes avancés avec analytics et commissions récurrentes automatisées', 'planned', 'high', 'Marketing', 'Tous', '2025-05-15', 220);

-- Intelligence Artificielle
INSERT INTO roadmap_items (type, title, description, status, priority, area, audience, due_date, sort_order) VALUES
('feature', 'IA Prospection Prédictive', 'Scoring automatique du potentiel artistique et identification talents émergents', 'planned', 'critical', 'Analytics', 'Professionnels', '2025-04-15', 230),
('feature', 'Recommendations Intelligentes', 'Matching artistes-professionnels optimisé avec suggestions collaborations IA', 'planned', 'high', 'Analytics', 'Tous', '2025-06-30', 240);

-- Expérience Mobile Native
INSERT INTO roadmap_items (type, title, description, status, priority, area, audience, due_date, sort_order) VALUES
('feature', 'Applications iOS/Android', 'Push notifications natives, fonctionnalités offline, intégration caméra/micro', 'planned', 'high', 'Technique', 'Tous', '2025-06-30', 250);

-- Phase 3: Écosystème Média Complet (Juillet-Septembre 2025)
-- Web TV & Studio Live
INSERT INTO roadmap_items (type, title, description, status, priority, area, audience, due_date, sort_order) VALUES
('feature', 'Production Live Intégrée', 'Multi-caméras, régie virtuelle, streaming simultané multi-plateformes', 'planned', 'high', 'Multimédia', 'Créateurs', '2025-07-31', 300),
('feature', 'Contenus Premium TV', 'Interviews exclusives, documentaires, concerts live payants', 'planned', 'medium', 'Multimédia', 'Spectateurs', '2025-08-31', 310);

-- Radio Avancée
INSERT INTO roadmap_items (type, title, description, status, priority, area, audience, due_date, sort_order) VALUES
('feature', 'Playlists Intelligentes IA', 'Adaptation temps réel goûts auditeurs, promotion automatique artistes premium', 'planned', 'medium', 'Analytics', 'Auditeurs', '2025-08-15', 320),
('feature', 'Podcasts Intégrés', 'Studio enregistrement virtuel, distribution automatique multi-plateformes', 'planned', 'medium', 'Multimédia', 'Créateurs', '2025-09-30', 330);

-- Phase 4: Innovation & Internationale (Octobre-Décembre 2025)
-- Expansion Géographique
INSERT INTO roadmap_items (type, title, description, status, priority, area, audience, due_date, sort_order) VALUES
('feature', 'Internationalisation', 'Expansion UK, US, Canada, Allemagne avec localisation complète', 'planned', 'critical', 'Commercial', 'International', '2025-10-31', 400),
('feature', 'Partenariats Stratégiques', 'Intégration labels majeurs, distributeurs, API Spotify/Apple Music/Deezer', 'planned', 'high', 'Commercial', 'Professionnels', '2025-11-30', 410);

-- Technologies Émergentes
INSERT INTO roadmap_items (type, title, description, status, priority, area, audience, due_date, sort_order) VALUES
('feature', 'Expériences AR/VR', 'Concerts virtuels immersifs, studios d''enregistrement virtuels', 'planned', 'medium', 'Technique', 'Innovateurs', '2025-12-31', 420),
('feature', 'Blockchain & NFTs', 'Certification droits d''auteur, marketplace NFT exclusifs artistes', 'planned', 'low', 'Technique', 'Artistes', '2025-12-31', 430);

-- Nouvelles fonctionnalités prioritaires
-- Priorité Critique
INSERT INTO roadmap_items (type, task, description, status, priority, area, audience, due_date, sort_order) VALUES
('task', 'Notifications Push Avancées', 'Système notifications push temps réel avec personnalisation avancée', 'planned', 'critical', 'Technique', 'Tous', '2025-04-15', 500),
('task', 'API Publique V1.0', 'API RESTful complète pour partenariats externes et intégrations', 'planned', 'critical', 'Technique', 'Développeurs', '2025-05-31', 510),
('task', 'Backup/Export Données RGPD', 'Système complet backup et export données utilisateur conforme RGPD', 'planned', 'critical', 'Technique', 'Tous', '2025-04-30', 520),
('task', 'Chat Support Client IA', 'Support client intégré avec IA première ligne et escalade humaine', 'planned', 'critical', 'Commercial', 'Tous', '2025-05-15', 530);

-- Priorité Haute
INSERT INTO roadmap_items (type, title, description, status, priority, area, audience, due_date, sort_order) VALUES
('task', 'Calendrier Disponibilité Avancé', 'Synchronisation Google/Outlook, gestion créneaux automatisée', 'planned', 'high', 'Commercial', 'Professionnels', '2025-06-15', 600),
('task', 'Booking Automatisé', 'Système réservation/booking automatisé avec paiements intégrés', 'planned', 'high', 'Commercial', 'Tous', '2025-06-30', 610),
('task', 'Gestion Multi-Comptes', 'Interface managers/agents pour gestion multiple artistes', 'planned', 'high', 'Commercial', 'Managers', '2025-07-15', 620),
('task', 'Analytics Prédictifs', 'Analyses prédictives tendances marché avec IA avancée', 'planned', 'high', 'Analytics', 'Professionnels', '2025-07-31', 630);

-- Priorité Moyenne
INSERT INTO roadmap_items (type, title, description, status, priority, area, audience, due_date, sort_order) VALUES
('task', 'Académie Vybbi', 'Programme de formation intégré pour professionnels musique', 'planned', 'medium', 'Commercial', 'Tous', '2025-08-31', 700),
('task', 'Système Badges/Certifications', 'Badges de compétences et certifications professionnelles', 'planned', 'medium', 'Commercial', 'Tous', '2025-09-15', 710),
('task', 'Intégration CRM Externe', 'Connexions HubSpot, Salesforce pour professionnels', 'planned', 'medium', 'Technique', 'Professionnels', '2025-09-30', 720),
('task', 'Social Media Management', 'Outils gestion réseaux sociaux intégrés à la plateforme', 'planned', 'medium', 'Marketing', 'Créateurs', '2025-10-15', 730);

-- Arguments commerciaux (Selling Points)
INSERT INTO roadmap_items (type, title, description, status, priority, area, audience, sort_order) VALUES
('selling_point', 'Écosystème Complet 360°', 'Seule plateforme offrant radio, TV, booking, networking, formation en un lieu', 'done', 'critical', 'Commercial', 'Tous', 800),
('selling_point', 'IA Révolutionnaire', 'Algorithmes IA propriétaires pour matching parfait et détection talents', 'in_progress', 'critical', 'Technique', 'Tous', 810),
('selling_point', 'Monétisation Immédiate', 'Revenus dès J1 via abonnements, commissions, services premium', 'planned', 'critical', 'Monétisation', 'Professionnels', 820),
('selling_point', 'Communauté Active 100K+', 'Plus grande communauté musicale francophone avec engagement quotidien', 'planned', 'high', 'Marketing', 'Tous', 830),
('selling_point', 'Partenariats Majeurs', 'Accords exclusifs labels, distributeurs, venues pour opportunités uniques', 'planned', 'high', 'Commercial', 'Artistes', 840);