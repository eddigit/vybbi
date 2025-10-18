# Fonctionnalités de l'Application Vybbi

## Vue d'Ensemble

Vybbi est une plateforme complète de networking pour l'industrie musicale connectant artistes, lieux, agents, managers et influenceurs. Cette documentation liste toutes les fonctionnalités implémentées dans l'application.

---

## 1. Authentification & Gestion des Profils

### Authentification
- ✅ Inscription avec email/mot de passe
- ✅ Connexion sécurisée
- ✅ Réinitialisation de mot de passe
- ✅ Confirmation d'email
- ✅ Callback OAuth
- ✅ Validation de force du mot de passe
- ✅ Protection anti-bruteforce (login attempts tracking)
- ✅ Sécurité renforcée avec 2FA (EnhancedAuthSecurity)

### Types de Profils
- ✅ **Artistes** (artist) - DJs, musiciens, producteurs
- ✅ **Lieux & Événements** (lieu) - Clubs, salles, festivals
- ✅ **Agents** (agent) - Représentants d'artistes
- ✅ **Managers** (manager) - Managers d'artistes
- ✅ **Influenceurs** (influencer) - Ambassadeurs de la plateforme
- ✅ **Partenaires** (partner) - Partenaires commerciaux
- ✅ **Administrateurs** (admin) - Gestion de la plateforme

### Gestion de Profils
- ✅ Profils publics/privés
- ✅ URLs personnalisées avec slugs (format court, ex: `/artistes/dj-smith`)
- ✅ Upload d'avatar
- ✅ Image de header avec positionnement Y personnalisé
- ✅ Biographie
- ✅ Genres musicaux (multi-sélection)
- ✅ Talents/compétences
- ✅ Localisation et ville
- ✅ Langues parlées
- ✅ Liens réseaux sociaux (Instagram, Spotify, SoundCloud, YouTube, TikTok)
- ✅ Site web
- ✅ Contact direct ou via profil préféré
- ✅ Pourcentage de complétion du profil
- ✅ Onboarding guidé
- ✅ Profils secondaires (multi-profils)
- ✅ Galerie d'images
- ✅ Édition de profil par les admins (admin_profile_edits)
- ✅ Mock profiles pour tests et démonstrations

### Système de Rôles & Permissions
- ✅ Table dédiée `user_roles` avec enum `app_role`
- ✅ Fonction `has_role()` sécurisée (SECURITY DEFINER)
- ✅ Vérification côté serveur uniquement
- ✅ Protection contre l'escalade de privilèges
- ✅ RLS policies basées sur les rôles

---

## 2. Fonctionnalités Sociales

### Fil d'Actualité (Social Wall)
- ✅ Posts texte, image, vidéo
- ✅ Types de posts : text, event, service_request, annonce
- ✅ Visibilité configurable (public, followers, private)
- ✅ Likes et commentaires
- ✅ Partage de posts
- ✅ Médias attachés multiples (post_media)
- ✅ Filtres de contenu : all, prestations, events, messages, annonces
- ✅ Filtres de feed : all, following, discover
- ✅ Pagination

### Interactions Sociales
- ✅ Système de follow/unfollow
- ✅ Liste des followers/following
- ✅ Statistiques de suivi (get_user_follow_stats)
- ✅ Posts des utilisateurs suivis priorisés
- ✅ Découverte de nouveaux profils
- ✅ Profils publics visibles par tous

### Communautés
- ✅ Création de communautés (publiques/privées)
- ✅ Gestion de membres avec rôles (owner, admin, moderator, member)
- ✅ Channels (texte/vocal) dans les communautés
- ✅ Messages de communauté (community_messages)
- ✅ Système de modération (mute, ban)
- ✅ Avatar et bannière de communauté

### Présence en Ligne
- ✅ Indicateur "en ligne" en temps réel
- ✅ Dernière connexion (user_presence)
- ✅ Status message personnalisé
- ✅ Fonction `get_online_users()` pour afficher qui est connecté

---

## 3. Système de Messagerie

### Messages Directs
- ✅ Conversations 1-to-1 (direct)
- ✅ Conversations de groupe
- ✅ Messages en temps réel (Supabase Realtime)
- ✅ Historique complet des messages
- ✅ Fonction `start_direct_conversation()` sécurisée
- ✅ Politique anti-spam : limite d'un message avant réponse (agents/managers → artistes)
- ✅ Flag `reply_received` pour débloquer conversations
- ✅ Diagnostic de messagerie (`diagnose_user_messaging`)

### Fonctionnalités Avancées
- ✅ Indicateur de frappe (typing presence)
- ✅ Participants multiples visibles
- ✅ Archivage de conversations (conversation_archives)
- ✅ Épinglage de conversations (conversation_pins)
- ✅ Blocage d'utilisateurs (blocked_users)
- ✅ Envoi de messages admin (`send_admin_message`)
- ✅ Header avec infos de conversation
- ✅ Panel d'info droite
- ✅ Composer avec prévisualisation

---

## 4. Événements & Annonces

### Événements
- ✅ Création d'événements par les lieux
- ✅ Informations complètes : titre, date, heure, description
- ✅ Upload de flyer d'événement (EventFlyerUpload)
- ✅ Positionnement Y de l'image
- ✅ Localisation et lieu
- ✅ Genres associés
- ✅ Budget et tarifs
- ✅ Statuts : draft, published, cancelled, completed
- ✅ Participants (event_attendees) avec types : attending, interested, invited
- ✅ RSVP system (useEventRSVP)
- ✅ Calendrier des événements (VenueCalendar)
- ✅ Agenda (VenueAgenda)

### Annonces (Offres/Demandes)
- ✅ Création d'annonces par tous types de profils
- ✅ Types : offre de booking, recherche d'artiste, etc.
- ✅ Description détaillée
- ✅ Budget (min/max)
- ✅ Deadline de candidature
- ✅ Date d'événement souhaitée
- ✅ Genres recherchés
- ✅ Types de profils ciblés
- ✅ Localisation
- ✅ Image d'annonce avec positionnement
- ✅ Statuts : draft, published, closed, cancelled
- ✅ Gestion des annonces (AnnonceManager)
- ✅ Mur d'annonces (AnnoncesWall)
- ✅ Publication d'offre (PublierOffre)

### Candidatures
- ✅ Système de candidature aux annonces (applications)
- ✅ Message de motivation
- ✅ Statuts : pending, accepted, rejected
- ✅ Gestion des candidatures pour les créateurs d'annonces
- ✅ Notifications de nouvelles candidatures

