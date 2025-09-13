# Vybbi 🎵

**The Future of Music Industry Networking**

Plateforme de mise en relation entre artistes et lieux de spectacle, permettant la gestion d'événements, de bookings et de communications professionnelles.

## 🚀 Installation et Développement

### Prérequis
- Node.js 18+
- npm ou bun
- Compte Supabase
- Compte Brevo (pour les emails)

### Configuration
1. **Variables d'environnement**
```bash
cp .env.example .env
# Configurer VITE_SUPABASE_URL et VITE_SUPABASE_PUBLISHABLE_KEY
```

2. **Installation des dépendances**
```bash
npm install
```

3. **Démarrage en local**
```bash
npm run dev
# Application disponible sur http://localhost:8080
```

## 📧 Système Email

### Configuration Brevo
Le système email utilise Brevo avec deux modes :
- **Templates internes** : HTML éditable dans l'admin
- **Templates Brevo** : Templates gérés dans Brevo

### Variables Edge Functions
```env
BREVO_API_KEY=your_brevo_api_key
SUPABASE_URL=your_supabase_url  
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### Utilisation
```typescript
// Envoi d'email via edge function
await supabase.functions.invoke('send-notification', {
  body: {
    type: 'user_registration',
    to: 'user@example.com',
    data: { userName: 'John', userEmail: 'user@example.com' }
  }
});
```

## 🏗️ Architecture

### Stack Technique
- **Frontend** : Vite 5 + React 18 + TypeScript
- **UI** : Tailwind CSS + shadcn-ui + Radix UI  
- **Backend** : Supabase + Edge Functions
- **Email** : Brevo API v3
- **State** : React Query (TanStack Query)

### Structure du Projet
```
src/
├── components/          # Composants React réutilisables
│   ├── admin/          # Interface d'administration  
│   ├── ui/             # Composants UI de base
├── pages/              # Pages de l'application
├── hooks/              # Hooks personnalisés
├── integrations/       # Intégrations externes (Supabase)
├── lib/                # Utilitaires et services
└── utils/              # Fonctions utilitaires

supabase/
├── functions/          # Edge Functions
├── migrations/         # Migrations de base de données
└── config.toml         # Configuration Supabase
```

## 📚 Documentation

- **[Base de Connaissance](./KNOWLEDGE_BASE.md)** - Architecture complète
- **[Guide Email](./EMAIL_SYSTEM_GUIDE.md)** - Système email détaillé  
- **[Changelog](./CHANGELOG.md)** - Historique des modifications

## 🛠️ Commandes Utiles

```bash
# Développement
npm run dev              # Serveur de développement
npm run build           # Build de production
npm run lint            # Vérification ESLint

# Supabase
cd supabase
npx supabase db push    # Appliquer migrations
npx supabase gen types typescript --local > ../src/integrations/supabase/types.ts
```

## 🎯 Fonctionnalités Principales

- **Gestion des profils** : Artistes, lieux, agents
- **Événements et bookings** : Création et gestion
- **Système de reviews** : Évaluations entre professionnels
- **Messagerie** : Communication intégrée
- **Notifications email** : Templates modifiables via admin
- **Interface admin** : Gestion complète de la plateforme

## 📱 Pages Principales

- `/` - Page d'accueil
- `/dashboard` - Tableau de bord utilisateur
- `/events` - Gestion des événements
- `/messages` - Messagerie
- `/admin` - Interface d'administration
---

**Dernière mise à jour** : 13 septembre 2025

## Projet Lovable

**URL**: https://lovable.dev/projects/1e644dba-bb62-4be6-913f-de2fb7f78a11

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/1e644dba-bb62-4be6-913f-de2fb7f78a11) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/tips-tricks/custom-domain#step-by-step-guide)
