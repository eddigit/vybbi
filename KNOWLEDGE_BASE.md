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

---

*Dernière mise à jour : 13 septembre 2025*