### Bookings
- ✅ Demandes de booking artiste → lieu
- ✅ Cachet proposé (proposed_fee)
- ✅ Message de présentation
- ✅ Statuts : pending, confirmed, cancelled, completed
- ✅ Historique des bookings
- ✅ Dashboard de monitoring (BookingMonitoringDashboard)
- ✅ Notifications de booking

### Disponibilités
- ✅ Gestion de disponibilités artistes (availability_slots)
- ✅ Période start_date → end_date
- ✅ Statuts : available, booked, unavailable
- ✅ Calendrier de disponibilités (ArtistAvailabilityCalendar)

---

## 5. Reviews & Évaluations

### Système d'Évaluation
- ✅ Reviews entre professionnels
- ✅ Note sur 5 étoiles (rating)
- ✅ Commentaire détaillé
- ✅ Recommandation oui/non (would_recommend)
- ✅ Types d'événements évalués
- ✅ Professionalism, performance, communication ratings détaillés
- ✅ Statuts : pending, published, rejected
- ✅ Modération par les admins
- ✅ Formulaire de review enrichi (EnhancedReviewForm)
- ✅ Affichage public des reviews
- ✅ Moyenne des notes par profil

---

## 6. Programme d'Affiliation Influenceurs

### Génération de Liens
- ✅ Codes d'affiliation uniques (influencer_links)
- ✅ QR codes générés automatiquement (AffiliateQRGenerator)
- ✅ URLs courtes et mémorisables
- ✅ Dialog de gestion de liens (AffiliateLinkDialog)
- ✅ Création de liens multiples
- ✅ Activation/désactivation de liens

### Tracking & Analytics
- ✅ Tracking des visites (affiliate_visits)
  - Session ID
  - IP visiteur (masquée)
  - User agent
  - Referrer
  - Page d'arrivée
  - Géolocalisation (pays, ville)
- ✅ Tracking des conversions (affiliate_conversions)
  - Types : registration, subscription, booking
  - Valeur de conversion
  - Statuts : pending, confirmed, paid
  - Date de confirmation et paiement
- ✅ Fonction `track_affiliate_visit()` sécurisée
- ✅ Fonction `track_affiliate_conversion_with_tokens()` avec récompense

### Commissions
- ✅ **Commission one-shot** : 2€ par inscription via lien
- ✅ **Commission récurrente** : 0,50€/mois tant que l'utilisateur reste actif
- ✅ Table `recurring_commissions` pour suivi mensuel
- ✅ Calcul automatique des commissions (calculate-monthly-commissions Edge Function)
- ✅ Historique des paiements
- ✅ Statuts : pending, approved, paid
- ✅ Référence de paiement
- ✅ Dashboard de commissions détaillé

### Dashboard Influenceur
- ✅ Vue d'ensemble des performances
- ✅ Métriques en temps réel :
  - Clics totaux
  - Conversions
  - Taux de conversion
  - Revenus générés
  - Commissions en attente
  - Commissions payées
- ✅ Graphiques d'évolution
- ✅ Top performing links
- ✅ Calculateur de revenus potentiels
- ✅ Historique des paiements

### Conformité Légale
- ✅ SIRET obligatoire pour les influenceurs français
- ✅ Validation du SIRET (SiretField component)
- ✅ Champs siret_number, siret_verified, siret_verified_at
- ✅ Vérification manuelle par admin
- ✅ Contrat d'influenceur (conditions acceptées)
- ✅ Programme exclusif en phase de lancement

### Inscription Influenceur
- ✅ Page dédiée `/inscription-influenceur`
- ✅ Formulaire de candidature
- ✅ Validation des critères
- ✅ Email de bienvenue automatique (send-influencer-welcome-email)
- ✅ Onboarding spécifique
- ✅ Modal de bienvenue (InfluencerWelcomeModal)

---

## 7. Vybbi Radio

### Player Radio
- ✅ Lecteur audio intégré (RadioPlayer)
- ✅ Contrôles de lecture : play, pause, volume, mute
- ✅ Affichage du titre en cours
- ✅ Affichage de l'artiste avec avatar
- ✅ Miniaturisation/expansion du player
- ✅ Player visible sur toutes les pages (useRadioPlayerVisibility)
- ✅ YouTube Radio Player pour streams YouTube
- ✅ Contrôles avancés (RadioControls)

### Playlists Radio
- ✅ Playlists dynamiques (radio_playlists)
- ✅ Programmation horaire (schedule_start, schedule_end)
- ✅ Pistes de playlist (radio_playlist_tracks)
- ✅ Système de poids pour rotation (weight)
- ✅ Fonction `get_radio_playlist()` pour sélection intelligente
- ✅ Gestion admin des playlists (RadioPlaylistManager)
- ✅ Édition de playlists (EditPlaylistDialog)
- ✅ Suppression de playlists (DeletePlaylistDialog)
- ✅ Gestion des pistes (PlaylistTracksDialog)

### File d'Attente
- ✅ Queue de lecture (radio_queue)
- ✅ Ordre de lecture (play_order)
- ✅ Statuts : pending, playing, played, skipped
- ✅ Affichage de la queue (RadioQueue)
- ✅ Contrôle de la playlist (RadioPlaylistController)

### Soumissions Artistes
- ✅ Soumission de titres par les artistes (radio_submissions)
- ✅ Dialog de soumission (RadioSubmissionDialog)
- ✅ Upload de fichier audio ou lien streaming
- ✅ Informations du titre : titre, artiste, album, genre
- ✅ Statuts : pending, approved, rejected, on_air
- ✅ Modération par les admins
- ✅ Hook `useRadioSubmissions` pour gestion

### Requêtes de Titres
- ✅ Système de requêtes d'auditeurs (radio_requests)
- ✅ Dialog de requête (RadioRequestDialog)
- ✅ Message de requête
- ✅ Statuts : pending, approved, rejected, played
- ✅ Hook `useRadioRequests` pour gestion
- ✅ Affichage des requêtes pour les admins

### Abonnements Premium Radio
- ✅ Souscriptions artistes (artist_radio_subscriptions)
- ✅ Types : free, standard, premium, exclusive
- ✅ Boost de priorité (priority_boost) pour rotation
- ✅ Auto-approbation des pistes (auto_approve_tracks)
- ✅ Crédits de soumission (credits_remaining)
- ✅ Dates de validité (starts_at, expires_at)
- ✅ Gestion active/inactive

