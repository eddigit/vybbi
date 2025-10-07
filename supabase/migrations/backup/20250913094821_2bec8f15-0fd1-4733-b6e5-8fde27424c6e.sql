-- Insert new roadmap items for enhanced Vybbi platform features
INSERT INTO roadmap_items (type, title, description, status, priority, area, audience, sort_order) VALUES
-- Multimedia Features
('feature', 'Radio Vybbi Intégrée', 'Système de diffusion audio en continu avec gestion des playlists, soumission de morceaux d''artistes et abonnements premium pour promotion automatique', 'in_progress', 'high', 'Multimédia', 'Artistes', 10),
('feature', 'Web TV Vybbi', 'Plateforme de streaming vidéo pour interviews d''artistes, reportages événementiels, concerts live et contenus exclusifs', 'planned', 'high', 'Multimédia', 'Tous', 11),
('feature', 'Studio de Production Live', 'Outil intégré pour streaming en direct, enregistrement et diffusion d''événements en temps réel sur la Web TV', 'planned', 'medium', 'Multimédia', 'Venues', 12),

-- Marketing & Prospection
('feature', 'Système de Prospection IA', 'Outil automatisé d''identification et de contact de nouveaux talents basé sur l''IA et l''analyse des réseaux sociaux', 'done', 'critical', 'Marketing', 'Agents/Managers', 13),
('feature', 'Gestion des Emailings', 'Système complet de création, personnalisation et envoi de campagnes emails avec templates et automation avancée', 'done', 'critical', 'Marketing', 'Tous', 14),
('feature', 'Templates d''Emails Dynamiques', 'Bibliothèque de templates professionnels personnalisables avec variables automatiques et prévisualisation', 'done', 'high', 'Marketing', 'Tous', 15),

-- Analytics & Reporting  
('feature', 'Dashboard Analytics Avancé', 'Métriques détaillées de performance, engagement utilisateurs, conversions et ROI pour tous les profils', 'in_progress', 'high', 'Analytics', 'Tous', 16),
('feature', 'Système de Métriques Temps Réel', 'Tracking en live des interactions, écoutes radio, vues vidéo et engagement sur la plateforme', 'planned', 'medium', 'Analytics', 'Tous', 17),

-- Monétisation
('feature', 'Système d''Abonnements Premium', 'Gestion des souscriptions artistes pour boost de visibilité, radio et fonctionnalités exclusives', 'in_progress', 'critical', 'Monétisation', 'Artistes', 18),
('feature', 'Marketplace de Services', 'Place de marché pour services additionnels : mixing, mastering, photos, vidéos, coaching', 'planned', 'medium', 'Monétisation', 'Artistes', 19),
('feature', 'Système de Commissions Automatisé', 'Calcul et distribution automatique des commissions pour agents et partenaires affiliés', 'done', 'high', 'Monétisation', 'Agents/Influenceurs', 20),

-- Infrastructure Technique
('feature', 'API Publique Vybbi', 'Endpoints REST et GraphQL pour intégrations tierces, partenariats et développements externes', 'planned', 'medium', 'Technique', 'Développeurs', 21),
('feature', 'Application Mobile Native', 'App iOS et Android complète avec notifications push et fonctionnalités offline', 'planned', 'high', 'Technique', 'Tous', 22),
('feature', 'Système de Notifications Avancé', 'Notifications intelligentes multi-canaux (email, SMS, push, in-app) avec personnalisation', 'in_progress', 'medium', 'Technique', 'Tous', 23),

-- Arguments Commerciaux Clés
('selling_point', 'Plateforme Tout-en-Un', 'Solution complète intégrant découverte de talents, booking, promotion, diffusion et monétisation', 'done', 'critical', 'Commercial', 'Prospects', 30),
('selling_point', 'IA de Prospection Unique', 'Technologie exclusive d''identification automatique de talents émergents via l''analyse prédictive', 'done', 'critical', 'Commercial', 'Prospects', 31),
('selling_point', 'Écosystème Média Intégré', 'Radio + Web TV + Streaming = Visibilité maximale pour les artistes sur tous les canaux', 'done', 'high', 'Commercial', 'Prospects', 32),
('selling_point', 'ROI Mesurable et Transparent', 'Analytics détaillés et tracking de performance pour justifier chaque investissement', 'done', 'high', 'Commercial', 'Prospects', 33),
('selling_point', 'Monétisation Multi-Sources', 'Revenus diversifiés : commissions, abonnements, publicité, services premium', 'done', 'high', 'Commercial', 'Prospects', 34);