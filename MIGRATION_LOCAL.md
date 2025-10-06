# Guide de Migration et Développement Local - VYBBI

> **Guide complet pour développer, tester et débugger les fonctions Edge Supabase en local**

---

## 📋 Table des matières

1. [Choix de l'éditeur](#1-choix-de-léditeur)
2. [Prérequis système](#2-prérequis-système)
3. [🔥 Tests de fonctions Edge en local](#3--tests-de-fonctions-edge-en-local)
4. [Tests automatisés avec Deno](#4-tests-automatisés-avec-deno)
5. [Monitoring et logs](#5-monitoring-et-logs)
6. [Workflow de développement](#6-workflow-de-développement)
7. [Migration depuis Lovable](#7-migration-depuis-lovable-vers-environnement-100-local)
8. [Production-ready : Tests de charge & CI/CD](#8-best-practices-pour-solidité-en-production)
9. [Troubleshooting](#9-troubleshooting-spécifique)
10. [Comparaison des environnements](#10-comparaison--local-vs-staging-vs-production)
11. [Templates et snippets](#11-annexes-et-templates)

---

## 1. Choix de l'éditeur

### Comparaison des éditeurs

| Critère | **VSCode** ⭐ | Cursor | Trae |
|---------|------------|--------|------|
| **Supabase CLI** | ✅ Extension native | ⚠️ Compatible CLI | ⚠️ Support limité |
| **Deno Debugger** | ✅ Excellent | ✅ Bon | ❌ Basique |
| **REST Client** | ✅ Extension officielle | ✅ Compatible | ⚠️ Externe |
| **IA intégrée** | ⚠️ Via extensions | ✅✅ Native (GPT-4) | ❌ Aucune |
| **Performance** | ✅ Très rapide | ✅ Rapide | ⚠️ Variable |
| **Communauté** | ✅✅ Massive | ⚠️ Croissante | ❌ Limitée |
| **Prix** | 💰 Gratuit | 💰 $20/mois | 💰 Gratuit |

### 🏆 Recommandation : **VSCode**

**Pourquoi ?**
- Extension Supabase CLI avec autocomplétion
- Debugger Deno mature (breakpoints, watch, call stack)
- REST Client pour tester les fonctions sans quitter l'éditeur
- GitLens pour historique détaillé
- Gratuit et documentation extensive

**Alternative :** **Cursor** si vous voulez l'IA intégrée pour le pair programming.

---

## 2. Prérequis système

### Installation de base

```bash
# Node.js 22+ (vérifié dans package.json)
node --version  # Doit afficher v22.x

# Git
git --version

# Docker Desktop (pour Supabase local)
docker --version
docker compose version

# Supabase CLI
npm install -g supabase
supabase --version
```

### Extensions VSCode essentielles

```json
// .vscode/extensions.json (à créer)
{
  "recommendations": [
    "denoland.vscode-deno",           // Support Deno pour Edge Functions
    "humao.rest-client",              // Tester les APIs HTTP
    "supabase.vscode-supabase",       // Extension officielle Supabase
    "eamodio.gitlens",                // Historique Git avancé
    "ms-azuretools.vscode-docker",    // Gestion Docker
    "yzhang.markdown-all-in-one"      // Édition Markdown
  ]
}
```

Installer toutes les extensions recommandées : `Cmd/Ctrl + Shift + P` → **Extensions: Show Recommended Extensions**

---

## 3. 🔥 Tests de fonctions Edge en local

### 3.1 Démarrage de l'environnement Supabase local

```bash
# Initialiser Supabase (première fois uniquement)
cd /path/to/vybbi
supabase init

# Démarrer tous les services locaux
supabase start
```

**Services lancés automatiquement :**

| Service | Port | URL | Usage |
|---------|------|-----|-------|
| **PostgreSQL** | 54322 | - | Base de données locale |
| **API Gateway** | 54321 | http://localhost:54321 | REST API + Edge Functions |
| **Studio** | 54323 | http://localhost:54323 | Interface admin DB |
| **Inbucket** | 54324 | http://localhost:54324 | Capture emails (SMTP local) |
| **GoTrue** | 54321 | - | Service d'authentification |

```bash
# Vérifier les services
supabase status
```

**Sortie attendue :**
```
API URL: http://localhost:54321
DB URL: postgresql://postgres:postgres@localhost:54322/postgres
Studio URL: http://localhost:54323
Inbucket URL: http://localhost:54324
anon key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
service_role key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

### 3.2 Configuration des secrets locaux

**Créer `.env.local` à la racine du projet :**

```bash
cat > .env.local << 'EOF'
# ============================================
# SUPABASE LOCAL (depuis `supabase status`)
# ============================================
SUPABASE_URL=http://localhost:54321
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# ============================================
# APIs EXTERNES (clés réelles)
# ============================================
OPENAI_API_KEY=sk-proj-...
GMAIL_USER=votre-email@gmail.com
GMAIL_APP_PASSWORD=votre-app-password-16-chars
BREVO_API_KEY=xkeysib-...

# ============================================
# WHATSAPP BUSINESS (si applicable)
# ============================================
WHATSAPP_BUSINESS_ACCOUNT_ID=123456789
WHATSAPP_ACCESS_TOKEN=EAAG...
WHATSAPP_PHONE_NUMBER_ID=987654321

# ============================================
# INBUCKET (SMTP LOCAL)
# ============================================
SMTP_HOST=inbucket
SMTP_PORT=2500
SMTP_USER=
SMTP_PASS=
EOF
```

**🔒 Ajouter au `.gitignore` :**

```bash
echo ".env.local" >> .gitignore
git add .gitignore
git commit -m "chore: ignore .env.local"
```

---

### 3.3 Servir une fonction spécifique en mode développement

```bash
# Servir UNE fonction avec hot-reload et debug
supabase functions serve auth-email-sender --env-file .env.local --debug

# Servir TOUTES les fonctions (pour tests d'intégration)
supabase functions serve --env-file .env.local

# Options utiles :
# --no-verify-jwt : désactiver la vérification JWT pour tester sans auth
# --import-map : spécifier un fichier import_map.json personnalisé
```

**Logs en temps réel :**
```
Serving functions on http://localhost:54321/functions/v1/
[auth-email-sender] Listening on 0.0.0.0:9000...
```

✅ **Avantages :**
- ⚡ **Instant reload** : Toute modification du code TypeScript redémarre automatiquement la fonction
- 📝 **Logs directs** : Tous les `console.log()` s'affichent dans le terminal
- 🐛 **Debugger attachable** : Avec `--debug`, vous pouvez mettre des breakpoints VSCode

---

### 3.4 Tester avec `curl` (approche recommandée)

**Créer `test-scripts/test-auth-email.sh` :**

```bash
#!/bin/bash

# Récupérer l'anon key depuis `supabase status`
ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

echo "🧪 Test de auth-email-sender en local..."

curl -i --location --request POST \
  'http://localhost:54321/functions/v1/auth-email-sender' \
  --header "Authorization: Bearer $ANON_KEY" \
  --header 'Content-Type: application/json' \
  --data '{
    "type": "signup",
    "user": {
      "id": "test-user-id",
      "email": "test@vybbi.app"
    },
    "email_data": {
      "token": "123456",
      "token_hash": "test-hash-abc123",
      "email_action_type": "signup",
      "site_url": "http://localhost:8080"
    }
  }'

echo "\n✅ Vérifier l'email reçu sur http://localhost:54324"
```

**Rendre exécutable et lancer :**

```bash
chmod +x test-scripts/test-auth-email.sh
./test-scripts/test-auth-email.sh
```

**Sortie attendue :**
```
HTTP/2 200 
content-type: application/json
...
{"success": true, "message": "Email envoyé"}
```

---

### 3.5 Tester avec VSCode REST Client (alternative visuelle)

**Créer `test-scripts/functions.http` :**

```http
### ========================================
### VARIABLES GLOBALES
### ========================================
@baseUrl = http://localhost:54321/functions/v1
@anonKey = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

### ========================================
### Test auth-email-sender (Signup)
### ========================================
POST {{baseUrl}}/auth-email-sender
Authorization: Bearer {{anonKey}}
Content-Type: application/json

{
  "type": "signup",
  "user": {
    "id": "test-user-id",
    "email": "test@vybbi.app"
  },
  "email_data": {
    "token": "123456",
    "token_hash": "test-hash",
    "email_action_type": "signup",
    "site_url": "http://localhost:8080"
  }
}

### ========================================
### Test vybbi-ai (Recherche DJ)
### ========================================
POST {{baseUrl}}/vybbi-ai
Authorization: Bearer {{anonKey}}
Content-Type: application/json

{
  "message": "Trouve-moi des DJs techno à Paris pour le 15 juillet",
  "action": "search",
  "context": {
    "page": "social-wall",
    "userId": "test-user-123"
  }
}

### ========================================
### Test send-notification
### ========================================
POST {{baseUrl}}/send-notification
Authorization: Bearer {{anonKey}}
Content-Type: application/json

{
  "userId": "test-user-id",
  "type": "booking_request",
  "title": "Nouvelle demande de booking",
  "message": "DJ Shadow souhaite booker votre lieu le 20/12/2025",
  "data": {
    "bookingId": "booking-123",
    "artistName": "DJ Shadow"
  }
}

### ========================================
### Test translate-text
### ========================================
POST {{baseUrl}}/translate-text
Authorization: Bearer {{anonKey}}
Content-Type: application/json

{
  "text": "Hello world, this is a test",
  "targetLanguage": "fr"
}
```

**📖 Usage :**
1. Ouvrir `functions.http` dans VSCode
2. Cliquer sur **"Send Request"** au-dessus de chaque requête
3. La réponse s'affiche dans un panneau à droite avec syntax highlighting

**💡 Astuce :** Créer un fichier `.http` par fonction pour organiser les tests.

---

### 3.6 Tester les emails avec Inbucket (SMTP local)

**Inbucket capture TOUS les emails envoyés par vos fonctions Edge.**

```bash
# Inbucket est automatiquement lancé par `supabase start`
# Interface web : http://localhost:54324
```

**Workflow de test d'emails :**

1. **Lancer la fonction** `auth-email-sender` :
   ```bash
   ./test-scripts/test-auth-email.sh
   ```

2. **Ouvrir Inbucket** : http://localhost:54324

3. **Voir l'email capturé** :
   - Cliquer sur l'email destinataire (`test@vybbi.app`)
   - **Onglet "HTML"** : Voir le rendu visuel de l'email
   - **Onglet "Source"** : Voir le code HTML brut
   - **Onglet "Plain Text"** : Voir la version texte

**🔧 Configuration des fonctions pour utiliser Inbucket** (déjà fait dans `auth-email-sender`) :

```typescript
// supabase/functions/auth-email-sender/index.ts
const SMTP_HOST = Deno.env.get('SMTP_HOST') || 'inbucket';
const SMTP_PORT = parseInt(Deno.env.get('SMTP_PORT') || '2500');
const SMTP_USER = Deno.env.get('SMTP_USER') || '';
const SMTP_PASS = Deno.env.get('SMTP_PASS') || '';

// En local, Inbucket accepte tous les emails sans authentification
```

**⚠️ Important :** En production, modifier `.env` pour utiliser Gmail/Brevo :
```bash
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=votre-email@gmail.com
SMTP_PASS=votre-app-password
```

---

### 3.7 Tests d'intégration Frontend + Backend

**Lancer le frontend ET backend en simultané :**

```bash
# Terminal 1 : Backend Supabase
supabase start
supabase functions serve --env-file .env.local

# Terminal 2 : Frontend Vite
npm run dev
```

**Configuration côté frontend** (`src/integrations/supabase/client.ts`) :

```typescript
// En développement local, modifier temporairement :
const SUPABASE_URL = import.meta.env.DEV 
  ? 'http://localhost:54321'  // Local
  : 'https://fepxacqrrjvnvpgzwhyr.supabase.co'; // Production

const SUPABASE_ANON_KEY = import.meta.env.DEV
  ? 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' // Local (depuis `supabase status`)
  : 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'; // Production
```

**💡 Astuce :** Créer un fichier `.env.local` pour Vite :

```bash
# .env.local (pour Vite, PAS pour Supabase Functions)
VITE_SUPABASE_URL=http://localhost:54321
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

Puis dans `src/integrations/supabase/client.ts` :

```typescript
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://fepxacqrrjvnvpgzwhyr.supabase.co';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'prod-key...';
```

**Tester le flux complet :**
1. Frontend sur http://localhost:8080
2. Cliquer sur "S'inscrire" → remplir le formulaire
3. Vérifier dans le terminal du backend les logs de `auth-email-sender`
4. Vérifier l'email reçu sur http://localhost:54324

---

### 3.8 Debugging avancé avec VSCode

**Créer `.vscode/launch.json` :**

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "🐛 Debug Supabase Function",
      "type": "node",
      "request": "attach",
      "port": 9229,
      "restart": true,
      "sourceMaps": true,
      "resolveSourceMapLocations": [
        "${workspaceFolder}/**",
        "!**/node_modules/**"
      ],
      "skipFiles": [
        "<node_internals>/**"
      ]
    }
  ]
}
```

**Workflow de debugging :**

1. **Lancer la fonction en mode debug** :
   ```bash
   supabase functions serve auth-email-sender --debug --env-file .env.local
   ```

2. **Attacher le debugger VSCode** :
   - Appuyer sur `F5` (ou menu **Run > Start Debugging**)
   - Sélectionner **"🐛 Debug Supabase Function"**

3. **Mettre des breakpoints** :
   - Ouvrir `supabase/functions/auth-email-sender/index.ts`
   - Cliquer dans la marge gauche pour ajouter un breakpoint (point rouge)

4. **Déclencher la fonction** :
   ```bash
   ./test-scripts/test-auth-email.sh
   ```

5. **Explorer l'état** :
   - **Variables** : Inspecter toutes les variables locales
   - **Call Stack** : Voir la pile d'appels
   - **Watch** : Surveiller des expressions spécifiques
   - **Step Over** (`F10`), **Step Into** (`F11`), **Continue** (`F5`)

**💡 Astuce :** Utiliser `debugger;` dans le code TypeScript pour forcer un breakpoint.

---

## 4. Tests automatisés avec Deno

### 4.1 Créer des tests unitaires

**Structure recommandée :**
```
supabase/functions/
├── _tests/
│   ├── email-validation.test.ts
│   ├── ai-scoring.test.ts
│   └── token-generation.test.ts
├── auth-email-sender/
├── vybbi-ai/
└── ...
```

**Exemple `_tests/email-validation.test.ts` :**

```typescript
import { assertEquals, assertMatch } from "https://deno.land/std@0.168.0/testing/asserts.ts";

// Fonction à tester (extraite de auth-email-sender)
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

Deno.test("Email validation: reject invalid emails", () => {
  assertEquals(isValidEmail("invalid-email"), false);
  assertEquals(isValidEmail("missing@domain"), false);
  assertEquals(isValidEmail("@nodomain.com"), false);
});

Deno.test("Email validation: accept valid emails", () => {
  assertEquals(isValidEmail("valid@email.com"), true);
  assertEquals(isValidEmail("user+tag@domain.co.uk"), true);
  assertEquals(isValidEmail("test.user@sub.domain.com"), true);
});

Deno.test("Token generation: should be 6 digits", () => {
  const token = Math.floor(100000 + Math.random() * 900000).toString();
  assertEquals(token.length, 6);
  assertMatch(token, /^\d{6}$/);
});

Deno.test("Token generation: should be unique", () => {
  const token1 = Math.floor(100000 + Math.random() * 900000).toString();
  const token2 = Math.floor(100000 + Math.random() * 900000).toString();
  // Probabilité extrêmement faible que 2 tokens soient identiques
  // (mais pas impossible, ce test est juste illustratif)
});
```

**Exécuter les tests :**

```bash
# Tous les tests
deno test supabase/functions/_tests/

# Un fichier spécifique
deno test supabase/functions/_tests/email-validation.test.ts

# Avec couverture de code
deno test --coverage=cov_profile supabase/functions/_tests/
deno coverage cov_profile
```

**Sortie attendue :**
```
running 4 tests from ./supabase/functions/_tests/email-validation.test.ts
Email validation: reject invalid emails ... ok (2ms)
Email validation: accept valid emails ... ok (1ms)
Token generation: should be 6 digits ... ok (1ms)
Token generation: should be unique ... ok (0ms)

test result: ok. 4 passed; 0 failed; 0 ignored; 0 measured; 0 filtered out (4ms)
```

---

### 4.2 Tests d'intégration pour les fonctions Edge

**Exemple `_tests/auth-email-integration.test.ts` :**

```typescript
import { assertEquals } from "https://deno.land/std@0.168.0/testing/asserts.ts";

const BASE_URL = "http://localhost:54321/functions/v1";
const ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY") || "test-key";

Deno.test("auth-email-sender: should send signup email", async () => {
  const response = await fetch(`${BASE_URL}/auth-email-sender`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${ANON_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      type: "signup",
      user: {
        id: "test-user-id",
        email: "test@vybbi.app",
      },
      email_data: {
        token: "123456",
        token_hash: "test-hash",
        email_action_type: "signup",
        site_url: "http://localhost:8080",
      },
    }),
  });

  assertEquals(response.status, 200);
  
  const data = await response.json();
  assertEquals(data.success, true);
});

Deno.test("auth-email-sender: should reject invalid email", async () => {
  const response = await fetch(`${BASE_URL}/auth-email-sender`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${ANON_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      type: "signup",
      user: {
        id: "test-user-id",
        email: "invalid-email", // Email invalide
      },
      email_data: {
        token: "123456",
        token_hash: "test-hash",
        email_action_type: "signup",
        site_url: "http://localhost:8080",
      },
    }),
  });

  assertEquals(response.status, 400); // Bad Request
});
```

**Lancer les tests d'intégration :**

```bash
# Démarrer Supabase local AVANT
supabase start
supabase functions serve --env-file .env.local &

# Lancer les tests
SUPABASE_ANON_KEY="eyJhbG..." deno test --allow-net supabase/functions/_tests/auth-email-integration.test.ts
```

---

## 5. Monitoring et logs

### 5.1 Logs en temps réel

```bash
# Logs de toutes les fonctions
supabase functions logs --follow

# Logs d'une fonction spécifique
supabase functions logs auth-email-sender --follow

# Filtrer par niveau
supabase functions logs --level error
supabase functions logs --level warn
supabase functions logs --level debug

# Logs avec timestamp
supabase functions logs --timestamps
```

**Exemple de sortie :**
```
2025-10-06 14:23:45 [auth-email-sender] INFO: Received signup request for test@vybbi.app
2025-10-06 14:23:45 [auth-email-sender] DEBUG: Connecting to SMTP server inbucket:2500
2025-10-06 14:23:46 [auth-email-sender] INFO: Email sent successfully to test@vybbi.app
```

---

### 5.2 Logs personnalisés dans les fonctions

**Bonnes pratiques de logging :**

```typescript
// supabase/functions/auth-email-sender/index.ts

console.log(`[${new Date().toISOString()}] Received request:`, JSON.stringify(data, null, 2));

console.error(`[ERROR] Failed to send email:`, error);

console.warn(`[WARN] SMTP_HOST not configured, using default: inbucket`);

console.debug(`[DEBUG] Email payload:`, emailPayload);
```

**⚠️ Important en production :** Retirer les logs sensibles (emails, tokens, passwords) avant de déployer.

---

## 6. Workflow de développement

```mermaid
graph TD
    A[💻 Modification du code] --> B[supabase functions serve]
    B --> C{🧪 Test avec curl/REST Client}
    C -->|❌ Erreur| D[📝 Analyser logs + 🐛 debugger VSCode]
    D --> A
    C -->|✅ OK| E[🌐 Test avec frontend local]
    E -->|❌ Intégration KO| D
    E -->|✅ OK| F[📦 Commit + Push]
    F --> G[🚀 supabase functions deploy]
    G --> H[🔍 Test en staging vybbi.app]
    H -->|❌ Prod KO| D
    H -->|✅ OK| I[✨ Merge vers production]
    I --> J[📊 Monitoring logs production]
```

**Résumé du workflow idéal :**

1. **Développer en local** → Modifier le code TypeScript
2. **Tester immédiatement** → `curl` ou REST Client
3. **Débugger si erreur** → Breakpoints VSCode + logs
4. **Valider l'intégration** → Frontend local (`npm run dev`)
5. **Commiter** → Git commit + push
6. **Déployer en staging** → `supabase functions deploy`
7. **Valider en staging** → Tests sur vybbi.app
8. **Merge en production** → PR + merge + deploy auto (CI/CD)

**⏱️ Temps moyen :** 5-10 minutes du code à la production.

---

## 7. Migration depuis Lovable vers Environnement 100% Local

### 7.1 Récupérer le projet depuis Lovable

```bash
# Cloner le repository GitHub connecté à Lovable
git clone https://github.com/panshop/vybbi.git
cd vybbi

# Installer les dépendances
npm install
```

---

### 7.2 Lier Supabase local au projet distant

```bash
# Lier au projet Supabase existant
supabase link --project-ref fepxacqrrjvnvpgzwhyr

# Tirer les migrations existantes
supabase db pull

# Tirer les fonctions Edge existantes
supabase functions download

# Récupérer les secrets (ne marche PAS en local, voir section 3.2)
supabase secrets list --project-ref fepxacqrrjvnvpgzwhyr
```

**⚠️ Important :** Les secrets ne sont PAS téléchargés localement pour des raisons de sécurité. Vous devez les copier manuellement dans `.env.local`.

---

### 7.3 Configuration Docker personnalisée (optionnel)

**Créer `docker-compose.override.yml` pour personnaliser Supabase local :**

```yaml
version: '3.8'

services:
  # Augmenter les connexions PostgreSQL
  postgres:
    environment:
      - POSTGRES_MAX_CONNECTIONS=200
      - POSTGRES_SHARED_BUFFERS=256MB
    volumes:
      # Charger des données de test au démarrage
      - ./supabase/seed.sql:/docker-entrypoint-initdb.d/seed.sql

  # Personnaliser Inbucket
  inbucket:
    ports:
      - "54324:9000"  # Interface web
      - "54325:2500"  # SMTP
    environment:
      - INBUCKET_MAILBOXNAMING=full  # Utiliser l'email complet comme nom de boîte

  # Ajouter un service Redis (si besoin)
  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
```

**Lancer avec la configuration personnalisée :**

```bash
docker compose -f docker-compose.yml -f docker-compose.override.yml up -d
```

---

## 8. Best Practices pour Solidité en Production

### 8.1 Tests de charge avec k6

**Installer k6 :**

```bash
# macOS
brew install k6

# Linux
sudo apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv-keys C5AD17C747E3415A3642D57D77C6C491D6AC1D69
echo "deb https://dl.k6.io/deb stable main" | sudo tee /etc/apt/sources.list.d/k6.list
sudo apt-get update
sudo apt-get install k6

# Windows (via Chocolatey)
choco install k6
```

**Créer `load-tests/test-vybbi-ai.js` :**

```javascript
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '30s', target: 20 },   // Montée progressive à 20 users
    { duration: '1m', target: 50 },    // Pic à 50 users concurrents
    { duration: '30s', target: 0 },    // Descente progressive
  ],
  thresholds: {
    http_req_duration: ['p(95)<2000'],  // 95% des requêtes < 2s
    http_req_failed: ['rate<0.05'],     // Moins de 5% d'erreurs
  },
};

