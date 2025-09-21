# Base de Connaissance - Vybbi

## 📋 Informations Générales

### Stack Technique
- **Framework**: Vite 5 + React 18 + TypeScript
- **UI**: Tailwind CSS + shadcn-ui + Radix UI
- **Backend**: Supabase (JS v2) + Edge Functions
- **Email**: Brevo (API v3) pour l'envoi d'emails
- **Routing**: React Router
- **State Management**: React Query (TanStack Query)
- **Dev Server**: Port 8080 avec accès LAN (::)

### Configuration Environnement
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_key
```

## 🏗️ Architecture du Projet

### Structure des Dossiers
```
src/
├── components/          # Composants React réutilisables
│   ├── admin/          # Interface d'administration
│   ├── ui/             # Composants UI de base (shadcn)
│   └── ...
├── pages/              # Pages de l'application
├── hooks/              # Hooks personnalisés
├── integrations/       # Intégrations externes
│   └── supabase/       # Client et types Supabase
├── lib/                # Utilitaires et services
└── utils/              # Fonctions utilitaires

supabase/
├── functions/          # Edge Functions Supabase
├── migrations/         # Migrations de base de données
└── config.toml         # Configuration Supabase
```

## 📧 Système de Notifications Email

### Architecture Email
Le système email utilise un modèle hybride avec deux providers :

1. **Templates Internes** : HTML stocké en base de données
2. **Templates Brevo** : Templates gérés dans l'interface Brevo

### Edge Functions Email

#### `send-notification`
**Fonction principale** pour l'envoi d'emails avec détection automatique du provider.

**Paramètres :**
```typescript
{
  type: string;           // Type de template (user_registration, admin_notification, etc.)
  to: string;            // Email destinataire
  cc?: string | string[]; // Copie
  bcc?: string | string[]; // Copie cachée
  data?: Record<string, unknown>; // Variables pour le template
  subject?: string;       // Sujet personnalisé (optionnel)
  html?: string;         // HTML personnalisé (optionnel)
  isTest?: boolean;      // Mode test
}
```

**Logique de fonctionnement :**
1. Si `subject` + `html` fournis → Envoi direct
2. Sinon, récupération du template en base par `type`
3. Si `provider = 'brevo'` → Envoi via template Brevo
4. Sinon → Envoi HTML via API Brevo

#### Autres Functions Email
- `send-system-notification` : Templates système inline
- `brevo-templates` : Liste les templates Brevo
- `brevo-send-template` : Envoi direct par ID Brevo
- `send-prospecting-email` : Emails de prospection
- `auth-email-sender` : Emails d'authentification

### Base de Données - Table `email_templates`

```sql
CREATE TABLE email_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  subject TEXT NOT NULL,
  html_content TEXT NOT NULL,
  type TEXT NOT NULL,
  category TEXT DEFAULT 'notifications',
  language TEXT DEFAULT 'fr',
  is_active BOOLEAN DEFAULT true,
  variables JSONB,
  provider TEXT DEFAULT 'internal' CHECK (provider IN ('internal', 'brevo')),
  brevo_template_id INTEGER,
  required_variables JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by TEXT
);
```

### Interface d'Administration

#### EmailTemplateManager (`src/components/admin/EmailTemplateManager.tsx`)

**Fonctionnalités :**
- Liste et filtrage des templates par catégorie/langue
- Création/édition de templates
- Sélection du provider (internal/brevo)
- Éditeur HTML drag-and-drop pour templates internes
- Sélection de templates Brevo pour provider externe
- Test d'envoi d'emails
- Validation du système email

**Onglets disponibles :**
- **Liste** : Vue d'ensemble des templates
- **Constructeur** : Éditeur drag-and-drop
- **Design** : Configuration globale du design
- **Éditeur HTML** : Édition code HTML
- **Éditeur Visuel** : Interface visuelle
- **Test** : Envoi d'emails de test
- **Validation** : Vérification du système

## 🔐 Sécurité et Configuration

### Variables d'Environnement
- Client Supabase utilise `import.meta.env.VITE_*`
- Edge Functions utilisent `Deno.env.get()`
- Clés API Brevo stockées côté serveur uniquement

### Authentification
- Stockage dans localStorage
- Sessions persistantes
- Refresh automatique des tokens

## 🚀 Déploiement et Développement

### Commandes de Développement
```bash
npm install           # Installation des dépendances
npm run dev          # Serveur de développement (port 8080)
npm run build        # Build de production
npm run lint         # Vérification ESLint
```

### Migrations Supabase
```bash
cd supabase
npx supabase db push  # Appliquer les migrations
npx supabase gen types typescript --local > ../src/integrations/supabase/types.ts
```

## 📝 Types de Templates Email

### Types Prédéfinis
- `user_registration` : Bienvenue utilisateur
- `admin_notification` : Notification admin
- `review_notification` : Notification avis
- `booking_confirmation` : Confirmation réservation
- `welcome` : Message de bienvenue
- `password_reset` : Réinitialisation mot de passe
- `newsletter` : Newsletter
- `promotional` : Email promotionnel
- `system` : Email système

### Variables Courantes
```typescript
{
  userName: string;      // Nom de l'utilisateur
  userEmail: string;     // Email utilisateur
  profileType: string;   // Type de profil
  artistName: string;    // Nom de l'artiste
  reviewerName: string;  // Nom du reviewer
  rating: number;        // Note donnée
  message: string;       // Message/commentaire
}
```

## 🐛 Debugging et Logs

### Edge Functions
- Logs visibles dans Supabase Dashboard
- Console.log pour debugging local
- Gestion d'erreurs avec try/catch

### Client
- React DevTools pour le state
- Network tab pour les requêtes Supabase
- Console pour les erreurs TypeScript

## 🔄 Flux de Données

### Envoi d'Email Typique
1. **Client** → Appel `supabase.functions.invoke('send-notification')`
2. **Edge Function** → Récupération template en base
3. **Provider Check** → Brevo template ou HTML raw ?
4. **API Brevo** → Envoi effectif
5. **Response** → Confirmation avec messageId

### Gestion des Templates
1. **Admin UI** → CRUD des templates
2. **Base de données** → Stockage avec provider info
3. **Edge Function** → Lecture et utilisation
4. **Cache** → React Query pour les performances

## 📚 Ressources Utiles

### Documentation
- [Supabase Docs](https://supabase.com/docs)
- [Brevo API](https://developers.brevo.com/)
- [shadcn-ui](https://ui.shadcn.com/)
- [Vite](https://vitejs.dev/)

### Endpoints Importants
- Dev Server : `http://localhost:8080`
- Supabase : Configuration dans `.env`
- Brevo API : `https://api.brevo.com/v3/`

