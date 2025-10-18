# Architecture de l'Application Vybbi

## Vue d'Ensemble

Vybbi est une plateforme full-stack de networking pour l'industrie musicale, construite avec une architecture moderne et scalable.

- **URL du projet** : Lovable (déployé automatiquement via GitHub)
- **Type** : Progressive Web App (PWA)
- **Architecture** : SPA (Single Page Application) avec backend Supabase
- **Hosting** : Lovable Cloud avec base path dynamique

---

## Stack Technique

### Frontend
- **Framework** : React 18.3.1
- **Language** : TypeScript 5.8.3
- **Build Tool** : Vite 5.4.19
- **Styling** : Tailwind CSS 3.4.17
- **UI Components** : shadcn-ui (Radix UI primitives)
- **Routing** : React Router DOM 6.30.1
- **State Management** : React Query 5.83.0 + Context API
- **Forms** : React Hook Form 7.61.1 + Zod 3.25.76

### Backend
- **Database** : PostgreSQL (via Supabase)
- **BaaS** : Supabase 2.57.2
- **Edge Functions** : Supabase Functions (Deno runtime)
- **Authentication** : Supabase Auth
- **Storage** : Supabase Storage
- **Realtime** : Supabase Realtime

### Blockchain & Web3
- **Blockchain** : Solana
- **SDK** : @solana/web3.js 1.98.4
- **Wallet** : Phantom Wallet (@solana/wallet-adapter-phantom)

### Maps & Geolocation
- **Maps** : Mapbox GL 3.15.0

### Analytics
- **Analytics** : Google Analytics 4 (G-K1LQ1MVX3R)

### PWA
- **Plugin** : vite-plugin-pwa 1.0.3
- **Service Worker** : Workbox strategies

### Charts & Visualizations
- **Charts** : Recharts 2.15.4

---

## Architecture Frontend

### Structure des Dossiers