export default function () {
  const url = 'http://localhost:54321/functions/v1/vybbi-ai';
  const payload = JSON.stringify({
    message: 'Trouve des DJs techno à Paris',
    action: 'search',
    context: {
      page: 'social-wall',
      userId: `user-${Math.random()}`,
    },
  });

  const params = {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    },
  };

  const res = http.post(url, payload, params);

  check(res, {
    'status is 200': (r) => r.status === 200,
    'response time < 2s': (r) => r.timings.duration < 2000,
    'has result': (r) => JSON.parse(r.body).reply !== undefined,
  });

  sleep(1); // Pause de 1s entre chaque requête par utilisateur
}
```

**Exécuter le test de charge :**

```bash
# Lancer Supabase local AVANT
supabase start
supabase functions serve --env-file .env.local

# Lancer k6
k6 run load-tests/test-vybbi-ai.js
```

**Rapport généré :**
```
scenarios: (100.00%) 1 scenario, 50 max VUs, 2m30s max duration

     data_received..................: 2.3 MB 19 kB/s
     data_sent......................: 890 kB 7.4 kB/s
     http_req_duration..............: avg=1.2s  min=450ms med=1.1s  max=2.8s  p(95)=1.8s  p(99)=2.5s
     http_reqs......................: 1247   10.39/s
     iteration_duration.............: avg=2.2s  min=1.4s  med=2.1s  max=3.8s  p(95)=2.8s  p(99)=3.5s