### Statistiques Radio
- ✅ Affichage des stats (RadioStatsDisplay)
- ✅ Nombre d'auditeurs
- ✅ Titres joués
- ✅ Pistes en playlist
- ✅ Soumissions en attente

---

## 8. Système de Tokens VYBBI

### Balance & Transactions
- ✅ Balance de tokens par utilisateur (user_token_balances)
- ✅ Tokens gagnés (total_earned)
- ✅ Tokens dépensés (total_spent)
- ✅ Historique des transactions (token_transactions)
- ✅ Types : earned, spent, purchased, bonus, refund, commission
- ✅ Références (reference_type, reference_id) pour traçabilité
- ✅ Metadata JSON pour détails

### Affichage & UX
- ✅ Widget de balance (VybbiTokenBalance) avec variants
- ✅ Historique paginé (VybbiTokenHistory)
- ✅ Icône de token personnalisée (vybbi-dj-token.png)
- ✅ Animations de mise à jour
- ✅ Hook `useVybbiTokens` pour gestion

### Gains de Tokens
- ✅ Récompenses quotidiennes (VybbiDailyReward)
- ✅ Récompenses d'inscription (conversion tracking)
- ✅ Bonus de parrainage
- ✅ Commissions d'affiliation converties en tokens
- ✅ Récompenses de contenu (posts, reviews)

### Dépenses de Tokens
- ✅ Options de dépense (VybbiSpendingOptions)
- ✅ Boost de visibilité de profil
- ✅ Mise en avant de posts
- ✅ Accès premium radio
- ✅ Fonctionnalités premium diverses
- ✅ Fonction `spend_vybbi_tokens()` sécurisée

### Achat de Tokens
- ✅ Interface d'achat (VybbiTokenPurchase)
- ✅ Packs de tokens avec remises
- ✅ Intégration paiement (prévu avec Stripe)
- ✅ Edge Functions : create-token-payment, verify-token-payment
- ✅ Historique d'achats

---

## 9. Système Publicitaire

### Campagnes Publicitaires
- ✅ Gestion de campagnes (ad_campaigns)
- ✅ Informations : nom, annonceur, description
- ✅ Dates de début/fin
- ✅ Fenêtre horaire quotidienne (daily_window_start/end)
- ✅ Types de placement
- ✅ URL cible
- ✅ Statuts : draft, active, paused, completed
- ✅ Activation/désactivation (is_active)
- ✅ Dialog de création/édition (AdCampaignDialog)

### Assets Publicitaires
- ✅ Gestion des assets (ad_assets)
- ✅ Upload de fichiers (images, vidéos)
- ✅ Métadonnées : file_name, file_size, width, height
- ✅ Texte alternatif (alt_text)
- ✅ Ordre d'affichage (display_order)
- ✅ Association à une campagne
- ✅ Dialog de création/édition (AdCreativeDialog)

### Slots d'Affichage
- ✅ Emplacements publicitaires (ad_slots)
- ✅ Codes uniques (code)
- ✅ Types de page (page_type)
- ✅ Dimensions (width, height)
- ✅ Formats acceptés (allowed_formats)
- ✅ Masquage si vide (hide_if_empty)
- ✅ Association campagnes ↔ slots (ad_campaign_slots)
- ✅ Poids (weight) et priorité
- ✅ Dialog de gestion (AdSlotDialog)
- ✅ Composant d'affichage (AdSlot)

### Métriques & Analytics
- ✅ Tracking des impressions (ad_metrics)
- ✅ Tracking des clics
- ✅ Tracking des conversions
- ✅ Données : user_id, ip_address, user_agent, referrer, page_url
- ✅ Association à campagne et asset
- ✅ Système de test (AdSystemTester)

### Configuration
- ✅ Paramètres globaux (ad_settings)
- ✅ Configuration par clé/valeur JSON
- ✅ Mis à jour par admin uniquement

### Interface Admin
- ✅ Page admin dédiée `/admin/ads`
- ✅ Vue d'ensemble des campagnes
- ✅ Gestion des slots
- ✅ Statistiques en temps réel
- ✅ Bannières de test (AdBanner)

---

## 10. CRM Prospection Vybbi

### Gestion de Prospects
- ✅ Base de données de prospects (prospects)
- ✅ Informations complètes : nom, email, téléphone, entreprise, poste
- ✅ Statuts : new, contacted, qualified, proposal_sent, negotiation, converted, rejected, on_hold
- ✅ Priorité : low, medium, high, urgent
- ✅ Source du prospect
- ✅ Valeur estimée (estimated_value)
- ✅ Score de qualité (quality_score)
- ✅ Date de conversion
- ✅ Notes internes
- ✅ Dialog de création/édition (ProspectDialog)

### Kanban Board
- ✅ Vue Kanban avec drag & drop (ProspectKanbanBoard)
- ✅ Colonnes par statut
- ✅ Déplacement de prospects entre statuts
- ✅ Compteurs par colonne
- ✅ Filtres et recherche
- ✅ Vue mobile optimisée (MobileKanbanView)

### Pipeline & Vues
- ✅ Pipeline de vente (ProspectPipeline)
- ✅ Vue liste (ListView)
- ✅ Cartes de prospects (MobileProspectCard)
- ✅ Actions par glissement (SwipeableProspectCard)
- ✅ Pull to refresh (PullToRefresh)
- ✅ Optimisations tactiles (MobileTouchOptimizer)

### Tâches & Suivi
- ✅ Gestion de tâches (prospect_tasks)
- ✅ Types : call, email, meeting, follow_up, other
- ✅ Échéances (due_date)
- ✅ Priorités
- ✅ Statuts : pending, in_progress, completed, cancelled
- ✅ Notes de tâche
- ✅ Assignation d'agent
- ✅ Manager de tâches (TaskManager)
- ✅ Workflow de tâches (workflow_tasks)
- ✅ Locks pour éviter doublons (locked_at, processing_by)
- ✅ Cleanup automatique des locks expirés

### Automation & Workflows
- ✅ Workflows d'automatisation (automation_workflows)
- ✅ Déclencheurs (trigger_type)
- ✅ Étapes de workflow (automation_steps)
- ✅ Ordre d'exécution (order_number)
- ✅ Délais configurables (delay_hours)
- ✅ Channels : email, whatsapp, task
- ✅ Conditions d'exécution (conditions JSON)
- ✅ Templates de contenu
- ✅ Exécutions trackées (automation_executions)
- ✅ Manager de workflows (WorkflowManager)
- ✅ Edge Function : process-workflow-tasks