```
src/
├── components/                  # 200+ composants React
│   ├── admin/                  # 27 composants administration
│   │   ├── AdCampaignDialog.tsx
│   │   ├── AdCreativeDialog.tsx
│   │   ├── AdSlotDialog.tsx
│   │   ├── AdminCacheTools.tsx
│   │   ├── AuthHookSetup.tsx
│   │   ├── BlogPostDialog.tsx
│   │   ├── BookingDashboard.tsx
│   │   ├── BookingMonitoringDashboard.tsx
│   │   ├── CommunitySeeder.tsx
│   │   ├── DeletePlaylistDialog.tsx
│   │   ├── EditPlaylistDialog.tsx
│   │   ├── EmailBlock.tsx
│   │   ├── EmailBlockPalette.tsx
│   │   ├── EmailDragDropEditor.tsx
│   │   ├── EmailPreview.tsx
│   │   ├── EmailSystemConfig.tsx
│   │   ├── EmailSystemValidator.tsx
│   │   ├── EmailTemplateManager.tsx
│   │   ├── EmailTemplatePreview.tsx
│   │   ├── EmailVisualEditor.tsx
│   │   ├── GAStatsCards.tsx
│   │   ├── MockProfileGenerator.tsx
│   │   ├── MockProfileManager.tsx
│   │   ├── PinProtection.tsx
│   │   ├── PlaylistTracksDialog.tsx
│   │   ├── RadioManagement.tsx
│   │   ├── RadioPlaylistManager.tsx
│   │   ├── SecurityDashboard.tsx
│   │   ├── SystemHealthCard.tsx
│   │   ├── TemplateImportDialog.tsx
│   │   ├── VariablePalette.tsx
│   │   ├── VybbiConfig.tsx
│   │   ├── VybbiKnowledge.tsx
│   │   └── VybbiMonitoring.tsx
│   │
│   ├── ui/                     # 47 composants shadcn-ui
│   │   ├── accordion.tsx
│   │   ├── alert-dialog.tsx
│   │   ├── alert.tsx
│   │   ├── aspect-ratio.tsx
│   │   ├── avatar.tsx
│   │   ├── badge.tsx
│   │   ├── breadcrumb.tsx
│   │   ├── button.tsx
│   │   ├── calendar.tsx
│   │   ├── card.tsx
│   │   ├── carousel.tsx
│   │   ├── chart.tsx
│   │   ├── checkbox.tsx
│   │   ├── collapsible.tsx
│   │   ├── command.tsx
│   │   ├── context-menu.tsx
│   │   ├── dialog.tsx
│   │   ├── drawer.tsx
│   │   ├── dropdown-menu.tsx
│   │   ├── form.tsx
│   │   ├── hover-card.tsx
│   │   ├── input-otp.tsx
│   │   ├── input.tsx
│   │   ├── label.tsx
│   │   ├── menubar.tsx
│   │   ├── navigation-menu.tsx
│   │   ├── pagination.tsx
│   │   ├── password-input.tsx
│   │   ├── popover.tsx
│   │   ├── progress.tsx
│   │   ├── radio-group.tsx
│   │   ├── resizable.tsx
│   │   ├── scroll-area.tsx
│   │   ├── select.tsx
│   │   ├── separator.tsx
│   │   ├── sheet.tsx
│   │   ├── sidebar.tsx
│   │   ├── skeleton.tsx
│   │   ├── slider.tsx
│   │   ├── sonner.tsx
│   │   ├── switch.tsx
│   │   ├── table.tsx
│   │   ├── tabs.tsx
│   │   ├── textarea.tsx
│   │   ├── toast.tsx
│   │   ├── toggle-group.tsx
│   │   ├── toggle.tsx
│   │   └── tooltip.tsx
│   │
│   ├── layout/                 # 9 composants layout
│   │   ├── AppSidebar.tsx
│   │   ├── Footer.tsx
│   │   ├── Header.tsx
│   │   ├── Layout.tsx
│   │   ├── MobileBurgerMenu.tsx
│   │   ├── MobileHeader.tsx
│   │   ├── MobileTabBar.tsx
│   │   ├── TopNav.tsx
│   │   └── VybbiAccessBar.tsx
│   │
│   ├── messages/               # 7 composants messagerie
│   │   ├── Composer.tsx
│   │   ├── ConversationList.tsx
│   │   ├── ConversationListItem.tsx
│   │   ├── MessageBubble.tsx
│   │   ├── MessageHeader.tsx
│   │   ├── MessageList.tsx
│   │   └── RightInfoPanel.tsx
│   │
│   ├── social/                 # 13 composants social
│   │   ├── AdBanner.tsx
│   │   ├── CommentItem.tsx
│   │   ├── FollowButton.tsx
│   │   ├── NewsFeed.tsx
│   │   ├── OnlineUsers.tsx
│   │   ├── PostCard.tsx
│   │   ├── PostCreator.tsx
│   │   ├── ProfileSidebar.tsx
│   │   ├── QuickProfileCard.tsx
│   │   ├── RightSidebar.tsx
│   │   ├── ServiceRequestCard.tsx
│   │   └── ServiceRequestDialog.tsx
│   │
│   ├── prospecting/            # 25 composants CRM
│   │   ├── AnalyticsDashboard.tsx
│   │   ├── AutoReportGenerator.tsx
│   │   ├── BookingScheduler.tsx
│   │   ├── BulkActionsPanel.tsx
│   │   ├── CommercialDashboard.tsx
│   │   ├── GamificationPanel.tsx
│   │   ├── HotProspectsDetector.tsx
│   │   ├── IntegrationsCenter.tsx
│   │   ├── IntelligentSearch.tsx
│   │   ├── ListView.tsx
│   │   ├── MobileKanbanView.tsx
│   │   ├── MobileProspectCard.tsx
│   │   ├── MobileTouchOptimizer.tsx
│   │   ├── MultiChannelAutomation.tsx
│   │   ├── OfflineSyncProvider.tsx
│   │   ├── ProspectDialog.tsx
│   │   ├── ProspectFilters.tsx
│   │   ├── ProspectKanbanBoard.tsx
│   │   ├── ProspectNotificationBadge.tsx
│   │   ├── ProspectNotificationCenter.tsx
│   │   ├── ProspectPipeline.tsx
│   │   ├── ProspectTagManager.tsx
│   │   ├── ProspectingEmailSender.tsx
│   │   ├── PullToRefresh.tsx
│   │   ├── SwipeableProspectCard.tsx
│   │   ├── TaskManager.tsx
│   │   ├── VenueProspectingDialog.tsx
│   │   ├── WhatsAppSender.tsx
│   │   └── WorkflowManager.tsx
│   │
│   ├── ads/                    # 2 composants publicité
│   │   ├── AdSlot.tsx
│   │   └── AdSystemTester.tsx
│   │
│   ├── ai/                     # 3 composants IA
│   │   ├── AIRecommendationsPanel.tsx
│   │   ├── ConversationalAI.tsx
│   │   └── PredictiveAnalyticsDashboard.tsx
│   │
│   ├── common/                 # 1 composant commun
│   │   └── SuspenseLoader.tsx
│   │
│   ├── dashboard/              # 4 composants dashboard
│   │   ├── AcquisitionChart.tsx
│   │   ├── CommissionDistribution.tsx
│   │   ├── MetricCard.tsx
│   │   └── TimeFilter.tsx
│   │
│   ├── onboarding/             # 4 composants onboarding
│   │   ├── OnboardingStep.tsx
│   │   ├── Step1BasicInfo.tsx
│   │   ├── Step2ProfileSpecific.tsx
│   │   ├── Step3Contact.tsx
│   │   └── Step4Final.tsx
│   │
│   ├── vybbi/                  # 5 composants tokens
│   │   ├── VybbiDailyReward.tsx
│   │   ├── VybbiSpendingOptions.tsx
│   │   ├── VybbiTokenBalance.tsx
│   │   ├── VybbiTokenHistory.tsx
│   │   └── VybbiTokenPurchase.tsx
│   │
│   ├── wallet/                 # 4 composants wallet
│   │   ├── PhantomWalletProvider.tsx
│   │   ├── TokenPurchaseButton.tsx
│   │   ├── WalletConnectionButton.tsx
│   │   └── WalletInfo.tsx
│   │
│   └── [80+ autres composants] # Composants racine
│       ├── AdaptiveReleaseImage.tsx
│       ├── AffiliateLinkDialog.tsx
│       ├── AffiliateQRGenerator.tsx
│       ├── ArtistAvailabilityCalendar.tsx
│       ├── ArtistEventManager.tsx
│       ├── ArtistRepresentationManager.tsx
│       ├── ArtistRepresentationRequests.tsx
│       ├── ArtistStatsWidget.tsx
│       ├── AutoTranslate.tsx
│       ├── BetaBadge.tsx
│       ├── BlockchainCertificationBadge.tsx
│       ├── BlockchainCertifyButton.tsx
│       ├── BlockchainQRCode.tsx
│       ├── ConditionalHomePage.tsx
│       ├── ContactForm.tsx
│       ├── CookieConsentBanner.tsx
│       ├── DirectContactForm.tsx
│       ├── EmailConfirmationDialog.tsx
│       ├── EnhancedAuthSecurity.tsx
│       ├── EnhancedProfileAnalytics.tsx
│       ├── EnhancedReviewForm.tsx
│       ├── ErrorBoundary.tsx
│       ├── EventFlyer.tsx
│       ├── EventFlyerUpload.tsx
│       ├── FeaturedArtistsStrip.tsx
│       ├── GenreAutocomplete.tsx
│       ├── HeaderImageEditor.tsx
│       ├── HelpTooltips.tsx
│       ├── ImageGallerySlider.tsx
│       ├── ImageUpload.tsx
│       ├── InfluencerDashboard.tsx
│       ├── InfluencerWelcomeModal.tsx
│       ├── LanguageSelector.tsx
│       ├── LazyLoadAnalytics.tsx
│       ├── LoadingStates.tsx
│       ├── MobileNotificationBadge.tsx
│       ├── MobileOptimizedCard.tsx
│       ├── MobileOptimizedImage.tsx
│       ├── MobileResponsiveCheck.tsx
│       ├── MusicDiscography.tsx
│       ├── MusicPlayer.tsx
│       ├── MusicReleaseWidget.tsx
│       ├── NotificationCenter.tsx
│       ├── OfficeMap.tsx
│       ├── OfflineIndicator.tsx
│       ├── OptimizedImage.tsx
│       ├── OptimizedProfileCard.tsx
│       ├── PWAInstallPrompt.tsx
│       ├── PWAUpdateHandler.tsx
│       ├── PWAUpdateNotification.tsx
│       ├── PartnershipCTA.tsx
│       ├── PerformanceOptimizer.tsx
│       ├── PricingIndicator.tsx
│       ├── ProductionsSlider.tsx
│       ├── ProfileAnalytics.tsx
│       ├── ProfileCTA.tsx
│       ├── ProfileEmbedWidget.tsx
│       ├── ProfileEvents.tsx
│       ├── ProfilePreview.tsx
│       ├── ProfileShareButton.tsx
│       ├── ProfileShareTools.tsx
│       ├── ProfileViewStatsCard.tsx
│       ├── ProfileVisitors.tsx
│       ├── QuickTestActions.tsx
│       ├── RadioControls.tsx
│       ├── RadioPlayer.tsx
│       ├── RadioPlaylistController.tsx
│       ├── RadioQueue.tsx
│       ├── RadioRequestDialog.tsx
│       ├── RadioStatsDisplay.tsx
│       ├── RadioSubmissionDialog.tsx
│       ├── RealtimeNotificationProvider.tsx
│       ├── ResponsiveButton.tsx
│       ├── ResponsiveTester.tsx
│       ├── ReviewForm.tsx
│       ├── RiderTechnicalManager.tsx
│       ├── RoleSignupForm.tsx
│       ├── SEOHead.tsx
│       ├── ScrollToTop.tsx
│       ├── SiretField.tsx
│       ├── TestAuthFlow.tsx
│       ├── TestimonialsSection.tsx
│       ├── TickerBanner.tsx
│       ├── VenueAgenda.tsx
│       ├── VenueCalendar.tsx
│       ├── VenueGallery.tsx
│       ├── VenuePartners.tsx
│       ├── VenueTalentHistory.tsx
│       ├── VybbiButton.tsx
│       ├── WebTVChat.tsx
│       ├── WebTVScheduler.tsx
│       ├── WelcomeGuide.tsx
│       ├── WelcomeModal.tsx
│       ├── YouTubePlayer.tsx
│       └── YouTubeRadioPlayer.tsx
│
├── pages/                      # 87 pages de l'application
│   ├── [Pages listées dans section Routing ci-dessous]
│
├── hooks/                      # 45+ hooks personnalisés
│   ├── use-mobile.tsx
│   ├── use-toast.ts
│   ├── useAIScoring.ts
│   ├── useAdminSettings.ts
│   ├── useAdminStats.ts
│   ├── useAdvancedAI.ts
│   ├── useAuth.ts
│   ├── useBlockchainCertification.ts
│   ├── useBookingNotifications.ts
│   ├── useConversations.ts
│   ├── useConversions.ts
│   ├── useDebounce.ts
│   ├── useEventRSVP.ts
│   ├── useFollowStats.ts
│   ├── useGAPageTracking.ts
│   ├── useGAStats.ts
│   ├── useGamification.ts
│   ├── useMessages.ts
│   ├── useMusicReleases.ts
│   ├── useNotifications.ts
│   ├── useOnboarding.ts
│   ├── useOnlineUsers.ts
│   ├── usePWA.ts
│   ├── usePWAUpdate.ts
│   ├── usePostComments.ts
│   ├── useProfileResolver.ts
│   ├── useProfileResolverOptimized.ts
│   ├── useProfileTracking.ts
│   ├── useProspectNotifications.ts
│   ├── useProspects.ts
│   ├── useRadioPlayer.ts
│   ├── useRadioPlayerVisibility.ts
│   ├── useRadioRequests.ts
│   ├── useRadioSubmissions.ts
│   ├── useRealtimeNotifications.ts
│   ├── useServiceWorker.ts
│   ├── useSocialActions.ts
│   ├── useSocialFeed.ts
│   ├── useTokenPurchase.ts
│   ├── useTranslate.ts
│   ├── useTrialConfig.ts
│   ├── useTypingPresence.ts
│   ├── useUserPresence.ts
│   ├── useVybbiTokens.ts
│   └── useWelcomeModal.ts
│
├── features/                   # Architecture modulaire par feature
│   ├── admin/
│   │   ├── components/
│   │   │   └── AdminLayout.tsx
│   │   └── routes.tsx
│   ├── auth/
│   │   └── routes.tsx
│   ├── dashboard/
│   │   └── routes.tsx
│   ├── discovery/
│   │   └── routes.tsx
│   ├── events/
│   │   └── routes.tsx
│   ├── influencer/
│   │   └── routes.tsx
│   ├── media/
│   │   └── routes.tsx
│   ├── onboarding/
│   │   └── routes.tsx
│   ├── partners/
│   │   └── routes.tsx
│   ├── profiles/
│   │   └── routes.tsx
│   ├── public-pages/
│   │   └── routes.tsx
│   ├── social/
│   │   └── routes.tsx
│   ├── token/
│   │   └── routes.tsx
│   └── wallet/
│       └── useDynamicSolana.ts
│
├── integrations/
│   └── supabase/
│       ├── client.ts           # Client Supabase configuré
│       └── types.ts            # Types auto-générés (read-only)
│
├── lib/                        # Services et utilitaires
│   ├── adaptiveContent.ts
│   ├── analytics.ts
│   ├── emailService.ts
│   ├── languages.ts
│   ├── musicGenres.ts
│   ├── socialLinks.ts
│   ├── talents.ts
│   ├── translationService.ts
│   ├── types.ts                # Types de l'application
│   └── utils.ts
│
├── utils/                      # Fonctions utilitaires
│   ├── dateTime.ts
│   ├── formatTime.ts
│   ├── imageOptimization.ts
│   ├── mobileHelpers.ts
│   ├── notificationPermissions.ts
│   ├── notificationSound.ts
│   └── sitemapGenerator.ts
│
├── contexts/                   # React contexts
│   └── I18nProvider.tsx
│
├── types/                      # Types TypeScript
│   ├── social.ts
│   └── wallet.ts
│
├── styles/                     # Styles CSS
│   ├── index.css               # Styles globaux + design system
│   └── mobile-optimizations.css
│
├── assets/                     # Assets statiques
│   ├── gilles-k.png
│   ├── vybbi-dj-token.png
│   ├── vybbi-logo-mobile.png
│   ├── vybbi-logo.png
│   ├── vybbi-meme-space.png
│   ├── vybbi-wolf-logo.png
│   └── wolf-logo.png
│
├── tests/
│   └── setup.ts
│
├── App.tsx                     # Composant racine
├── main.tsx                    # Point d'entrée
└── vite-env.d.ts              # Types Vite

public/
├── fonts/
│   └── vybbi-display.ttf
├── images/
│   └── personas/
├── docs/
├── radio/
│   └── sample.mp3
├── _headers                    # Headers Cloudflare
├── _redirects                  # Redirects
├── browserconfig.xml
├── favicon.ico
├── manifest.json              # PWA manifest
├── robots.txt
├── sitemap.xml
├── sw.js                      # Service Worker
├── vybbi-logo-pwa.png
└── vybbi-logo.png
```