✅ PASSED: 95% des requêtes < 2s
❌ FAILED: 8% d'erreurs (au-dessus du seuil de 5%)
```

---

### 8.2 CI/CD avec GitHub Actions pour Tests Automatiques

**Créer `.github/workflows/test-functions.yml` :**

```yaml
name: 🧪 Test Supabase Functions

on:
  pull_request:
    paths:
      - 'supabase/functions/**'
      - '.github/workflows/test-functions.yml'
  push:
    branches:
      - main
      - develop

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
      - name: 📥 Checkout code
        uses: actions/checkout@v3
      
      - name: 🦕 Setup Deno
        uses: denoland/setup-deno@v1
        with:
          deno-version: v1.x
      
      - name: 🔧 Setup Supabase CLI
        uses: supabase/setup-cli@v1
        with:
          version: latest
      
      - name: 🐳 Start Supabase local
        run: |
          supabase init
          supabase start
      
      - name: 🧪 Run Deno unit tests
        run: |
          deno test --allow-all supabase/functions/_tests/
      
      - name: 🚀 Serve functions in background
        run: |
          supabase functions serve --env-file .env.test &
          sleep 10  # Attendre que les fonctions démarrent
      
      - name: 🌐 Run integration tests
        run: |
          deno test --allow-net supabase/functions/_tests/*-integration.test.ts
      
      - name: 📊 Deploy to staging (if tests pass)
        if: success() && github.ref == 'refs/heads/main'
        env:
          SUPABASE_ACCESS_TOKEN: ${{ secrets.SUPABASE_ACCESS_TOKEN }}
        run: |
          supabase link --project-ref fepxacqrrjvnvpgzwhyr
          supabase functions deploy
      
      - name: 🧹 Cleanup
        if: always()
        run: |
          supabase stop --no-backup
```

**Configurer les secrets GitHub :**
1. Aller sur **Settings** → **Secrets and variables** → **Actions**
2. Ajouter `SUPABASE_ACCESS_TOKEN` (généré depuis https://app.supabase.com/account/tokens)

---

### 8.3 Mocking de Services Externes (OpenAI, Brevo)

**Créer `supabase/functions/_mocks/openai.ts` :**

```typescript
export interface OpenAIMockResponse {
  reply: string;
  confidence: number;
}

export function mockOpenAI(message: string): OpenAIMockResponse {
  // Mock simple pour tests locaux sans consommer de crédits API
  
  if (message.toLowerCase().includes('dj')) {
    return {
      reply: "🎵 Voici 3 DJs disponibles : DJ Alpha (Techno), DJ Beta (House), DJ Gamma (Electro). Tous basés à Paris avec disponibilités ce mois-ci.",
      confidence: 0.92,
    };
  }
  
  if (message.toLowerCase().includes('lieu')) {
    return {
      reply: "🏢 J'ai trouvé 5 lieux correspondants : Le Rex Club, La Concrete, Le Glazart, Le Batofar, Le Warehouse. Capacités de 200 à 1500 personnes.",
      confidence: 0.88,
    };
  }
  
  if (message.toLowerCase().includes('agent')) {
    return {
      reply: "🤝 3 agents/managers disponibles : Sound Management (50+ artistes), Night Bookers (spécialiste techno), Global Events Agency.",
      confidence: 0.85,
    };
  }
  
  return {
    reply: `Résultat mocké pour : "${message}". En mode développement, l'IA réelle n'est pas appelée.`,
    confidence: 0.5,
  };
}
```

**Utiliser le mock dans `vybbi-ai/index.ts` :**

```typescript
import { mockOpenAI } from '../_mocks/openai.ts';

const isDev = Deno.env.get('ENVIRONMENT') === 'local';

if (isDev) {
  console.log('🧪 Mode développement : utilisation du mock OpenAI');
  const mockResponse = mockOpenAI(message);
  reply = mockResponse.reply;
} else {
  // Appel OpenAI réel
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4',
      messages: [{ role: 'user', content: message }],
    }),
  });
  // ...
}
```

**Avantages :**
- 🚀 **Tests instantanés** sans latence API
- 💰 **Économie de crédits** OpenAI/Brevo
- 🔧 **Contrôle total** sur les réponses pour tester des cas spécifiques

---

## 9. Troubleshooting Spécifique

### Erreur : "Function not found"

**Symptômes :**
```
Error: Function not found: auth-email-sender
```

**Solutions :**

```bash
# 1. Vérifier que la fonction existe
ls supabase/functions/
# Doit afficher : auth-email-sender/

# 2. Vérifier que `supabase functions serve` est bien lancé
ps aux | grep supabase
# Doit afficher un processus Deno en cours

# 3. Redémarrer le serveur
pkill -f "supabase functions serve"
supabase functions serve --env-file .env.local

# 4. Vérifier les logs de démarrage
# Doit afficher : "Serving functions on http://localhost:54321/functions/v1/"
```

---

### Erreur : "CORS policy: No 'Access-Control-Allow-Origin' header"

**Symptômes :**
```
Access to fetch at 'http://localhost:54321/functions/v1/auth-email-sender' from origin 'http://localhost:8080' has been blocked by CORS policy
```

**Solutions :**

**Ajouter dans TOUTES les fonctions Edge :**

```typescript
// supabase/functions/auth-email-sender/index.ts

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Gérer les requêtes OPTIONS (preflight)
  if (req.method === 'OPTIONS') {
    return new Response(null, { 
      status: 204, 
      headers: corsHeaders 
    });
  }

  try {
    // Logique de la fonction
    // ...

    return new Response(
      JSON.stringify({ success: true }),
      { 
        status: 200,
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );
  }
});
```

---

### Erreur : "Connection refused to PostgreSQL"

**Symptômes :**
```
Error: connect ECONNREFUSED 127.0.0.1:54322
```

**Solutions :**

```bash
# 1. Vérifier que Docker est lancé
docker ps
# Si vide, lancer Docker Desktop

# 2. Redémarrer Supabase
supabase stop
supabase start

# 3. Vérifier les ports utilisés
lsof -i :54322
# Si occupé par un autre processus, le tuer ou changer le port

# 4. Réinitialiser complètement Supabase local
supabase stop --no-backup
rm -rf supabase/.temp
supabase start
```

---

### Timeouts sur requêtes lentes (OpenAI, Brevo)

**Symptômes :**
```
Error: Request timeout after 30000ms
```

**Solutions :**

**Augmenter le timeout dans Deno :**

```typescript
// supabase/functions/vybbi-ai/index.ts

const controller = new AbortController();
const timeoutId = setTimeout(() => controller.abort(), 60000); // 60s au lieu de 30s

try {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { /* ... */ },
    body: JSON.stringify({ /* ... */ }),
    signal: controller.signal,
  });

  clearTimeout(timeoutId);
  
  // Traiter la réponse
} catch (error) {
  clearTimeout(timeoutId);
  
  if (error.name === 'AbortError') {
    console.error('Timeout: OpenAI request took more than 60s');
    return new Response(
      JSON.stringify({ error: 'Request timeout' }),
      { status: 504 }
    );
  }
  
  throw error;
}
```

---

### Variables d'environnement non chargées

**Symptômes :**
```
Error: OPENAI_API_KEY is not set
```

**Solutions :**

```bash
# 1. Vérifier que .env.local existe
cat .env.local