### Multi-Channel
- ✅ Envoi d'emails de prospection (ProspectingEmailSender)
- ✅ Envoi WhatsApp (WhatsAppSender)
- ✅ Edge Functions : whatsapp-sender, prospect-webhooks
- ✅ Automation multi-canal (MultiChannelAutomation)
- ✅ Templates par canal

### Filtres & Recherche
- ✅ Filtres avancés (ProspectFilters)
- ✅ Recherche intelligente (IntelligentSearch)
- ✅ Filtrage par statut, priorité, agent, tags
- ✅ Recherche textuelle (nom, email, entreprise)
- ✅ Dates de création/modification

### Tags & Organisation
- ✅ Système de tags (ProspectTagManager)
- ✅ Tags colorés
- ✅ Tags multiples par prospect
- ✅ Filtrage par tags

### Actions en Masse
- ✅ Panel d'actions groupées (BulkActionsPanel)
- ✅ Changement de statut multiple
- ✅ Assignation d'agent multiple
- ✅ Application de tags en masse
- ✅ Suppression en masse

### Notifications
- ✅ Centre de notifications (ProspectNotificationCenter)
- ✅ Badge de notifications (ProspectNotificationBadge)
- ✅ Notifications de nouveaux prospects
- ✅ Notifications de tâches dues
- ✅ Hook `useProspectNotifications`

### Détection & Scoring
- ✅ Détecteur de prospects chauds (HotProspectsDetector)
- ✅ Scoring automatique (quality_score)
- ✅ Indicateurs de qualité
- ✅ Priorisation automatique

### Analytics & Reporting
- ✅ Dashboard analytics (AnalyticsDashboard)
- ✅ Dashboard commercial (CommercialDashboard)
- ✅ Rapports automatiques (AutoReportGenerator)
- ✅ Page admin analytics `/admin/prospecting-analytics`
- ✅ Métriques de conversion
- ✅ Taux de conversion par source
- ✅ Performance par agent

### Gamification
- ✅ Panel de gamification (GamificationPanel)
- ✅ Points par action
- ✅ Classements
- ✅ Badges et achievements

### Intégrations
- ✅ Centre d'intégrations (IntegrationsCenter)
- ✅ Webhooks (prospect-webhooks Edge Function)
- ✅ APIs externes

### Mode Hors Ligne
- ✅ Provider de synchronisation (OfflineSyncProvider)
- ✅ Cache local
- ✅ Sync automatique à la reconnexion

### Assignation d'Agents
- ✅ Agents Vybbi (vybbi_agents)
- ✅ Assignation automatique (assign_prospect_to_agent)
- ✅ Assignation manuelle
- ✅ Load balancing entre agents
- ✅ Historique d'assignation (prospect_assignments)
- ✅ Stats par agent (total_prospects_assigned)

### Venues Prospecting
- ✅ Dialog de prospection de lieux (VenueProspectingDialog)
- ✅ Ciblage spécifique venues

---

## 11. Analytics & Monitoring

### Google Analytics 4
- ✅ Intégration GA4 (ID: G-K1LQ1MVX3R)
- ✅ Tracking automatique des pages (useGAPageTracking)
- ✅ Événements personnalisés
- ✅ Lazy loading du script (LazyLoadAnalytics)
- ✅ Edge Function : ga4-fetch-data
- ✅ Stats cards GA (GAStatsCards)
- ✅ Hook `useGAStats`

### Vues de Profils
- ✅ Tracking des vues (profile_views)
- ✅ Comptage des vues uniques et totales
- ✅ Données visiteur : user_id, session_id, ip_address, user_agent, referrer
- ✅ Géolocalisation (city, country)
- ✅ Affichage des stats (ProfileViewStatsCard)
- ✅ Liste des visiteurs (ProfileVisitors)
- ✅ Hook `useProfileTracking`

### Analytics Profil
- ✅ Widget de stats (ArtistStatsWidget)
- ✅ Analytics enrichis (EnhancedProfileAnalytics)
- ✅ Composant général (ProfileAnalytics)
- ✅ Métriques : vues, likes, followers, bookings
- ✅ Évolution temporelle
- ✅ Graphiques (Recharts)

### Logs d'Audit Sécurité
- ✅ Table security_audit_log
- ✅ Logs d'actions sensibles
- ✅ Fonction `log_security_event()`
- ✅ Fonction `audit_sensitive_profile_access()`
- ✅ Fonction `audit_profile_access()`
- ✅ Fonction `audit_prospect_access()`
- ✅ Metadata JSON pour contexte
- ✅ IP et user agent

### Health Monitoring
- ✅ Dashboard de santé système (SystemHealthCard)
- ✅ Monitoring Vybbi (VybbiMonitoring)
- ✅ Page admin `/admin/analytics-health`
- ✅ Fonction `check_security_integrity()`
- ✅ Alertes système

### Beta Stats
- ✅ Statistiques beta (BetaStats)
- ✅ Page admin `/admin/beta-stats`
- ✅ Métriques d'usage plateforme

---

## 12. Administration

### Dashboard Admin
- ✅ Dashboard principal `/admin`
- ✅ Vue d'ensemble de la plateforme
- ✅ Statistiques clés (useAdminStats)
- ✅ Accès rapide aux sections
- ✅ Layout admin dédié (AdminLayout)

### Gestion des Utilisateurs
- ✅ Confirmation manuelle d'utilisateurs (admin-confirm-user)
- ✅ Mock profiles pour tests (AdminMockProfiles)
- ✅ Génération de profils (MockProfileGenerator)
- ✅ Gestion de profils (MockProfileManager)
- ✅ Édition de profils utilisateurs
- ✅ Logs d'édition admin (admin_profile_edits)
- ✅ Assignation de rôles

### Communication
- ✅ Page communication `/admin/communication`
- ✅ Envoi d'emails système
- ✅ Newsletters
- ✅ Messages admin broadcast