## 💰 Système d'Affiliation

### Architecture du Système d'Affiliation
Le système d'affiliation Vybbi permet aux influenceurs de générer des revenus en recommandant la plateforme.

#### Tables de Base de Données
- `influencer_links` : Liens d'affiliation personnalisés
- `affiliate_visits` : Suivi des visites sur les liens
- `affiliate_conversions` : Conversions et commissions
- `recurring_commissions` : Commissions mensuelles récurrentes

#### Modèle de Commission
- **Commission One-Shot** : 2€ par inscription réussie
- **Commission Récurrente** : 0,50€ par mois par utilisateur actif
- **Exclusivité** : Programme exclusif jusqu'au 31 janvier 2026
- **Potentiel Maximum** : Jusqu'à 7000€/an pour les top performers

#### Processus d'Inscription Influenceur
1. **SIRET Obligatoire** : Numéro SIRET valide requis pour la conformité légale française
2. **Génération de Liens** : Liens de parrainage uniques automatiquement générés
3. **Suivi Transparent** : Dashboard en temps réel avec analytics détaillées
4. **Paiements Mensuels** : Commissions versées chaque mois

#### Edge Function `calculate-monthly-commissions`
Fonction automatique qui :
- Calcule les commissions récurrentes mensuelles
- Met à jour les statuts de paiement
- Génère les rapports de commissions
- Envoie les notifications de paiement

#### Dashboard et Analytics
- **Métriques en Temps Réel** : Clics, conversions, revenus
- **Calculateur de Revenus** : Projection des gains potentiels
- **Suivi des Liens** : Performance de chaque lien d'affiliation
- **Historique des Paiements** : Transparence totale des commissions

#### Conformité Légale
- **SIRET Obligatoire** : Conforme à la législation française
- **Contrat d'Affiliation** : Cadre juridique clair
- **Facturation Automatique** : Génération des factures pour les commissions
- **Déclaration Fiscale** : Support pour les obligations fiscales

---

*Dernière mise à jour : 15 septembre 2025*