---

## Routing - 87 Pages

### Pages Publiques (21 routes)

| Route | Fichier | Description |
|-------|---------|-------------|
| `/` | Landing.tsx | Page d'accueil |
| `/landing` | Landing.tsx | Page d'accueil alternative |
| `/blog` | Blog.tsx | Liste des articles de blog |
| `/blog/:slug` | BlogPost.tsx | Article de blog individuel |
| `/technologie` | Technologie.tsx | Page technologie |
| `/fondateurs` | Fondateurs.tsx | Page fondateurs |
| `/a-propos` | APropos.tsx | À propos de Vybbi |
| `/partenariats` | Partenariats.tsx | Page partenariats |
| `/parrainage` | Parrainage.tsx | Programme de parrainage |
| `/fonctionnalites` | Fonctionnalites.tsx | Liste des fonctionnalités |
| `/tarifs` | Tarifs.tsx | Grille tarifaire |
| `/centre-aide` | CentreAide.tsx | Centre d'aide |
| `/contact` | Contact.tsx | Formulaire de contact |
| `/confidentialite` | Confidentialite.tsx | Politique de confidentialité |
| `/conditions` | Conditions.tsx | Conditions d'utilisation |
| `/cookies` | Cookies.tsx | Politique cookies |
| `/pour-artistes` | PourArtistes.tsx | Landing artistes |
| `/pour-agents-managers` | PourAgentsManagers.tsx | Landing agents |
| `/pour-lieux-evenements` | PourLieuxEvenements.tsx | Landing lieux |
| `/demo` | Demo.tsx | Démo de la plateforme |
| `/acces-complet` | AccesComplet.tsx | Accès complet |