### Email System
- ✅ Templates emails (email_templates)
- ✅ Manager de templates (EmailTemplateManager)
- ✅ Éditeur visuel (EmailVisualEditor)
- ✅ Éditeur drag & drop (EmailDragDropEditor)
- ✅ Blocs d'email (EmailBlock, EmailBlockPalette)
- ✅ Prévisualisation (EmailPreview, EmailTemplatePreview)
- ✅ Variables dynamiques (VariablePalette)
- ✅ Templates Brevo
- ✅ Import de templates (TemplateImportDialog)
- ✅ Configuration système (EmailSystemConfig)
- ✅ Validateur système (EmailSystemValidator)
- ✅ Diagnostics email `/admin/email-diagnostics`
- ✅ Types de templates : welcome, booking_confirmation, review_request, etc.

### Blog
- ✅ Gestion d'articles (blog_posts)
- ✅ Dialog de création/édition (BlogPostDialog)
- ✅ Statuts : draft, published
- ✅ Slugs SEO-friendly
- ✅ Excerpts et contenu complet
- ✅ Images avec positionnement
- ✅ Date de publication

### Coffre-fort
- ✅ Stockage de secrets (admin_secrets)
- ✅ Page admin `/admin/coffre-fort`
- ✅ Catégories de secrets
- ✅ Chiffrement
- ✅ Derniers accès trackés
- ✅ Ordre d'affichage

### Configuration
- ✅ Paramètres globaux (admin_settings)
- ✅ Configuration Vybbi (VybbiConfig)
- ✅ Hook `useAdminSettings`
- ✅ Clés/valeurs JSON flexibles
- ✅ Description des paramètres

### Base de Connaissances
- ✅ Page `/admin/knowledge`
- ✅ Composant VybbiKnowledge
- ✅ Documentation interne
- ✅ Guides et tutoriels

### Roadmap
- ✅ Page `/admin/roadmap`
- ✅ Planification des fonctionnalités
- ✅ Suivi des développements

### SEO Management
- ✅ Page `/admin/seo`
- ✅ Gestion meta tags
- ✅ Sitemap automatique
- ✅ Robots.txt

### Modération
- ✅ Page `/admin/moderation`
- ✅ Modération de contenu
- ✅ Reviews en attente
- ✅ Reports utilisateurs

### Business Integrations
- ✅ Page `/admin/business-integrations`
- ✅ Intégrations tierces
- ✅ APIs externes

### Cache Tools
- ✅ Outils de cache (AdminCacheTools)
- ✅ Purge du cache
- ✅ Statistiques de cache

### Influenceurs
- ✅ Page `/admin/influenceurs`
- ✅ Validation des SIRET
- ✅ Approbation de candidatures
- ✅ Gestion des commissions

### Booking Dashboard
- ✅ Dashboard de bookings (BookingDashboard)
- ✅ Monitoring en temps réel (BookingMonitoringDashboard)

### Auth Hook
- ✅ Configuration auth hook (AuthHookSetup)
- ✅ Edge Function : setup-auth-hook

### Community Seeder
- ✅ Seeding de données (CommunitySeeder)
- ✅ Génération de contenu de test

### Security Dashboard
- ✅ Dashboard de sécurité (SecurityDashboard)
- ✅ Analyse des logs
- ✅ Alertes de sécurité

---

## 13. Blockchain & Certification

### Certification Solana
- ✅ Certification d'œuvres musicales (blockchain_certifications)
- ✅ Hash de certification
- ✅ Transaction Solana (solana_signature)
- ✅ Block number
- ✅ Network : Solana mainnet/devnet
- ✅ Edge Function : blockchain-certify
- ✅ Statuts : pending, confirmed, failed

### UI Blockchain
- ✅ Bouton de certification (BlockchainCertifyButton)
- ✅ Badge de certification (BlockchainCertificationBadge)
- ✅ QR Code de vérification (BlockchainQRCode)
- ✅ Hook `useBlockchainCertification`

### Wallet Integration
- ✅ Provider Phantom Wallet (PhantomWalletProvider)
- ✅ Bouton de connexion wallet (WalletConnectionButton)
- ✅ Informations wallet (WalletInfo)
- ✅ Bouton d'achat de tokens (TokenPurchaseButton)
- ✅ Hook `useDynamicSolana`
- ✅ Hook `useTokenPurchase`

### Vérification Publique
- ✅ URLs de certificat (certificate_url)
- ✅ QR codes de vérification (qr_code_url)
- ✅ Vérification publique sans authentification

---

## 14. Profils Spécifiques

### Artistes
- ✅ Discographie (MusicDiscography)
- ✅ Releases musicales (music_releases)
  - Titre, artiste, album
  - Date de sortie
  - Genre
  - Cover image
  - Liens streaming (Spotify, SoundCloud, YouTube)
  - Fichier audio direct
  - Statuts : draft, published, archived
- ✅ Widget de releases (MusicReleaseWidget)
- ✅ Player de musique (MusicPlayer)
- ✅ Hook `useMusicReleases`
- ✅ Disponibilités (ArtistAvailabilityCalendar)
- ✅ Représentation par agents/managers
- ✅ Demandes de représentation (ArtistRepresentationManager)
- ✅ Requêtes de représentation (ArtistRepresentationRequests)
- ✅ Abonnements radio (artist_radio_subscriptions)
- ✅ Dashboard artiste (ArtistDashboard)
- ✅ Édition de profil (ArtistProfileEdit)
- ✅ Vue publique (ArtistProfile, ArtistProfileBySlug)
- ✅ Gestion d'événements (ArtistEventManager)
- ✅ Rider technique (RiderTechnicalManager)
- ✅ Liste "Mes artistes" (MyArtists) pour agents/managers

### Lieux & Événements
- ✅ Catégorie de lieu (venue_category) : club, bar, festival, salle_concert, etc.
- ✅ Capacité (venue_capacity)
- ✅ Agenda (VenueAgenda)
- ✅ Calendrier (VenueCalendar)
- ✅ Galerie photos (VenueGallery)
- ✅ Partenaires (VenuePartners)
- ✅ Historique de talents (VenueTalentHistory)
- ✅ Dashboard lieu (VenueDashboard)
- ✅ Édition de profil (VenueProfileEdit)
- ✅ Vue publique (VenueProfile, VenueProfileBySlug)
- ✅ Revendication de profil (ClaimVenueProfile)
- ✅ Edge Functions : claim-venue-profile, send-venue-claim-email, admin-create-venue-profile