#### Modèle de Commission
- **Commission One-Shot** : 2€ par inscription réussie
- **Revenus Récurrents** : 0,50€/mois par utilisateur actif (exclusif jusqu'au 31/01/2026)
- **Potentiel Maximum** : Jusqu'à 7000€/an pour les top performers

#### Tables Base de Données

**`influencer_links`**
```sql
CREATE TABLE influencer_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  influencer_profile_id UUID NOT NULL REFERENCES profiles(id),
  name TEXT,
  description TEXT,
  code TEXT NOT NULL UNIQUE,
  clicks_count INTEGER DEFAULT 0,
  conversions_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**`affiliate_visits`**
```sql
CREATE TABLE affiliate_visits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  link_id UUID NOT NULL REFERENCES influencer_links(id),
  session_id UUID DEFAULT gen_random_uuid(),
  visitor_ip INET,
  visited_at TIMESTAMPTZ DEFAULT NOW(),
  user_agent TEXT,
  referrer TEXT,
  page_url TEXT,
  country TEXT,
  city TEXT
);
```

**`affiliate_conversions`**
```sql
CREATE TABLE affiliate_conversions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  link_id UUID NOT NULL REFERENCES influencer_links(id),
  visit_id UUID REFERENCES affiliate_visits(id),
  user_id UUID REFERENCES auth.users(id),
  conversion_type TEXT NOT NULL,
  conversion_value NUMERIC,
  commission_amount NUMERIC,
  commission_rate NUMERIC DEFAULT 0.05,
  monthly_commission_amount NUMERIC DEFAULT 0.50,
  is_recurring BOOLEAN DEFAULT false,
  is_exclusive_program BOOLEAN DEFAULT false,
  converted_at TIMESTAMPTZ DEFAULT NOW(),
  confirmed_at TIMESTAMPTZ,
  paid_at TIMESTAMPTZ,
  conversion_status TEXT DEFAULT 'pending',
  recurring_start_date DATE,
  recurring_end_date DATE
);
```

**`recurring_commissions`**
```sql
CREATE TABLE recurring_commissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  influencer_profile_id UUID NOT NULL REFERENCES profiles(id),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  conversion_id UUID NOT NULL REFERENCES affiliate_conversions(id),
  month_year TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  is_exclusive_program BOOLEAN DEFAULT false,
  status TEXT DEFAULT 'pending',
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### Edge Functions

**`calculate-monthly-commissions`**
Fonction automatisée pour calculer les commissions récurrentes mensuelles :
- Vérifie les conversions confirmées
- Contrôle l'activité des utilisateurs
- Applique les taux différenciés (exclusif vs standard)
- Crée les enregistrements de commissions mensuelles

#### Fonctionnalités UI

**Page Influenceurs (`/influenceurs`)**
- Landing page dédiée avec calculateur de revenus
- Arguments marketing et témoignages
- Call-to-action pour inscription
- Exclusivité temporelle mise en avant

**Champ SIRET Obligatoire**
- Composant `SiretField` pour validation légale française
- Obligatoire pour l'inscription influenceur
- Conformité fiscale et déclarative

**Dashboard Influenceur**
- Suivi des liens et performances
- Analytics en temps réel
- Gestion des commissions
- Historique des paiements

### Sécurité et Conformité

#### Row Level Security (RLS)
- Influenceurs : accès uniquement à leurs propres liens et conversions
- Admins : accès complet pour gestion et monitoring
- Visiteurs : insertion autorisée pour le tracking

#### Obligations Légales
- SIRET obligatoire pour les commissions (conformité française)
- Cotisations sociales selon le statut
- Déclaration fiscale des revenus d'affiliation

### Exclusivité Temporaire
Le programme avec commissions récurrentes de 0,50€/mois est **exclusif jusqu'au 31 janvier 2026**. Après cette date, les nouveaux influenceurs auront des conditions moins avantageuses.

## 🔗 Certification Blockchain des Œuvres Musicales

### Architecture Technique Solana

Le système de certification blockchain de Vybbi utilise la blockchain **Solana** pour garantir l'immutabilité et la vérifiabilité des créations musicales.

#### Processus de Certification

1. **Génération du Hash** : Création d'un hash SHA-256 unique basé sur :
   - ID de la release musicale
   - Métadonnées (titre, artiste, ISRC, collaborateurs)
   - Timestamp de certification
   - Identifiant plateforme Vybbi

2. **Transaction Blockchain** : 
   - Stockage du hash sur Solana
   - Génération d'une signature cryptographique
   - Attribution d'un block number
   - Transaction hash unique

3. **Génération QR Code** :
   - URL de vérification publique
   - Données base64 du QR code
   - Stockage des assets de vérification