### Routes Authentification (4 routes)

| Route | Fichier | Description |
|-------|---------|-------------|
| `/auth` | Auth.tsx | Page de connexion/inscription |
| `/auth/callback` | AuthCallback.tsx | Callback OAuth |
| `/forgot-password` | ForgotPassword.tsx | Mot de passe oublié |
| `/reset-password` | ResetPassword.tsx | Réinitialisation mot de passe |

### Routes Onboarding (5 routes)

| Route | Fichier | Description |
|-------|---------|-------------|
| `/get-started` | GetStarted.tsx | Page de démarrage |
| `/account-setup` | AccountSetup.tsx | Configuration du compte |
| `/onboarding` | Onboarding.tsx | Processus d'onboarding |
| `/inscription-confirmation` | InscriptionConfirmation.tsx | Confirmation d'inscription |
| `/inscription-influenceur` | InscriptionInfluenceur.tsx | Inscription influenceur |

### Routes Profils (15 routes)

| Route | Fichier | Description |
|-------|---------|-------------|
| `/profiles` | Profiles.tsx | Liste de tous les profils |
| `/artistes/:slug` | ArtistProfileBySlug.tsx | Profil artiste par slug |
| `/artists/:id` | ArtistProfile.tsx | Profil artiste (legacy) |
| `/artist-profile-edit` | ArtistProfileEdit.tsx | Édition profil artiste |
| `/artist-dashboard` | ArtistDashboard.tsx | Dashboard artiste |
| `/agents/:id` | AgentProfile.tsx | Profil agent |
| `/agent-profile-edit` | AgentProfileEdit.tsx | Édition profil agent |
| `/managers/:id` | ManagerProfile.tsx | Profil manager |
| `/manager-profile-edit` | ManagerProfileEdit.tsx | Édition profil manager |
| `/lieux/:slug` | VenueProfileBySlug.tsx | Profil lieu par slug |
| `/lieux/:id` | VenueProfile.tsx | Profil lieu (legacy) |
| `/venue-profile-edit` | VenueProfileEdit.tsx | Édition profil lieu |
| `/venue-dashboard` | VenueDashboard.tsx | Dashboard lieu |
| `/partners/:slug` | PartnerProfileBySlug.tsx | Profil partner par slug |
| `/partner-dashboard` | PartnerDashboard.tsx | Dashboard partner |

### Routes Dashboards (5 routes)

| Route | Fichier | Description |
|-------|---------|-------------|
| `/dashboard` | Dashboard.tsx | Dashboard principal |
| `/campaigns` | Campaigns.tsx | Campagnes marketing |
| `/commissions` | Commissions.tsx | Commissions |
| `/reports` | Reports.tsx | Rapports |
| `/promotion` | Promotion.tsx | Promotion |

### Routes Social (4 routes)

| Route | Fichier | Description |
|-------|---------|-------------|
| `/social` | SocialWall.tsx | Fil d'actualité social |
| `/messages` | Messages.tsx | Messagerie |
| `/notifications` | Notifications.tsx | Centre de notifications |
| `/communities` | Communities.tsx | Communautés |

### Routes Découverte (13 routes)

| Route | Fichier | Description |
|-------|---------|-------------|
| `/trouver-artiste` | TrouverArtiste.tsx | Recherche d'artistes |
| `/trouver-agent` | TrouverAgent.tsx | Recherche d'agents |
| `/trouver-lieu` | TrouverLieu.tsx | Recherche de lieux |
| `/artists` | Artists.tsx | Liste d'artistes |
| `/artistes` | NosArtistes.tsx | Nos artistes |
| `/lieux` | Lieux.tsx | Liste de lieux |
| `/top-artistes` | TopArtistes.tsx | Top artistes |
| `/recherche-avancee` | RechercheAvancee.tsx | Recherche avancée |
| `/nos-artistes` | NosArtistes.tsx | Nos artistes |
| `/partners` | Partners.tsx | Liste de partenaires |
| `/partners-old` | PartnersOld.tsx | Ancienne page partenaires |

### Routes Événements (4 routes)