### Agents & Managers
- ✅ Relations artistes (agent_artists, manager_artists)
- ✅ Statuts de représentation : pending, accepted, rejected
- ✅ Notes de contrat (contract_notes)
- ✅ Dates de demande/réponse
- ✅ Notifications de demandes (notify_agent_request trigger)
- ✅ Invitations de représentation (send-representation-invitation)
- ✅ Dashboard agent (AgentProfile)
- ✅ Dashboard manager (ManagerProfile)
- ✅ Édition (AgentProfileEdit, ManagerProfileEdit)
- ✅ Commissions (agent_commissions)

### Partenaires
- ✅ Type de profil partner
- ✅ Dashboard partenaire (PartnerDashboard)
- ✅ Profil public (PartnerProfile, PartnerProfileBySlug)
- ✅ Page partenariats `/partenariats`
- ✅ CTA partenariat (PartnershipCTA)
- ✅ Launch partner Paris (`/launch-partner-paris`)

### Influenceurs
- ✅ Dashboard dédié (InfluenceurDashboard, InfluencerDashboard)
- ✅ Composant InfluencerDashboard
- ✅ Analytics détaillés
- ✅ Gestion de liens
- ✅ Commissions
- ✅ Page liste `/influenceurs`

---

## 15. Notifications

### Centre de Notifications
- ✅ Centre complet (NotificationCenter)
- ✅ Badge de notifications (MobileNotificationBadge)
- ✅ Page `/notifications`
- ✅ Hook `useNotifications`

### Types de Notifications
- ✅ Types définis : booking, review, message, agent_request, conversion, event, follow, etc.
- ✅ Titre et description
- ✅ Metadata JSON pour contexte
- ✅ Link vers ressource
- ✅ Référence (reference_id)

### Notifications Temps Réel
- ✅ Provider temps réel (RealtimeNotificationProvider)
- ✅ Hook `useRealtimeNotifications`
- ✅ Souscriptions Supabase Realtime
- ✅ Auto-notifications (auto-notifications Edge Function)

### Gestion
- ✅ Marquage lu/non lu
- ✅ Suppression
- ✅ Expiration (expires_at)
- ✅ Nettoyage automatique (cleanup_old_notifications)
- ✅ Paramètres de notifications (notification_settings)

### Notifications Email
- ✅ Fonction `create_notification_with_email()`
- ✅ Templates email pour notifications
- ✅ Désactivation optionnelle des emails

### Permissions
- ✅ Utilitaires de permissions (notificationPermissions.ts)
- ✅ Son de notification (notificationSound.ts)

### Booking Notifications
- ✅ Hook `useBookingNotifications`
- ✅ Notifications de nouveaux bookings
- ✅ Changements de statut

---

## 16. Recherche & Découverte

### Pages de Recherche
- ✅ Recherche avancée (`/recherche-avancee`)
- ✅ Trouver un artiste (`/trouver-artiste`)
- ✅ Trouver un agent (`/trouver-agent`)
- ✅ Trouver un lieu (`/trouver-lieu`)
- ✅ Liste d'artistes (`/artists`, `/artistes`)
- ✅ Liste de lieux (`/lieux`)
- ✅ Top artistes (`/top-artistes`)
- ✅ Nos artistes (`/nos-artistes`)
- ✅ Featured Artists Strip (FeaturedArtistsStrip)

### Filtres
- ✅ Filtrage par type de profil
- ✅ Filtrage par genres musicaux
- ✅ Filtrage par localisation
- ✅ Filtrage par talents
- ✅ Recherche textuelle
- ✅ Filtres de disponibilité

### Cartes & Localisation
- ✅ Intégration Mapbox GL
- ✅ Affichage des lieux sur carte (OfficeMap)
- ✅ Géolocalisation
- ✅ Edge Function : get-mapbox-token

### Profils Publics
- ✅ Profils découvrables si is_public = true
- ✅ Fonction `get_public_profile_data()`
- ✅ Fonction `safe_profile_select()` (sans données sensibles)
- ✅ Preview de profils (ProfilePreview)
- ✅ Cartes optimisées (OptimizedProfileCard, MobileOptimizedCard)

### Résolution de Profils
- ✅ Hook `useProfileResolver`
- ✅ Hook optimisé `useProfileResolverOptimized`
- ✅ Résolution par ID ou slug
- ✅ Redirection legacy (`/artists/:id` → `/artistes/:slug`)
- ✅ Composant LegacyProfileRedirect

---

## 17. Partage & Intégration

### Partage de Profils
- ✅ Bouton de partage (ProfileShareButton)
- ✅ Outils de partage (ProfileShareTools)
- ✅ Partage réseaux sociaux
- ✅ Copie de lien
- ✅ QR code de profil

### Widget d'Intégration
- ✅ Widget embed (ProfileEmbedWidget)
- ✅ Code iframe pour intégration externe
- ✅ Personnalisation du widget

### CTA de Profil
- ✅ Appels à l'action (ProfileCTA)
- ✅ Boutons d'action personnalisés

---

## 18. Multilingue & Traduction

### Système de Traduction
- ✅ Provider I18n (I18nProvider)
- ✅ Hook `useTranslate`
- ✅ Langues supportées (languages.ts)
- ✅ Sélecteur de langue (LanguageSelector)
- ✅ Edge Function : translate-text
- ✅ Service de traduction (translationService.ts)
- ✅ Traduction automatique (AutoTranslate)

### Contenu Adaptatif
- ✅ Contenu adaptatif (adaptiveContent.ts)
- ✅ Images adaptatives (AdaptiveReleaseImage)

---

## 19. PWA & Optimisations Mobile

### Progressive Web App
- ✅ Manifest.json
- ✅ Service Worker (sw.js, registerSW.js)
- ✅ Installation PWA (PWAInstallPrompt)
- ✅ Hook `usePWA`
- ✅ Hook `usePWAUpdate`
- ✅ Handler de mise à jour (PWAUpdateHandler)
- ✅ Notification de mise à jour (PWAUpdateNotification)
- ✅ Hook `useServiceWorker`
- ✅ Configuration vite-plugin-pwa
- ✅ Stratégies de cache Workbox

### Mode Hors Ligne
- ✅ Indicateur hors ligne (OfflineIndicator)
- ✅ Sync hors ligne pour prospecting (OfflineSyncProvider)
- ✅ Cache des données critiques

### Optimisations Mobile
- ✅ CSS mobile (mobile-optimizations.css)
- ✅ Hook `use-mobile`
- ✅ Helpers mobile (mobileHelpers.ts)
- ✅ Vérification responsive (MobileResponsiveCheck)
- ✅ Testeur responsive (ResponsiveTester)