# 2. Vérifier que --env-file est bien passé
supabase functions serve --env-file .env.local

# 3. Tester dans la fonction
console.log('OPENAI_API_KEY:', Deno.env.get('OPENAI_API_KEY') ? 'SET' : 'NOT SET');

# 4. Vérifier les permissions Deno
# Dans supabase/functions/deno.json :
{
  "tasks": {
    "serve": "deno run --allow-all --watch main.ts"
  }
}
```

---

## 10. Comparaison : Local vs Staging vs Production

| Aspect | **Local** 🏠 | **Staging** 🚀 | **Production** 🌍 |
|--------|------------|-------------|----------------|
| **Vitesse de déploiement** | ⚡ 0s (instant) | 🚀 ~10s | 🐢 ~30s |
| **Coût** | 💰 Gratuit | 💰 Inclus | 💰 Usage-based (Supabase Pro) |
| **Données** | 🔧 Mock/Fixtures | 📊 Données de test | 🔒 Données réelles |
| **Logs** | 👀 Terminal direct | 📝 Dashboard Supabase | 📝 Dashboard Supabase + PostHog |
| **Debugging** | 🐛 Breakpoints VSCode | ⚠️ Logs uniquement | ⚠️ Logs + Sentry |
| **Emails** | 📧 Inbucket (local) | 📧 Gmail/Brevo (test) | 📧 Gmail/Brevo (production) |
| **APIs externes** | 🎭 Mockable | ✅ Réelles (clés de test) | ✅ Réelles (clés prod) |
| **Base de données** | 🗄️ PostgreSQL local | 🗄️ Supabase Cloud (staging) | 🗄️ Supabase Cloud (prod) |
| **Sécurité** | ⚠️ Aucune (localhost) | 🔒 HTTPS + Auth | 🔒🔒 HTTPS + Auth + RLS |
| **Monitoring** | 📊 Terminal | 📊 Dashboard basique | 📊 Dashboard + PostHog + Sentry |

### Recommandations

| Cas d'usage | Environnement recommandé |
|-------------|--------------------------|
| **Développement de nouvelles features** | 🏠 Local (90% du temps) |
| **Tests d'intégration frontend/backend** | 🏠 Local + `npm run dev` |
| **Validation avant merge** | 🚀 Staging |
| **Tests de charge (k6)** | 🏠 Local (pour prototyper) puis 🚀 Staging |
| **Tests d'acceptation utilisateur (UAT)** | 🚀 Staging |
| **Hotfix urgent** | 🏠 Local → 🚀 Staging → 🌍 Production (30 min) |
| **Déploiement planifié** | 🏠 Local → 🚀 Staging (1 jour) → 🌍 Production |

**📊 Répartition idéale du temps de développement :**
- 🏠 **Local** : 90% (développement + débug)
- 🚀 **Staging** : 8% (validation pré-prod)
- 🌍 **Production** : 2% (monitoring + hotfixes)

---

## 11. Annexes et Templates

### Annexe A : Snippet VSCode pour créer une fonction

**Créer `.vscode/vybbi-functions.code-snippets` :**

```json
{
  "Vybbi Edge Function Template": {
    "prefix": "vfunc",
    "body": [
      "import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';",
      "import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';",
      "",
      "const corsHeaders = {",
      "  'Access-Control-Allow-Origin': '*',",
      "  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',",
      "};",
      "",
      "serve(async (req) => {",
      "  // Handle CORS preflight",
      "  if (req.method === 'OPTIONS') {",
      "    return new Response(null, { headers: corsHeaders });",
      "  }",
      "",
      "  try {",
      "    const { ${1:param} } = await req.json();",
      "    console.log('${2:Function name}:', ${1:param});",
      "    ",
      "    // Initialize Supabase client",
      "    const supabase = createClient(",
      "      Deno.env.get('SUPABASE_URL') ?? '',",
      "      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''",
      "    );",
      "    ",
      "    // TODO: Implement business logic",
      "    ${3:// Your code here}",
      "    ",
      "    return new Response(",
      "      JSON.stringify({ success: true, data: ${4:result} }),",
      "      { ",
      "        status: 200,",
      "        headers: { ...corsHeaders, 'Content-Type': 'application/json' } ",
      "      }",
      "    );",
      "  } catch (error) {",
      "    console.error('Error:', error);",
      "    return new Response(",
      "      JSON.stringify({ error: error.message }),",
      "      { ",
      "        status: 500, ",
      "        headers: { ...corsHeaders, 'Content-Type': 'application/json' } ",
      "      }",
      "    );",
      "  }",
      "});"
    ],
    "description": "Template complet pour fonction Edge Vybbi avec CORS et Supabase client"
  },
  
  "Vybbi Test Template": {
    "prefix": "vtest",
    "body": [
      "import { assertEquals, assertExists } from 'https://deno.land/std@0.168.0/testing/asserts.ts';",
      "",
      "Deno.test('${1:Test description}', async () => {",
      "  ${2:// Arrange}",
      "  const ${3:input} = ${4:'test-value'};",
      "  ",
      "  ${5:// Act}",
      "  const ${6:result} = ${7:functionToTest}(${3:input});",
      "  ",
      "  ${8:// Assert}",
      "  assertEquals(${6:result}, ${9:expected});",
      "});"
    ],
    "description": "Template pour test Deno avec pattern Arrange-Act-Assert"
  }
}
```

**Usage dans VSCode :**
1. Créer un nouveau fichier `supabase/functions/ma-fonction/index.ts`
2. Taper `vfunc` puis `Tab` → Le template complet s'insère
3. Remplir les placeholders (`$1`, `$2`, etc.) en tabulant

---

### Annexe B : Checklist avant déploiement en production

**Copier cette checklist dans chaque PR :**

```markdown
## ✅ Checklist de déploiement

