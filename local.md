# Vybbi - Documentation Développement Local

Guide complet pour configurer et développer le projet Vybbi en local avec VSCode.

## 📋 Prérequis Système

### Logiciels Obligatoires

- **Node.js** : Version 18+ ([nodejs.org](https://nodejs.org/))
- **npm, yarn ou bun** : Gestionnaire de paquets (npm inclus avec Node.js)
- **Git** : Pour le versioning ([git-scm.com](https://git-scm.com/))
- **VSCode** : Éditeur recommandé ([code.visualstudio.com](https://code.visualstudio.com/))

### Extensions VSCode Recommandées

```bash
# Extensions essentielles à installer
code --install-extension bradlc.vscode-tailwindcss
code --install-extension ms-vscode.vscode-typescript-next
code --install-extension esbenp.prettier-vscode
code --install-extension formulahendry.auto-rename-tag
code --install-extension christian-kohler.path-intellisense
code --install-extension ms-vscode.vscode-json
```

### Comptes et Services Externes

1. **Supabase** : Base de données et authentification
   - Compte sur [supabase.com](https://supabase.com/)
   - Projet créé avec ID : `fepxacqrrjvnvpgzwhyr`

2. **Gmail** (pour l'envoi d'emails) :
   - Compte Gmail avec App Password configuré
   - Authentification à 2 facteurs activée

3. **Brevo** (optionnel, pour emails marketing) :
   - Compte sur [brevo.com](https://brevo.com/)
   - Clé API Brevo

4. **OpenAI** (pour l'assistant Vybbi) :
   - Compte OpenAI avec clé API

## 🚀 Installation et Configuration

### 1. Cloner le Projet

```bash
# Cloner depuis GitHub (si connecté)
git clone https://github.com/votre-compte/vybbi.git
cd vybbi

# OU depuis Lovable (export manuel)
# Télécharger le zip depuis Lovable et extraire
```

### 2. Installation des Dépendances

```bash
# Avec npm (recommandé)
npm install

# OU avec yarn
yarn install

# OU avec bun (plus rapide)
bun install
```

### 3. Configuration des Variables d'Environnement

Créer le fichier `.env` à la racine du projet :

```bash
# Créer le fichier .env
touch .env
```

Contenu du fichier `.env` :

```env
# Supabase Configuration
VITE_SUPABASE_PROJECT_ID="fepxacqrrjvnvpgzwhyr"
VITE_SUPABASE_URL="https://fepxacqrrjvnvpgzwhyr.supabase.co"
VITE_SUPABASE_PUBLISHABLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZlcHhhY3Fycmp2bnZwZ3p3aHlyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTczNDI1NTMsImV4cCI6MjA3MjkxODU1M30.JK643QTk7c6wcmGZFwl-1C4t3M2uqgC4hE74S3kliZI"
```

## ⚙️ Configuration Supabase

### 1. Installation Supabase CLI

```bash
# Avec npm
npm install -g supabase

# OU avec Homebrew (macOS)
brew install supabase/tap/supabase

# OU téléchargement direct
# Voir : https://supabase.com/docs/guides/cli/getting-started
```

### 2. Authentification Supabase

```bash
# Se connecter à Supabase
supabase login

# Lier le projet local au projet Supabase
supabase link --project-ref fepxacqrrjvnvpgzwhyr
```

### 3. Configuration des Secrets Supabase

Les secrets suivants doivent être configurés dans Supabase :

```bash
# Via l'interface Supabase (recommandé)
# Aller sur : https://supabase.com/dashboard/project/fepxacqrrjvnvpgzwhyr/settings/functions

# Secrets requis :
BREVO_API_KEY=votre_cle_brevo
GMAIL_USER=votre_email@gmail.com
GMAIL_APP_PASSWORD=votre_app_password_gmail
OPENAI_API_KEY=sk-votre_cle_openai
SUPABASE_URL=https://fepxacqrrjvnvpgzwhyr.supabase.co
SUPABASE_SERVICE_ROLE_KEY=votre_service_role_key
AUTH_EMAIL_HOOK_SECRET=secret_genere_automatiquement
```

## 🛠️ Commandes de Développement

### Commandes Frontend

```bash
# Démarrer le serveur de développement (port 8080)
npm run dev

# Build de production
npm run build

# Build de développement
npm run build:dev

# Lancer le serveur de preview (après build)
npm run preview

# Vérification ESLint
npm run lint
```

### Commandes Supabase

```bash
# Générer les types TypeScript depuis la base
supabase gen types typescript --local > src/integrations/supabase/types.ts

# Déployer les Edge Functions
supabase functions deploy

# Déployer une fonction spécifique
supabase functions deploy auth-email-sender

# Voir les logs d'une fonction
supabase functions logs auth-email-sender

# Pousser les migrations vers la base
supabase db push

# Reset de la base locale (ATTENTION: perte de données)
supabase db reset
```

## 📧 Configuration Services Externes

### Gmail App Password

1. Activer l'authentification à 2 facteurs sur Gmail
2. Générer un App Password :
   - Aller dans Paramètres Google → Sécurité
   - "Mots de passe des applications"
   - Sélectionner "Autre" → "Vybbi"
   - Utiliser le mot de passe généré dans `GMAIL_APP_PASSWORD`

### Brevo (optionnel)

1. Créer un compte sur [brevo.com](https://brevo.com/)
2. Générer une clé API dans Paramètres → Clés API
3. Ajouter la clé dans les secrets Supabase

### OpenAI

1. Créer un compte sur [platform.openai.com](https://platform.openai.com/)
2. Générer une clé API
3. Ajouter la clé dans les secrets Supabase

## 🏗️ Architecture du Projet

```
vybbi/
├── src/
│   ├── components/          # Composants React réutilisables
│   │   ├── admin/          # Interface d'administration
│   │   ├── layout/         # Composants de mise en page
│   │   ├── messages/       # Système de messagerie
│   │   └── ui/             # Composants UI de base (shadcn)
│   ├── pages/              # Pages de l'application (routing)
│   ├── hooks/              # Hooks React personnalisés
│   ├── lib/                # Services et utilitaires
│   ├── contexts/           # Contextes React
│   ├── utils/              # Fonctions utilitaires
│   └── integrations/       # Intégrations Supabase
├── supabase/
│   ├── functions/          # Edge Functions
│   ├── migrations/         # Migrations de base de données
│   └── config.toml         # Configuration Supabase
├── public/                 # Assets statiques
└── docs/                   # Documentation
```

## 🔧 Stack Technique

- **Frontend** : Vite 5 + React 18 + TypeScript
- **UI** : Tailwind CSS + shadcn-ui + Radix UI
- **State Management** : React Query (TanStack Query)
- **Routing** : React Router DOM v6
- **Backend** : Supabase (PostgreSQL + Edge Functions)
- **Email** : Gmail SMTP + Brevo API
- **AI** : OpenAI GPT pour l'assistant Vybbi

## 🚀 Workflow de Développement

### 1. Développement Local

```bash
# 1. Créer une nouvelle branche
git checkout -b feature/nouvelle-fonctionnalite

# 2. Démarrer le serveur de développement
npm run dev

# 3. Développer la fonctionnalité
# L'application sera disponible sur http://localhost:8080

# 4. Tester localement
npm run lint
npm run build
```

### 2. Déploiement des Edge Functions

```bash
# Déployer toutes les fonctions
supabase functions deploy

# Déployer une fonction spécifique
supabase functions deploy nom-de-la-fonction

# Vérifier les logs
supabase functions logs nom-de-la-fonction --follow
```

### 3. Commit et Push

```bash
# Ajouter les modifications
git add .

# Commit avec message descriptif
git commit -m "feat: ajouter nouvelle fonctionnalité de messagerie"

# Push vers GitHub
git push origin feature/nouvelle-fonctionnalite
```

### 4. Déploiement Production

**Option 1 : Lovable (recommandé)**
1. Ouvrir [Lovable](https://lovable.dev/projects/1e644dba-bb62-4be6-913f-de2fb7f78a11)
2. Cliquer sur "Share" → "Publish"
3. Configuration automatique du déploiement

**Option 2 : GitHub Actions**
```yaml
# .github/workflows/deploy.yml (à créer si besoin)
name: Deploy to Production
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      - run: npm ci
      - run: npm run build
      # Configuration de déploiement spécifique
```

## 🐛 Debugging et Logs

### Logs Frontend (DevTools)

```bash
# Ouvrir les DevTools dans le navigateur (F12)
# Onglets utiles :
# - Console : Erreurs JavaScript et logs
# - Network : Requêtes HTTP/API
# - Application : LocalStorage, SessionStorage
# - Sources : Debugging avec breakpoints
```

### Logs Edge Functions

```bash
# Voir tous les logs en temps réel
supabase functions logs --follow

# Logs d'une fonction spécifique
supabase functions logs auth-email-sender --follow

# Logs avec filtre par niveau
supabase functions logs --level error
```

### Logs Supabase Database

```bash
# Via l'interface web
# https://supabase.com/dashboard/project/fepxacqrrjvnvpgzwhyr/logs/postgres-logs

# Via CLI (requiert configuration supplémentaire)
supabase logs db --follow
```

## ⚠️ Troubleshooting

### Problèmes Courants

**1. Erreur "Cannot connect to Supabase"**
```bash
# Vérifier les variables d'environnement
cat .env

# Vérifier la connexion réseau
ping fepxacqrrjvnvpgzwhyr.supabase.co
```

**2. Edge Function non trouvée**
```bash
# Redéployer la fonction
supabase functions deploy nom-fonction

# Vérifier la configuration
cat supabase/config.toml
```

**3. Erreurs de compilation TypeScript**
```bash
# Régénérer les types Supabase
supabase gen types typescript --local > src/integrations/supabase/types.ts

# Nettoyer le cache
rm -rf node_modules/.vite
npm run dev
```

**4. Port 8080 déjà utilisé**
```bash
# Tuer le processus sur le port 8080
lsof -ti:8080 | xargs kill -9

# OU utiliser un autre port
npm run dev -- --port 3000
```

### Reset Complet du Projet

```bash
# Nettoyer complètement (ATTENTION: perte de données locales)
rm -rf node_modules
rm package-lock.json
npm install

# Reset Supabase local
supabase db reset

# Redémarrer
npm run dev
```

## 📝 Variables d'Environnement Complètes

### Frontend (.env)
```env
VITE_SUPABASE_PROJECT_ID="fepxacqrrjvnvpgzwhyr"
VITE_SUPABASE_URL="https://fepxacqrrjvnvpgzwhyr.supabase.co"
VITE_SUPABASE_PUBLISHABLE_KEY="votre_cle_publique"
```

### Supabase Secrets (via dashboard)
```env
# Authentication
AUTH_EMAIL_HOOK_SECRET="secret_genere"

# Email Services
BREVO_API_KEY="xkeysib-votre_cle"
GMAIL_USER="votre.email@gmail.com"
GMAIL_APP_PASSWORD="mot_de_passe_app_16_caracteres"
MAIL_FROM_EMAIL="info@vybbi.app"
MAIL_FROM_NAME="Vybbi"

# AI Services
OPENAI_API_KEY="sk-votre_cle_openai"

# Supabase Internal
SUPABASE_URL="https://fepxacqrrjvnvpgzwhyr.supabase.co"
SUPABASE_SERVICE_ROLE_KEY="votre_service_role_key"
SUPABASE_ANON_KEY="votre_anon_key"
```

## 🔗 Liens Utiles

### Documentation
- [Supabase Docs](https://supabase.com/docs)
- [React Docs](https://react.dev/)
- [Vite Docs](https://vitejs.dev/)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [shadcn/ui](https://ui.shadcn.com/)

### Dashboards
- [Supabase Dashboard](https://supabase.com/dashboard/project/fepxacqrrjvnvpgzwhyr)
- [Edge Functions](https://supabase.com/dashboard/project/fepxacqrrjvnvpgzwhyr/functions)
- [Database](https://supabase.com/dashboard/project/fepxacqrrjvnvpgzwhyr/editor)
- [Lovable Project](https://lovable.dev/projects/1e644dba-bb62-4be6-913f-de2fb7f78a11)

---

**Dernière mise à jour** : 14 septembre 2025

Pour toute question ou problème, consulter :
1. Cette documentation
2. Les logs Supabase
3. La console DevTools du navigateur
4. La documentation officielle des technologies utilisées