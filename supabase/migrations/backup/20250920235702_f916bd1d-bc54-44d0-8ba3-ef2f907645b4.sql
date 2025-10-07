-- Mise à jour complète de la roadmap avec l'état actuel du projet

-- Nettoyer les anciens éléments
DELETE FROM roadmap_items;

-- FONCTIONNALITÉS TERMINÉES (DONE)
INSERT INTO roadmap_items (type, title, description, status, priority, area, audience, sort_order) VALUES
-- Système de profils et authentification
('feature', 'Système de profils multi-types', 'Profils artistes, agents, managers, lieux avec authentification complète', 'done', 'critical', 'Technique', 'Tous', 1),
('feature', 'Système d''onboarding', 'Guide d''inscription progressif avec validation des données', 'done', 'high', 'UX', 'Nouveaux utilisateurs', 2),
('feature', 'Gestion des avatars et médias', 'Upload et gestion d''images de profil et bannières', 'done', 'medium', 'Multimédia', 'Tous', 3),

-- Communication et messages
('feature', 'Système de messagerie directe', 'Conversations privées entre utilisateurs avec RLS sécurisé', 'done', 'critical', 'Communication', 'Tous', 4),
('feature', 'Communautés intégrées', 'Création et gestion de communautés avec channels et modération', 'done', 'high', 'Social', 'Artistes et Managers', 5),
('feature', 'Chat support intégré', 'Widget HubSpot pour support client', 'done', 'medium', 'Support', 'Tous', 6),
('feature', 'Système de notifications', 'Notifications en temps réel avec préférences utilisateur', 'done', 'high', 'Communication', 'Tous', 7),

-- Radio et musique
('feature', 'Radio Vybbi complète', 'Système de radio avec playlists, soumissions et diffusion', 'done', 'critical', 'Multimédia', 'Artistes', 8),
('feature', 'Gestion discographie', 'Upload et gestion des releases musicales avec collaborations', 'done', 'critical', 'Multimédia', 'Artistes', 9),
('feature', 'Player audio intégré', 'Lecteur de musique avec contrôles avancés', 'done', 'high', 'Multimédia', 'Tous', 10),
('feature', 'Soumissions radio', 'Système de soumission de tracks pour diffusion radio', 'done', 'high', 'Multimédia', 'Artistes', 11),
('feature', 'Playlists admin radio', 'Interface admin pour gérer les playlists de diffusion', 'done', 'high', 'Administration', 'Admins', 12),

-- Événements et bookings
('feature', 'Gestion d''événements', 'Création, modification et publication d''événements', 'done', 'critical', 'Événementiel', 'Lieux', 13),
('feature', 'Système de bookings', 'Demandes et gestion des réservations artistes', 'done', 'critical', 'Commercial', 'Artistes et Lieux', 14),
('feature', 'Calendrier de disponibilités', 'Gestion des créneaux disponibles pour les artistes', 'done', 'high', 'Planning', 'Artistes', 15),
('feature', 'Wall d''annonces', 'Publication et recherche d''annonces de booking', 'done', 'high', 'Marketing', 'Tous', 16),

-- Affiliation et monétisation
('feature', 'Système d''affiliation complet', 'Links, QR codes, tracking et commissions', 'done', 'critical', 'Monétisation', 'Influenceurs', 17),
('feature', 'Tracking des conversions', 'Suivi précis des conversions et calcul automatique des commissions', 'done', 'high', 'Analytics', 'Admins', 18),
('feature', 'Commissions récurrentes', 'Système de commissions mensuelles pour abonnements', 'done', 'high', 'Monétisation', 'Influenceurs', 19),

-- IA et prospection
('feature', 'IA de prospection Vybbi', 'Intelligence artificielle pour le matching et la prospection', 'done', 'critical', 'IA', 'Agents', 20),
('feature', 'Chat IA intégré', 'Assistant IA contextuel pour tous les utilisateurs', 'done', 'high', 'IA', 'Tous', 21),
('feature', 'Workflow automation', 'Automatisation des tâches de prospection avec IA', 'done', 'high', 'IA', 'Agents', 22),

-- Administration
('feature', 'Dashboard admin complet', 'Interface d''administration avec toutes les métriques', 'done', 'critical', 'Administration', 'Admins', 23),
('feature', 'Gestion des utilisateurs', 'CRUD complet utilisateurs avec rôles et permissions', 'done', 'critical', 'Administration', 'Admins', 24),
('feature', 'Système d''emails', 'Templates d''emails et envoi automatique', 'done', 'high', 'Communication', 'Admins', 25),
('feature', 'Analytics avancées', 'Métriques détaillées et tableaux de bord', 'done', 'high', 'Analytics', 'Admins', 26),
('feature', 'Système publicitaire', 'Gestion des campagnes publicitaires et créatives', 'done', 'medium', 'Marketing', 'Admins', 27),

