# Changelog - Vybbi

## [2025-09-13] - Email System Overhaul

### 🚀 Nouvelles Fonctionnalités
- **Système email hybride** : Support des templates internes et Brevo
- **Interface admin email** : Gestion complète des templates via UI
- **Validation des variables** : Vérification automatique des paramètres requis
- **Provider system** : Routage automatique selon le type de template

### 🔧 Améliorations Techniques
- **Migration DB** : Ajout colonnes `provider`, `brevo_template_id`, `required_variables`
- **Edge function unifiée** : `send-notification` gère les deux modes
- **Types TypeScript** : Amélioration du typage pour éviter les `any`
- **Environment variables** : Sécurisation du client Supabase

### 📧 Templates Email
- **Templates internes** : Éditeur HTML drag-and-drop
- **Templates Brevo** : Sélection depuis l'interface Brevo
- **Variables dynamiques** : Remplacement automatique `{{variable}}`
- **Test intégré** : Envoi d'emails de test depuis l'admin

### 🗂️ Fichiers Modifiés
- `src/components/admin/EmailTemplateManager.tsx` - Interface admin complète
- `supabase/functions/send-notification/index.ts` - Logique provider
- `supabase/migrations/20250913190000_add_brevo_provider_to_email_templates.sql` - Schéma DB
- `src/integrations/supabase/client.ts` - Variables d'environnement
- `src/integrations/supabase/types.ts` - Types mis à jour

### 🎯 Objectif Atteint
> "système de notification mail via Brevo, car on doit faire propre avec des template mail facilement modifiable"

✅ **Templates facilement modifiables** : 
- Interface admin pour édition
- Support Brevo pour templates complexes
- Éditeur drag-and-drop pour templates simples

✅ **Système propre** :
- Architecture claire avec providers
- API unifiée pour l'envoi
- Validation et gestion d'erreurs

### 📋 Configuration Requise
```env
# Variables d'environnement
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_key

# Edge Functions (Supabase)
BREVO_API_KEY=your_brevo_api_key
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### 🏗️ Architecture

#### Avant
```
Client → send-notification → Templates hardcodés → Brevo API
```

#### Après  
```
Client → send-notification → DB Templates → Provider Check
                                        ├── Internal: HTML processing → Brevo API  
                                        └── Brevo: Template ID → Brevo Template API
```

### 📖 Documentation
- `KNOWLEDGE_BASE.md` - Architecture complète du projet
- `EMAIL_SYSTEM_GUIDE.md` - Guide spécifique au système email
- Code commenté avec exemples d'usage

---

## [2025-09-13] - Setup Initial

### 🏁 Mise en Place
- **Environnement local** : Application Vite + React fonctionnelle
- **Port 8080** : Serveur de développement avec HMR
- **Dépendances** : Installation et configuration initiale
- **Analyse du code** : Mapping de l'architecture existante

### 🔍 Analyse Effectuée
- **Stack technique** : Vite, React 18, TypeScript, Tailwind, shadcn-ui
- **Backend** : Supabase avec Edge Functions
- **Email** : Système Brevo existant avec templates inline
- **Structure** : Composants, pages, hooks, intégrations

### 🛠️ Corrections
- **Supabase client** : Migration des variables hardcodées vers `.env`
- **Sécurité** : Suppression des clés API du code source
- **Dependencies** : Résolution des conflits d'installation

---

*Changelog maintenu pour documenter l'évolution du projet Vybbi.*