### UI Mobile
- ✅ Header mobile (MobileHeader)
- ✅ Menu burger (MobileBurgerMenu)
- ✅ Tab bar (MobileTabBar)
- ✅ Bouton responsive (ResponsiveButton)
- ✅ Images optimisées (MobileOptimizedImage, OptimizedImage)
- ✅ Cartes optimisées (MobileOptimizedCard)
- ✅ Safe areas (pt-safe-top, pb-safe-bottom)

### Performance
- ✅ Optimiseur de performance (PerformanceOptimizer)
- ✅ Lazy loading (LazyLoadAnalytics, SuspenseLoader)
- ✅ Optimisation d'images (imageOptimization.ts)
- ✅ États de chargement (LoadingStates)
- ✅ Queries optimisées (useOptimizedQueries, useOptimizedProfileData)

---

## 20. Sécurité

### Row Level Security (RLS)
- ✅ RLS activé sur toutes les tables
- ✅ Policies détaillées par rôle
- ✅ Fonction `has_role()` SECURITY DEFINER
- ✅ Fonction `user_owns_profile()` pour ownership
- ✅ Fonction `user_can_access_conversation()`
- ✅ Fonction `can_access_sensitive_profile_data()`

### Protection des Données Sensibles
- ✅ Fonction `get_safe_profile_columns()` pour select sécurisé
- ✅ Fonction `get_profile_with_privacy()` avec masquage
- ✅ Trigger `prevent_pii_access()`
- ✅ Trigger `audit_sensitive_profile_access()`
- ✅ Fonction `log_sensitive_access()`
- ✅ Colonnes sensibles : email, phone, siret_number

### Audit & Logs
- ✅ Table security_audit_log
- ✅ Fonction `log_security_event()`
- ✅ Fonction `check_security_integrity()`
- ✅ Statut de sécurité (`security_phase1_status`)

### Anti-Bruteforce
- ✅ Table login_attempts
- ✅ Fonction `track_login_attempt()`
- ✅ Fonction `is_user_blocked()`
- ✅ Blocage temporaire après tentatives échouées
- ✅ Nettoyage automatique (cleanup_old_login_attempts)

### Blocage d'Utilisateurs
- ✅ Table blocked_users
- ✅ Empêche conversations et interactions
- ✅ Gestion par l'utilisateur

### Credentials Temporaires
- ✅ Table temporary_credentials
- ✅ Comptes temporaires avec expiration
- ✅ Claim de profils temporaires
- ✅ Nettoyage automatique (cleanup_expired_temp_credentials)

### Sécurité Messaging
- ✅ Trigger `enforce_messaging_policy`
- ✅ Validation des UUIDs
- ✅ Vérification des profils existants
- ✅ Gestion des erreurs sans bloquer

---

## 21. Autres Fonctionnalités

### Design & Thème
- ✅ **Dark mode OBLIGATOIRE** (pas de background blanc)
- ✅ Design system complet (index.css, tailwind.config.ts)
- ✅ Tokens sémantiques HSL
- ✅ Composants shadcn-ui personnalisés (47 composants)
- ✅ Animations (tailwindcss-animate)
- ✅ Font personnalisée Vybbi (vybbi-display.ttf)

### Layout
- ✅ Layout principal (Layout.tsx)
- ✅ Header (Header.tsx)
- ✅ Footer (Footer.tsx)
- ✅ Sidebar (AppSidebar)
- ✅ Top Nav (TopNav)
- ✅ Barre d'accès Vybbi (VybbiAccessBar)
- ✅ Scroll to top (ScrollToTop)

### Pages Publiques
- ✅ Landing page (Landing.tsx)
- ✅ À propos (`/a-propos`)
- ✅ Fondateurs (`/fondateurs`)
- ✅ Technologie (`/technologie`)
- ✅ Fonctionnalités (`/fonctionnalites`)
- ✅ Tarifs (`/tarifs`)
- ✅ Centre d'aide (`/centre-aide`)
- ✅ Contact (`/contact`)
- ✅ Confidentialité (`/confidentialite`)
- ✅ Conditions (`/conditions`)
- ✅ Cookies (`/cookies`)
- ✅ Demo (`/demo`)
- ✅ Pour artistes (`/pour-artistes`)
- ✅ Pour agents/managers (`/pour-agents-managers`)
- ✅ Pour lieux/événements (`/pour-lieux-evenements`)

### SEO
- ✅ Composant SEO Head (SEOHead.tsx)
- ✅ Meta tags dynamiques
- ✅ Open Graph
- ✅ Twitter Cards
- ✅ Sitemap automatique (sitemapGenerator.ts, generate-sitemap.js)
- ✅ Robots.txt
- ✅ Canonical URLs

### Conformité
- ✅ Bannière cookies (CookieConsentBanner)
- ✅ Politique de confidentialité
- ✅ Conditions d'utilisation
- ✅ RGPD compliance

### Widgets Externes
- ✅ HubSpot chat widget (intégré dans index.html)
- ✅ Google Analytics 4
- ✅ Stripe (prévu)

### Formulaires
- ✅ Formulaire de contact (ContactForm, DirectContactForm)
- ✅ Formulaire de review (ReviewForm, EnhancedReviewForm)
- ✅ Formulaire d'inscription par rôle (RoleSignupForm)
- ✅ React Hook Form + Zod validation

### Médias
- ✅ Upload d'images (ImageUpload)
- ✅ Éditeur d'image de header (HeaderImageEditor)
- ✅ Slider de galerie (ImageGallerySlider)
- ✅ Upload de flyers (EventFlyerUpload)
- ✅ Table media_assets (images, vidéos, audio)
- ✅ Génération d'avatar IA (generate-ai-avatar)

### Gamification
- ✅ Hook `useGamification`
- ✅ Points et badges
- ✅ Récompenses quotidiennes

### Productions
- ✅ Slider de productions (ProductionsSlider)
- ✅ Showcase de travaux

### Événements Spéciaux
- ✅ Ticker banner (TickerBanner)
- ✅ Beta badge (BetaBadge)

### Accessibilité
- ✅ Tooltips d'aide (HelpTooltips)
- ✅ Textes alternatifs sur images
- ✅ Navigation au clavier

### Tests & Debugging
- ✅ Actions de test rapides (QuickTestActions)
- ✅ Test du flux d'authentification (TestAuthFlow)
- ✅ Page de test système (`/system-test`)
- ✅ Setup de tests (tests/setup.ts)