### Tests
- [ ] ✅ Tests unitaires passent (`deno test`)
- [ ] ✅ Tests d'intégration passent
- [ ] ✅ Tests de charge OK (`k6 run`)
- [ ] ✅ Testé en local avec frontend (`npm run dev`)
- [ ] ✅ Testé en staging (vybbi.app)

### Sécurité
- [ ] 🔒 Logs de debug retirés (`console.log` sensibles)
- [ ] 🔒 Variables d'environnement configurées en production
- [ ] 🔒 CORS correctement configuré
- [ ] 🔒 Validation des inputs (zod/joi)
- [ ] 🔒 Pas de données sensibles en clair dans le code

### Performance
- [ ] ⚡ Timeouts définis pour appels externes (30-60s)
- [ ] ⚡ Pagination implémentée pour requêtes DB
- [ ] ⚡ Indexes DB créés si nécessaire
- [ ] ⚡ Cache implémenté (Redis) si applicable

### Documentation
- [ ] 📝 README mis à jour
- [ ] 📝 Commentaires du code clairs
- [ ] 📝 API documentée (OpenAPI/Swagger)
- [ ] 📝 CHANGELOG.md mis à jour

### Monitoring
- [ ] 📊 Sentry configuré pour erreurs
- [ ] 📊 PostHog events ajoutés
- [ ] 📊 Dashboard Supabase vérifié
- [ ] 📊 Alertes configurées (Slack/Discord)