| Route | Fichier | Description |
|-------|---------|-------------|
| `/events` | EventsManager.tsx | Gestion d'événements |
| `/annonce-manager` | AnnonceManager.tsx | Gestion d'annonces |
| `/annonces` | AnnoncesWall.tsx | Mur d'annonces |
| `/publier-offre` | PublierOffre.tsx | Publier une offre |

### Routes Media (2 routes)

| Route | Fichier | Description |
|-------|---------|-------------|
| `/radio` | Radio.tsx | Vybbi Radio |
| `/webtv` | WebTV.tsx | Web TV |

### Routes Influenceurs (2 routes)

| Route | Fichier | Description |
|-------|---------|-------------|
| `/influenceurs` | Influenceurs.tsx | Liste influenceurs |
| `/influenceur-dashboard` | InfluenceurDashboard.tsx | Dashboard influenceur |

### Routes Tokens (2 routes)

| Route | Fichier | Description |
|-------|---------|-------------|
| `/token` | Token.tsx | Info token VYBBI |
| `/vybbi-tokens` | VybbiTokens.tsx | Gestion tokens |

### Routes Admin (14 routes)

| Route | Fichier | Description |
|-------|---------|-------------|
| `/admin` | AdminDashboard.tsx | Dashboard admin |
| `/admin/communication` | AdminCommunication.tsx | Communication |
| `/admin/prospecting` | AdminProspecting.tsx | Prospecting |
| `/admin/prospecting-analytics` | AdminProspectingAnalytics.tsx | Analytics prospecting |
| `/admin/ads` | AdminAds.tsx | Publicité |
| `/admin/analytics-health` | AdminAnalyticsHealth.tsx | Analytics santé |
| `/admin/beta-stats` | AdminBetaStats.tsx | Stats beta |
| `/admin/coffre-fort` | AdminCoffreFort.tsx | Coffre-fort |
| `/admin/email-diagnostics` | AdminEmailDiagnostics.tsx | Diagnostics email |
| `/admin/influenceurs` | AdminInfluenceurs.tsx | Gestion influenceurs |
| `/admin/knowledge` | AdminKnowledge.tsx | Base de connaissances |
| `/admin/mock-profiles` | AdminMockProfiles.tsx | Mock profiles |
| `/admin/roadmap` | AdminRoadmap.tsx | Roadmap |
| `/admin/seo` | AdminSEO.tsx | SEO |

### Routes Spéciales (3 routes)

| Route | Fichier | Description |
|-------|---------|-------------|
| `/launch-partner-paris` | LaunchPartnerParis.tsx | Launch partner Paris |
| `/system-test` | SystemTest.tsx | Tests système |
| `*` | NotFound.tsx | Page 404 |

**Total : 87 routes**

---

## Architecture Backend (Supabase)

### Base de Données PostgreSQL

#### Statistiques
- **80+ tables**
- **Types personnalisés** : 15 enums
- **Fonctions** : 50+ fonctions SQL
- **Triggers** : 20+ triggers
- **RLS Policies** : 300+ policies
- **Indexes** : Optimisés pour performances

#### Tables par Catégorie

**Authentification & Utilisateurs (8 tables)**
- `profiles` - Profils utilisateurs
- `user_roles` - Rôles (enum app_role)
- `user_presence` - Présence en ligne
- `login_attempts` - Tentatives de connexion
- `blocked_users` - Utilisateurs bloqués
- `temporary_credentials` - Credentials temporaires
- `admin_profile_edits` - Logs d'édition admin
- `admin_mock_profiles` - Profils de test

**Messagerie (4 tables)**
- `conversations` - Conversations (direct, group)
- `messages` - Messages
- `conversation_participants` - Participants
- `conversation_archives` - Archives
- `conversation_pins` - Épinglages

**Événements & Bookings (5 tables)**
- `events` - Événements
- `bookings` - Bookings
- `availability_slots` - Disponibilités artistes
- `event_attendees` - Participants événements

**Social (9 tables)**
- `social_posts` - Posts
- `post_interactions` - Likes, commentaires
- `post_media` - Médias attachés
- `communities` - Communautés
- `community_members` - Membres
- `community_channels` - Channels communautés
- `community_messages` - Messages communautés
- `user_follows` - Relations follow

**Annonces (2 tables)**
- `annonces` - Annonces/offres
- `applications` - Candidatures

**Affiliation (4 tables)**
- `influencer_links` - Liens d'affiliation
- `affiliate_visits` - Visites
- `affiliate_conversions` - Conversions
- `recurring_commissions` - Commissions récurrentes

**Reviews (1 table)**
- `reviews` - Évaluations

**Agent/Manager (3 tables)**
- `agent_artists` - Relations agent-artiste
- `manager_artists` - Relations manager-artiste
- `agent_commissions` - Commissions agents

**Musique & Radio (8 tables)**
- `music_releases` - Sorties musicales
- `blockchain_certifications` - Certifications Solana
- `artist_radio_subscriptions` - Abonnements radio
- `radio_playlists` - Playlists radio
- `radio_playlist_tracks` - Pistes de playlist
- `radio_queue` - File d'attente
- `radio_requests` - Requêtes d'auditeurs
- `radio_submissions` - Soumissions artistes

**Publicité (6 tables)**
- `ad_campaigns` - Campagnes
- `ad_slots` - Emplacements
- `ad_assets` - Assets publicitaires
- `ad_campaign_slots` - Association campagne-slot
- `ad_metrics` - Métriques (impressions, clics)
- `ad_settings` - Paramètres globaux

**Prospecting CRM (7 tables)**
- `prospects` - Base de prospects
- `prospect_tasks` - Tâches
- `prospect_assignments` - Assignations
- `vybbi_agents` - Agents Vybbi
- `automation_workflows` - Workflows
- `automation_steps` - Étapes de workflow
- `automation_executions` - Exécutions
- `workflow_tasks` - Tâches de workflow

**Notifications (2 tables)**
- `notifications` - Notifications
- `notification_settings` - Paramètres

**Admin (5 tables)**
- `admin_settings` - Paramètres globaux
- `admin_secrets` - Secrets
- `email_templates` - Templates emails
- `blog_posts` - Articles de blog

**Tokens VYBBI (2 tables)**
- `token_transactions` - Transactions
- `user_token_balances` - Balances