-- Sécurité et technique
('feature', 'Sécurité RLS complète', 'Row Level Security sur toutes les tables sensibles', 'done', 'critical', 'Technique', 'Système', 28),
('feature', 'Audit de sécurité', 'Logs d''audit et monitoring des accès', 'done', 'high', 'Technique', 'Système', 29),
('feature', 'PWA et optimisations', 'Application Progressive Web App avec service worker', 'done', 'medium', 'Technique', 'Tous', 30),

-- FONCTIONNALITÉS EN COURS (IN_PROGRESS)
('feature', 'Web TV streaming', 'Plateforme de streaming live avec chat intégré', 'in_progress', 'high', 'Multimédia', 'Artistes', 31),
('feature', 'Optimisation prospection', 'Amélioration des algorithmes de matching IA', 'in_progress', 'high', 'IA', 'Agents', 32),
('feature', 'Mobile responsiveness', 'Optimisation complète pour appareils mobiles', 'in_progress', 'high', 'UX', 'Tous', 33),

-- FONCTIONNALITÉS PLANIFIÉES (PLANNED)
('feature', 'API publique v1.0', 'API REST pour intégrations partenaires', 'planned', 'high', 'Technique', 'Développeurs', 34),
('feature', 'Applications mobiles', 'Apps natives iOS et Android', 'planned', 'critical', 'Mobile', 'Tous', 35),
('feature', 'Internationalisation', 'Support multi-langues (EN, ES, DE)', 'planned', 'high', 'International', 'Tous', 36),
('feature', 'Marketplace services', 'Place de marché pour services musicaux', 'planned', 'high', 'Commercial', 'Tous', 37),
('feature', 'Abonnements premium', 'Système d''abonnements multi-niveaux', 'planned', 'critical', 'Monétisation', 'Tous', 38),
('feature', 'Analytics prédictifs', 'IA prédictive pour les tendances musicales', 'planned', 'medium', 'IA', 'Artistes', 39),
('feature', 'Blockchain/NFTs', 'Intégration blockchain pour authentification œuvres', 'planned', 'low', 'Innovation', 'Artistes', 40),
('feature', 'AR/VR concerts', 'Expériences immersives pour concerts virtuels', 'planned', 'low', 'Innovation', 'Artistes', 41),

-- TÂCHES TECHNIQUES (TASKS)
('task', 'Finaliser calcul modération', 'Implémenter le calcul des éléments en attente de modération', 'planned', 'medium', 'Technique', 'Développeurs', 42),
('task', 'Logique statut booked', 'Ajouter la logique pour le statut "booked" dans les événements', 'planned', 'medium', 'Technique', 'Développeurs', 43),
('task', 'Optimisation base de données', 'Index et requêtes optimisées pour les performances', 'planned', 'high', 'Technique', 'Système', 44),
('task', 'Tests automatisés', 'Suite de tests complète pour toutes les fonctionnalités', 'planned', 'high', 'Technique', 'Développeurs', 45),
('task', 'Documentation API', 'Documentation complète pour API publique', 'planned', 'medium', 'Technique', 'Développeurs', 46),
('task', 'Monitoring avancé', 'Alertes et monitoring proactif des performances', 'planned', 'medium', 'Technique', 'Système', 47),

-- ARGUMENTS COMMERCIAUX (SELLING_POINTS)
('selling_point', 'Plateforme tout-en-un', 'Unique écosystème unifié pour l''industrie musicale', 'done', 'critical', 'Commercial', 'Prospects', 48),
('selling_point', 'IA de prospection unique', 'Seule plateforme avec IA spécialisée pour le matching musical', 'done', 'critical', 'Commercial', 'Agents', 49),
('selling_point', 'Radio interactive', 'Première radio communautaire avec soumissions d''artistes', 'done', 'high', 'Commercial', 'Artistes', 50),
('selling_point', 'Monétisation transparente', 'Commissions claires et tracking précis pour tous', 'done', 'high', 'Commercial', 'Influenceurs', 51),
('selling_point', 'Communauté active', 'Réseau social spécialisé musique avec 5 communautés principales', 'done', 'high', 'Commercial', 'Artistes', 52),
('selling_point', 'Écosystème complet 2026', 'Radio + TV + Streaming + Live + IA dans une seule plateforme', 'planned', 'critical', 'Commercial', 'Investisseurs', 53),
('selling_point', 'ROI mesurable', 'Métriques précises et transparentes pour tous les partenaires', 'done', 'high', 'Commercial', 'Partenaires', 54);