### Déploiement
- [ ] 🚀 Branch `main` à jour
- [ ] 🚀 Migrations DB appliquées
- [ ] 🚀 Secrets synchronisés (Supabase Dashboard)
- [ ] 🚀 Rollback plan défini
```

---

### Annexe C : Script de déploiement automatisé

**Créer `scripts/deploy.sh` :**

```bash
#!/bin/bash

set -e  # Exit on error

echo "🚀 Déploiement VYBBI vers Supabase Production"
echo "=============================================="

# Vérifier que nous sommes sur la branche main
CURRENT_BRANCH=$(git branch --show-current)
if [ "$CURRENT_BRANCH" != "main" ]; then
  echo "❌ Vous devez être sur la branche 'main' pour déployer en production"
  exit 1
fi

# Vérifier qu'il n'y a pas de modifications non commitées
if [[ -n $(git status -s) ]]; then
  echo "❌ Vous avez des modifications non commitées. Veuillez commit ou stash avant de déployer."
  exit 1
fi

# Demander confirmation
read -p "⚠️  Êtes-vous sûr de vouloir déployer en PRODUCTION ? (yes/no): " CONFIRM
if [ "$CONFIRM" != "yes" ]; then
  echo "❌ Déploiement annulé"
  exit 1
fi

# Lancer les tests
echo ""
echo "🧪 Exécution des tests..."
deno test supabase/functions/_tests/ || {
  echo "❌ Les tests ont échoué. Déploiement annulé."
  exit 1
}