**Analytics (3 tables)**
- `profile_views` - Vues de profils
- `security_audit_log` - Logs d'audit
- `conversion_tracking` - Tracking conversions

**Médias (1 table)**
- `media_assets` - Assets (images, vidéos, audio)

#### Types Personnalisés (Enums)

```sql
CREATE TYPE app_role AS ENUM ('admin', 'artist', 'lieu', 'agent', 'manager', 'influencer', 'partner');

CREATE TYPE profile_type AS ENUM ('artist', 'lieu', 'agent', 'manager', 'influencer', 'partner');

CREATE TYPE event_status AS ENUM ('draft', 'published', 'cancelled', 'completed');

CREATE TYPE booking_status AS ENUM ('pending', 'confirmed', 'cancelled', 'completed');

CREATE TYPE annonce_status AS ENUM ('draft', 'published', 'closed', 'cancelled');

CREATE TYPE application_status AS ENUM ('pending', 'accepted', 'rejected');

CREATE TYPE media_type AS ENUM ('image', 'video', 'audio');

CREATE TYPE conversation_type AS ENUM ('direct', 'group');

CREATE TYPE notification_type AS ENUM ('booking', 'review', 'message', 'agent_request', 'conversion', 'event', 'follow', 'like', 'comment', 'mention');

CREATE TYPE representation_status AS ENUM ('pending', 'accepted', 'rejected');

CREATE TYPE availability_status AS ENUM ('available', 'booked', 'unavailable');

CREATE TYPE conversion_status AS ENUM ('pending', 'confirmed', 'cancelled');
```

#### Fonctions SQL Principales

**Authentification & Sécurité**
- `has_role(user_id, role)` - Vérification de rôle (SECURITY DEFINER)
- `ensure_user_profile()` - Création automatique de profil
- `track_login_attempt()` - Tracking des tentatives de connexion
- `is_user_blocked()` - Vérification de blocage
- `validate_password_strength()` - Validation de mot de passe

**Profils & Privacy**
- `get_public_profile_data()` - Récupération de profil public
- `get_profile_with_privacy()` - Profil avec masquage données sensibles
- `can_access_sensitive_profile_data()` - Vérification d'accès
- `get_safe_profile_columns()` - Colonnes sûres
- `safe_profile_select()` - SELECT sécurisé
- `generate_slug()` - Génération de slug
- `check_slug_availability()` - Vérification disponibilité slug

**Messagerie**
- `start_direct_conversation()` - Démarrage conversation
- `send_admin_message()` - Message admin
- `diagnose_user_messaging()` - Diagnostic messagerie

**Social**
- `get_social_feed()` - Récupération du fil social
- `get_user_follow_stats()` - Stats de suivi

**Prospecting**
- `assign_prospect_to_agent()` - Assignation automatique
- `agent_can_access_prospect()` - Vérification d'accès
- `cleanup_expired_task_locks()` - Nettoyage des locks

**Radio**
- `get_radio_playlist()` - Playlist avec poids et priorités

**Affiliation**
- `track_affiliate_visit()` - Tracking de visite
- `track_affiliate_conversion_with_tokens()` - Conversion + tokens

**Tokens VYBBI**
- `spend_vybbi_tokens()` - Dépense de tokens

**Notifications**
- `create_notification_with_email()` - Notification + email
- `cleanup_old_notifications()` - Nettoyage automatique

**Audit & Sécurité**
- `log_security_event()` - Log d'événement sécurité
- `log_sensitive_access()` - Log d'accès sensible
- `audit_profile_access()` - Audit d'accès profil
- `audit_prospect_access()` - Audit d'accès prospect
- `check_security_integrity()` - Vérification d'intégrité

**Admin**
- `get_admin_emails()` - Récupération emails admin
- `security_phase1_status()` - Statut sécurisation

**Communautés**
- `is_community_member()` - Vérification de membership
- `update_community_member_count()` - Mise à jour compteur

**Online Users**
- `get_online_users()` - Utilisateurs en ligne

**Cleanup**
- `cleanup_expired_temp_credentials()` - Nettoyage credentials
- `cleanup_old_login_attempts()` - Nettoyage tentatives login

#### Triggers Principaux

- `update_profile_completion` - Calcul auto complétion profil
- `enforce_messaging_policy` - Application politique messagerie
- `notify_agent_request` - Notification demande de représentation
- `prevent_pii_access` - Protection données sensibles
- `audit_sensitive_profile_access` - Audit accès sensible
- `update_community_member_count` - Mise à jour compteurs

---

### Edge Functions (30 fonctions)

**Emails & Notifications (8 fonctions)**
1. `send-notification` - Envoi emails via templates internes ou Brevo
2. `auth-email-sender` - Emails d'authentification
3. `send-system-notification` - Notifications système
4. `gmail-send-email` - Envoi via Gmail
5. `auto-notifications` - Notifications automatiques
6. `send-venue-claim-email` - Email revendication lieu
7. `send-representation-invitation` - Invitation représentation
8. `send-influencer-welcome-email` - Bienvenue influenceur

**Traduction & Contenu (1 fonction)**
9. `translate-text` - Traduction automatique

**Analytics (1 fonction)**
10. `ga4-fetch-data` - Google Analytics 4

**Maps (1 fonction)**
11. `get-mapbox-token` - Token Mapbox sécurisé

**Blockchain & Tokens (3 fonctions)**
12. `blockchain-certify` - Certification Solana
13. `create-token-payment` - Création paiement tokens
14. `verify-token-payment` - Vérification paiement

**Commissions (1 fonction)**
15. `calculate-monthly-commissions` - Calcul commissions mensuelles

**Venues (2 fonctions)**
16. `claim-venue-profile` - Revendication de lieu
17. `admin-create-venue-profile` - Création lieu par admin

**Prospecting (3 fonctions)**
18. `whatsapp-sender` - Envoi WhatsApp
19. `prospect-webhooks` - Webhooks prospection
20. `send-prospecting-email` - Emails prospection

**Workflows (1 fonction)**
21. `process-workflow-tasks` - Traitement tâches workflow

**IA (2 fonctions)**
22. `vybbi-ai` - IA conversationnelle
23. `dual-ai-chat` - Chat dual IA

**Génération (1 fonction)**
24. `generate-ai-avatar` - Avatar IA

**Spotify (1 fonction)**
25. `spotify-metadata` - Métadonnées Spotify