#### Structure des Données Certifiées

```json
{
  "title": "Nom de la release",
  "artist": "Nom de l'artiste", 
  "isrc": "Code ISRC si disponible",
  "collaborators": ["Liste des collaborateurs"],
  "audioHash": "Hash optionnel du fichier audio",
  "releaseDate": "Date de sortie",
  "platformId": "vybbi",
  "certificationTimestamp": "ISO timestamp"
}
```

### Edge Function `blockchain-certify`

**Endpoint** : `/functions/v1/blockchain-certify`

**Authentification** : Publique (JWT désactivé pour performance)

**Fonctionnalités** :
- Validation des données de certification
- Génération du hash unique de certification
- Simulation transaction Solana (prêt pour intégration réelle)
- Stockage en base de données Supabase
- Génération QR code de vérification
- URLs de certificat et vérification

**Paramètres d'entrée** :
```typescript
{
  musicReleaseId: string;
  metadata: {
    title: string;
    artist: string;
    isrc?: string;
    collaborators?: string[];
    audioHash?: string;
  }
}
```

**Réponse** :
```typescript
{
  success: boolean;
  certification?: {
    id: string;
    certificationHash: string;
    transactionHash: string;
    blockNumber: number;
    qrCodeUrl: string;
    certificateUrl: string;
    verificationUrl: string;
  }
}
```

### Base de Données - Table `blockchain_certifications`

```sql
CREATE TABLE blockchain_certifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  music_release_id UUID NOT NULL REFERENCES music_releases(id),
  certification_hash TEXT NOT NULL UNIQUE,
  blockchain_network TEXT NOT NULL DEFAULT 'solana',
  transaction_hash TEXT NOT NULL,
  solana_signature TEXT,
  block_number BIGINT,
  certification_data JSONB NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  qr_code_url TEXT,
  certificate_url TEXT,
  certified_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Interfaces Utilisateur

#### `BlockchainCertifyButton`
- Bouton de certification pour les artistes
- États : disponible, en cours, certifié
- Validation des permissions utilisateur
- Gestion des erreurs et feedback

#### `BlockchainCertificationBadge`
- Badge visuel sur les releases certifiées
- Clic pour afficher les détails de certification
- Informations : réseau, block, hash, URLs

#### `BlockchainQRCode`
- Composant QR code pour vérification
- Génération dynamique depuis URL
- Options : téléchargement PNG, copie URL
- Responsive et accessible

### Hooks React

#### `useBlockchainCertification(musicReleaseId)`
- Gestion état certification d'une release
- Mutation pour créer nouvelle certification
- States : `isCertified`, `isCreating`, `certification`
- Notifications toast automatiques

#### `useProfileCertifications(profileId)`
- Liste certifications confirmées d'un profil
- Jointure avec données releases
- Optimisé avec React Query
- Pagination et filtrage

### Sécurité et Vérification

#### Row Level Security (RLS)
- **Artists** : Peuvent certifier leurs propres releases
- **Public** : Peut voir les certifications confirmées uniquement
- **System** : Peut mettre à jour les statuts de certification

#### Vérification Publique
- URL de vérification universelle
- Validation hash blockchain
- Métadonnées immutables
- Historique transparent

### Intégration UI/UX

#### Pages Concernées
- **Profile Artiste** : Affichage badges certifications
- **Music Release Widget** : Bouton certification
- **Productions Slider** : Badges visuels
- **Dashboard Admin** : Gestion système blockchain

#### États Visuels
- 🔒 **Certifié** : Badge vert avec shield
- ⏳ **En cours** : Spinner + message
- 📋 **Disponible** : Bouton call-to-action
- ❌ **Erreur** : Message d'erreur explicite

### Roadmap Blockchain

#### ✅ Implémenté (Septembre 2024)
- Certification manuelle sur Solana
- QR codes de vérification
- Badges visuels
- Interface utilisateur complète

#### 🚧 En cours
- Vérification publique via URL
- Intégration portefeuilles crypto
- Notifications push certifications

#### 📋 Planifié
- Certification automatique releases
- Royalties blockchain
- Marketplace NFT intégré
- Multi-blockchain support

### Performance et Optimisation

#### Cache et Storage
- React Query pour cache UI
- Supabase storage pour QR codes
- CDN pour assets de certification
- Optimisation images et JSON

#### Monitoring
- Logs certification temps réel
- Métriques adoption blockchain
- Alertes échecs transactions
- Analytics usage QR codes

---

*Dernière mise à jour : 21 septembre 2025*