### Guide & Onboarding
- ✅ Guide de bienvenue (WelcomeGuide)
- ✅ Modal de bienvenue (WelcomeModal)
- ✅ Hook `useWelcomeModal`
- ✅ Étapes d'onboarding (OnboardingStep, Step1-4)
- ✅ Hook `useOnboarding`

### Pricing
- ✅ Indicateur de tarification (PricingIndicator)
- ✅ Informations d'offre d'essai (useTrialConfig)
- ✅ Edge Function : update-trial-offer

### IA & Automatisation
- ✅ Panel de recommandations IA (AIRecommendationsPanel)
- ✅ IA conversationnelle (ConversationalAI)
- ✅ Dashboard analytics prédictifs (PredictiveAnalyticsDashboard)
- ✅ Scoring IA (useAIScoring)
- ✅ IA avancée (useAdvancedAI)
- ✅ Edge Function : dual-ai-chat, vybbi-ai

### Témoignages
- ✅ Section témoignages (TestimonialsSection)
- ✅ Reviews publiques

### Dialogues & Confirmations
- ✅ Confirmation d'email (EmailConfirmationDialog)
- ✅ Dialogs réutilisables (shadcn-ui dialog)
- ✅ Toasts (sonner)

### Utilitaires
- ✅ Debounce (useDebounce)
- ✅ Formatage de temps (formatTime.ts, dateTime.ts)
- ✅ Utilitaires généraux (utils.ts)
- ✅ Genres musicaux (musicGenres.ts)
- ✅ Liens sociaux (socialLinks.ts)
- ✅ Talents (talents.ts)

### Autocomplete
- ✅ Autocomplete de genres (GenreAutocomplete)

### Service Requests
- ✅ Carte de demande de service (ServiceRequestCard)
- ✅ Dialog de demande (ServiceRequestDialog)

### Quick Profile Card
- ✅ Carte de profil rapide (QuickProfileCard)
- ✅ Prévisualisation au survol

### Spotify Metadata
- ✅ Edge Function : spotify-metadata
- ✅ Récupération de métadonnées Spotify

### YouTube
- ✅ Player YouTube intégré (YouTubePlayer)
- ✅ Radio YouTube (YouTubeRadioPlayer)

### Web TV
- ✅ Page Web TV (`/webtv`)
- ✅ Chat Web TV (WebTVChat)
- ✅ Scheduler Web TV (WebTVScheduler)

### Conversion Tracking
- ✅ Table conversion_tracking
- ✅ Tracking des conversions non-affiliation
- ✅ Commissions agents Vybbi

### Parrainage
- ✅ Page parrainage (`/parrainage`)
- ✅ Système de referral

### Bouton Vybbi
- ✅ Composant stylisé (VybbiButton)

### Home Conditionnelle
- ✅ Home page adaptée au rôle (ConditionalHomePage)

### Error Handling
- ✅ Error Boundary (ErrorBoundary.tsx)
- ✅ Page 404 (NotFound.tsx)
- ✅ Gestion des erreurs globale

---

## 22. Edge Functions Supabase (30 fonctions)

1. **send-notification** - Envoi d'emails via templates internes ou Brevo
2. **auth-email-sender** - Emails d'authentification
3. **send-system-notification** - Notifications système
4. **gmail-send-email** - Envoi via Gmail
5. **translate-text** - Traduction automatique
6. **ga4-fetch-data** - Récupération de données Google Analytics 4
7. **get-mapbox-token** - Token Mapbox pour cartes
8. **blockchain-certify** - Certification Solana
9. **create-token-payment** - Création de paiement tokens
10. **verify-token-payment** - Vérification de paiement tokens
11. **calculate-monthly-commissions** - Calcul des commissions mensuelles
12. **send-venue-claim-email** - Email de revendication de lieu
13. **claim-venue-profile** - Revendication de profil lieu
14. **send-representation-invitation** - Invitation de représentation
15. **admin-create-venue-profile** - Création de profil lieu par admin
16. **whatsapp-sender** - Envoi WhatsApp
17. **prospect-webhooks** - Webhooks de prospection
18. **send-prospecting-email** - Emails de prospection
19. **vybbi-ai** - IA conversationnelle Vybbi
20. **auto-notifications** - Notifications automatiques
21. **send-influencer-welcome-email** - Email de bienvenue influenceur
22. **spotify-metadata** - Métadonnées Spotify
23. **admin-confirm-user** - Confirmation utilisateur par admin
24. **dual-ai-chat** - Chat dual IA
25. **generate-ai-avatar** - Génération d'avatar IA
26. **process-workflow-tasks** - Traitement des tâches de workflow
27. **setup-auth-hook** - Configuration du hook d'authentification
28. **update-trial-offer** - Mise à jour de l'offre d'essai

---

## Statistiques Générales

- **87 pages** dans l'application
- **200+ composants React**
- **45+ hooks personnalisés**
- **80+ tables Supabase**
- **30 Edge Functions**
- **47 composants shadcn-ui**
- **85+ dépendances npm**
- **Types de profils** : 7 (artist, lieu, agent, manager, influencer, partner, admin)
- **Langues supportées** : Multilingue avec traduction automatique
- **Intégrations externes** : GA4, HubSpot, Mapbox, Solana, Spotify, Stripe (prévu)

---

## Technologies Utilisées

### Frontend
- React 18.3.1
- TypeScript 5.8.3
- Vite 5.4.19
- Tailwind CSS 3.4.17
- React Router 6.30.1
- React Query 5.83.0
- shadcn-ui (Radix UI)
- Recharts 2.15.4

### Backend
- Supabase (PostgreSQL)
- Supabase Edge Functions (Deno)
- Supabase Realtime
- Supabase Storage

### Blockchain
- Solana Web3.js 1.98.4
- Phantom Wallet

### Maps
- Mapbox GL 3.15.0

### Analytics
- Google Analytics 4

### PWA
- vite-plugin-pwa 1.0.3
- Workbox

---

## Notes de Version

### Phase Actuelle : Beta
- ✅ Sécurisation immédiate terminée (Phase 1)
- ✅ RLS activé sur toutes les tables
- ✅ Protection des données sensibles
- ✅ Fonction `has_role()` sécurisée
- ✅ Audit logs en place
- ⏳ Programme d'affiliation influenceur en exclusivité temporaire
- ⏳ Stripe payment integration en cours

---

*Document généré le 2025-10-18*
*Version de l'application : 1.0.0-beta*