**Admin (2 fonctions)**
26. `admin-confirm-user` - Confirmation utilisateur
27. `setup-auth-hook` - Configuration auth hook

**Trials (1 fonction)**
28. `update-trial-offer` - Mise à jour offre d'essai

---

## État et Data Management

### React Query
- **Caching** : Stratégies de cache configurables
- **Stale time** : 5-15 minutes selon les données
- **GC time** : 10 minutes
- **Retry logic** : Pas de retry sur erreurs 4xx
- **Queries optimisées** : `useOptimizedQueries`, `useOptimizedProfileData`
- **Prefetching** : `usePrefetchProfile`

### Supabase Realtime
- **Souscriptions** : Temps réel sur tables critiques
- **Notifications** : `RealtimeNotificationProvider`
- **Messages** : Mise à jour instantanée
- **Présence** : Online users
- **Typing indicators** : Indicateurs de frappe

### Context API
- **I18n** : `I18nProvider` pour traduction
- **Auth** : Contexte d'authentification (via useAuth)
- **Offline Sync** : `OfflineSyncProvider` pour prospecting

### Local Storage
- **Affiliate tracking** : Session tracking
- **Preferences** : Préférences utilisateur
- **Cache** : Données temporaires

---

## Dépendances Clés

### Production (85 packages)

**Core**
- `react` 18.3.1
- `react-dom` 18.3.1
- `typescript` 5.8.3

**Build & Dev**
- `vite` 5.4.19
- `@vitejs/plugin-react` 4.3.4
- `vite-plugin-pwa` 1.0.3

**Routing**
- `react-router-dom` 6.30.1

**Backend**
- `@supabase/supabase-js` 2.57.2

**State Management**
- `@tanstack/react-query` 5.83.0
- `@tanstack/react-query-devtools` 5.87.4

**Forms**
- `react-hook-form` 7.61.1
- `zod` 3.25.76
- `@hookform/resolvers` 3.10.0

**UI Framework**
- `tailwindcss` 3.4.17
- `tailwind-merge` 2.6.0
- `tailwindcss-animate` 1.0.7
- `class-variance-authority` 0.7.1
- `clsx` 2.1.1

**UI Components (Radix UI - 25 packages)**
- `@radix-ui/react-accordion` 1.2.11
- `@radix-ui/react-alert-dialog` 1.1.14
- `@radix-ui/react-avatar` 1.1.10
- `@radix-ui/react-checkbox` 1.3.2
- `@radix-ui/react-dialog` 1.1.14
- `@radix-ui/react-dropdown-menu` 2.1.15
- `@radix-ui/react-popover` 1.1.14
- `@radix-ui/react-select` 2.2.5
- `@radix-ui/react-slider` 1.3.5
- `@radix-ui/react-switch` 1.2.5
- `@radix-ui/react-tabs` 1.1.12
- `@radix-ui/react-toast` 1.2.14
- `@radix-ui/react-tooltip` 1.2.7
- [... et 12 autres packages Radix]

**Blockchain & Web3**
- `@solana/web3.js` 1.98.4
- `@solana/wallet-adapter-base` 0.9.27
- `@solana/wallet-adapter-phantom` 0.9.28
- `@solana/wallet-adapter-react` 0.15.39
- `@solana/wallet-adapter-react-ui` 0.9.39
- `buffer` 6.0.3

**Maps**
- `mapbox-gl` 3.15.0
- `@types/mapbox-gl` 3.4.1

**Charts**
- `recharts` 2.15.4

**Drag & Drop**
- `react-beautiful-dnd` 13.1.1
- `@types/react-beautiful-dnd` 13.1.8

**Date & Time**
- `date-fns` 4.1.0
- `react-day-picker` 8.10.1

**Carousel**
- `embla-carousel-react` 8.6.0

**QR Codes**
- `qrcode` 1.5.3
- `@types/qrcode` 1.5.5
- `react-qr-code` 2.0.15

**Modals & Sheets**
- `vaul` 0.9.9

**Command Palette**
- `cmdk` 1.1.1

**Code Editor**
- `@monaco-editor/react` 4.7.0

**OTP Input**
- `input-otp` 1.4.2

**Toasts**
- `sonner` 1.7.4

**Helmet (SEO)**
- `react-helmet-async` 2.0.5

**Theme**
- `next-themes` 0.3.0

**Icons**
- `lucide-react` 0.462.0

**Utilities**
- `lovable-tagger` 1.1.10
- `react-resizable-panels` 2.1.9
- `rollup` 4.52.4

---

## Configuration Build

### Vite Config (`vite.config.ts`)

```typescript
export default defineConfig(({ mode }) => {
  const base = process.env.VITE_BASE ?? '/';
  return {
    server: {
      host: true,
      port: 8080,
    },
    plugins: [
      react(),
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: ['favicon.ico', 'vybbi-logo.png', 'vybbi-logo-pwa.png'],
        manifest: {
          name: 'Vybbi',
          short_name: 'Vybbi',
          description: 'Plateforme de networking pour l\'industrie musicale',
          theme_color: '#000000',
          icons: [...]
        },
        workbox: {
          globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
          runtimeCaching: [...]
        }
      })
    ],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    build: {
      rollupOptions: {
        output: {
          manualChunks: {
            'radix': [...],
            'tanstack': ['@tanstack/react-query'],
            'supabase': ['@supabase/supabase-js'],
            'react': ['react', 'react-dom'],
            'router': ['react-router-dom']
          }
        }
      }
    }
  }
});
```

### Tailwind Config (`tailwind.config.ts`)

```typescript
export default {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // Semantic colors from index.css
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        // ... autres couleurs
      },
      fontFamily: {
        vybbi: ['Vybbi Display', 'sans-serif'],
      },
      animation: {
        // ... animations
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}
```

### TypeScript Config

**tsconfig.json** (base)
```json
{
  "files": [],
  "references": [
    { "path": "./tsconfig.app.json" },
    { "path": "./tsconfig.node.json" }
  ]
}
```