# Déployer les fonctions
echo ""
echo "📦 Déploiement des fonctions Edge..."
supabase functions deploy --project-ref fepxacqrrjvnvpgzwhyr

# Appliquer les migrations DB (si applicable)
echo ""
echo "🗄️  Application des migrations DB..."
supabase db push --project-ref fepxacqrrjvnvpgzwhyr || {
  echo "⚠️  Migrations DB non appliquées (peut-être déjà à jour)"
}

# Vérifier le déploiement
echo ""
echo "✅ Déploiement terminé !"
echo ""
echo "📊 Vérifier les logs sur : https://app.supabase.com/project/fepxacqrrjvnvpgzwhyr/logs/edge-functions"
echo "🌍 Tester sur : https://vybbi.app"
```

**Rendre exécutable :**

```bash
chmod +x scripts/deploy.sh
./scripts/deploy.sh
```

---

## 📚 Ressources Supplémentaires

### Documentation officielle
- [Supabase Edge Functions](https://supabase.com/docs/guides/functions)
- [Deno Deploy](https://deno.com/deploy/docs)
- [k6 Load Testing](https://k6.io/docs/)

### Communauté Vybbi
- 💬 Discord : [lien vers serveur Discord Vybbi]
- 📧 Support : support@vybbi.app
- 📝 Wiki interne : [lien vers Notion/Confluence]

---

## 🎯 Conclusion

Ce guide couvre **100% du workflow de développement local** pour Vybbi :

✅ **Configuration de l'environnement** avec VSCode + Docker + Supabase CLI
✅ **Tests de fonctions** avec `curl`, REST Client, et Inbucket pour les emails
✅ **Debugging avancé** avec breakpoints VSCode et logs en temps réel
✅ **Tests automatisés** avec Deno Test et k6 pour les charges
✅ **CI/CD** avec GitHub Actions pour déploiement automatique
✅ **Migration depuis Lovable** vers environnement 100% local
✅ **Production-ready** avec mocking, monitoring, et checklists

**💡 Principe clé :** Développer à 90% en local, valider 10% en staging, déployer en production en toute confiance.

**🚀 Prochaines étapes :**
1. Installer les prérequis (section 2)
2. Démarrer Supabase local (`supabase start`)
3. Tester votre première fonction (`./test-scripts/test-auth-email.sh`)
4. Debugger avec VSCode (F5)
5. Automatiser avec GitHub Actions

---

**Dernière mise à jour :** 2025-10-06
**Version du guide :** 1.0.0
**Auteur :** Équipe Vybbi