**tsconfig.app.json** (application)
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "isolatedModules": true,
    "moduleDetection": "force",
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["src"]
}
```

---

## Patterns d'Architecture

### Component-Driven Architecture
- Composants réutilisables et modulaires
- Props typés avec TypeScript
- Variants avec `class-variance-authority`
- Composition over inheritance

### Feature-Based Structure
- Dossier `features/` avec routes par feature
- Colocation des ressources (components, hooks, types)
- Lazy loading des routes

### Custom Hooks Pattern
- 45+ hooks personnalisés
- Logique métier extraite des composants
- Hooks réutilisables pour services (auth, API, realtime)

### Server State vs Client State
- **Server state** : React Query + Supabase
- **Client state** : Context API + useState
- **Realtime state** : Supabase Realtime subscriptions

### Lazy Loading & Code Splitting
- Routes lazy loadées avec `React.lazy()`
- Code splitting par feature via Vite
- Chunks manuels pour vendor libs (radix, tanstack, supabase)

### Design System
- Tokens sémantiques dans `index.css`
- Thème HSL uniquement (pas de couleurs directes)
- **Dark mode OBLIGATOIRE** (pas de backgrounds blancs)
- Composants UI réutilisables (shadcn-ui)

---

## Sécurité

### Row Level Security (RLS)
- **RLS activé** sur toutes les tables
- **300+ policies** détaillées par rôle
- Fonction `has_role()` SECURITY DEFINER
- Bypass RLS avec fonctions SECURITY DEFINER

### Fonction Centrale de Sécurité

```sql
CREATE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;
```

### Protection des Données Sensibles
- Colonnes sensibles : `email`, `phone`, `siret_number`
- Fonction `get_safe_profile_columns()` pour sélection sûre
- Trigger `prevent_pii_access()` pour masquage
- Fonction `can_access_sensitive_profile_data()` pour vérification

### Audit Logging
- Table `security_audit_log`
- Logs d'accès aux données sensibles
- Fonction `log_security_event()`
- Fonction `check_security_integrity()`

### Anti-Bruteforce
- Table `login_attempts`
- Blocage temporaire après échecs
- Fonction `track_login_attempt()`
- Fonction `is_user_blocked()`

### Validation Côté Serveur
- Aucune vérification de rôle côté client
- Pas de localStorage/sessionStorage pour auth
- Tokens JWT gérés par Supabase Auth

---

## Performance

### Optimisations Frontend
- **Code splitting** : Chunks par feature
- **Lazy loading** : Routes et composants
- **React Query caching** : 5-15 min stale time
- **Image optimization** : `imageOptimization.ts`
- **Debouncing** : `useDebounce` pour recherches

### Optimisations Backend
- **Indexes** : Sur colonnes fréquemment requêtées
- **Functions** : SECURITY DEFINER pour éviter RLS overhead
- **Realtime** : Souscriptions ciblées uniquement
- **Cleanup** : Jobs automatiques de nettoyage

### PWA & Caching
- **Service Worker** : Workbox strategies
- **Cache First** : Assets statiques
- **Network First** : API calls
- **Offline support** : Cache critical data

### Mobile Optimizations
- **Responsive images** : Sizes et srcset
- **Touch optimizations** : Tap target sizes
- **Safe areas** : Gestion iOS notch
- **Lazy load analytics** : `LazyLoadAnalytics`

---

## Deployment

### Stratégie de Déploiement
- **Platform** : Lovable Cloud
- **CI/CD** : Auto-deploy via GitHub integration
- **Base path** : Dynamique via `VITE_BASE` env var
- **Env vars** : `.env` pour local, Lovable dashboard pour prod

### Variables d'Environnement

**Local (.env)**
```
VITE_SUPABASE_URL=https://fepxacqrrjvnvpgzwhyr.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOi...
VITE_BASE=/
```

**Production**
- Configurées via Lovable dashboard
- Pas de VITE_* dans edge functions (utiliser project refs directes)

### Build
```bash
npm run build    # Vite build
npm run preview  # Preview prod build
```

### PWA
- Manifest auto-généré
- Service Worker enregistré automatiquement
- Update prompt intégré (`PWAUpdateNotification`)

---

## Monitoring & Analytics

### Google Analytics 4
- **ID** : G-K1LQ1MVX3R
- **Tracking** : Pages vues automatiques
- **Événements** : Custom events
- **Edge Function** : ga4-fetch-data pour stats admin

### Internal Analytics
- **Profile views** : Tracking visiteurs
- **Security audit log** : Actions sensibles
- **Conversion tracking** : Affiliation + prospects
- **Radio stats** : Écoutes, requêtes, soumissions

### Health Monitoring
- `SystemHealthCard` - Statut système
- `VybbiMonitoring` - Monitoring Vybbi
- `check_security_integrity()` - Vérification RLS

---

## Documentation Technique

### Fichiers de Documentation
- `README.md` - Installation et overview
- `KNOWLEDGE_BASE.md` - Base de connaissances complète
- `EMAIL_SYSTEM_GUIDE.md` - Système d'emails
- `MIGRATION_LOCAL.md` - Migrations locales
- `fonctionnalites.md` - Liste des fonctionnalités (ce fichier)
- `architecture.md` - Architecture (ce fichier)

### Commentaires de Code
- JSDoc pour fonctions complexes
- Commentaires inline pour logique métier
- Types TypeScript documentés

---

## Roadmap Technique

### Implémenté ✅
- ✅ RLS sur toutes tables
- ✅ Fonction `has_role()` sécurisée
- ✅ Audit logs
- ✅ PWA avec Service Worker
- ✅ React Query caching
- ✅ Supabase Realtime
- ✅ Blockchain certifications
- ✅ CRM complet
- ✅ Programme d'affiliation
- ✅ Radio intégrée

### En Cours ⏳
- ⏳ Intégration Stripe
- ⏳ Notifications push
- ⏳ Tests E2E
- ⏳ i18n complet

### Prévu 📅
- 📅 Mobile apps natives (React Native)
- 📅 API publique
- 📅 Webhooks externes
- 📅 Analytics avancées
- 📅 A/B testing framework

---

## Changelog Architectural

### Version 1.0.0-beta (2025-10-18)
- **Phase 1 Sécurisation** : RLS activé sur toutes les tables
- **Architecture modulaire** : Features-based structure
- **PWA** : Installation et offline support
- **Blockchain** : Certification Solana
- **CRM Prospecting** : Système complet
- **Programme Affiliation** : Tracking et commissions
- **Radio Vybbi** : Player et gestion playlists
- **Tokens VYBBI** : Système de tokens internes

---

*Document généré le 2025-10-18*
*Version de l'application : 1.0.0-beta*
