# 🛠️ Guide de Développement - Vybbi

## 🚨 **RÈGLES DE SÉCURITÉ CRITIQUES**

### ❌ **INTERDIT FORMELLEMENT**

- **JAMAIS toucher à l'environnement de PRODUCTION**
- **JAMAIS commiter** les fichiers `.env.*`
- **JAMAIS exécuter** `supabase link` sans spécifier l'environnement

### ✅ **OBLIGATOIRE**

- **TOUJOURS** utiliser Staging pour les tests
- **TOUJOURS** vérifier l'environnement lié avant toute migration
- **TOUJOURS** faire un `db diff` avant un `db push`

---

## 🔧 **Configuration Environnements**

### 🆔 **RÈGLES D'IDENTIFICATION - À MÉMORISER**

```
PROD_REF = fepxacqrrjvnvpgzwhyr → "fepx…" ⚠️ PRODUCTION
STAGING_REF = zckjtuenlpcfbwcgplaw → "zckj…" ✅ DÉVELOPPEMENT
```

### **Staging (Développement)** ✅

- **Project Ref** : `zckjtuenlpcfbwcgplaw`
- **URL** : `https://zckjtuenlpcfbwcgplaw.supabase.co`
- **Fichier** : `.env.local` / `.env.staging`

### **Production** ⚠️

- **Project Ref** : `fepxacqrrjvnvpgzwhyr`
- **URL** : `https://fepxacqrrjvnvpgzwhyr.supabase.co`
- ⚠️ **Accès restreint - Ne pas utiliser en développement**

---

## 🚀 **Commandes de Développement**

### **Démarrer en mode Staging**

```bash
# 1. Lier au projet Staging
npm run link:staging

# 2. Vérifier la liaison (doit afficher zckj...)
npm run supabase:status

# 3. Lancer l'app en mode Staging
npm run dev:staging
```

### **🔍 Vérification Environnement**

```bash
# Vérifier que vous êtes bien sur STAGING (zckj...)
supabase projects list

# Si vous voyez "fepx..." → DANGER! Vous êtes sur PROD
# Relancer: npm run link:staging
```

### **Workflow de Migration Sécurisé**

```bash
# 1. S'assurer d'être sur Staging
supabase projects list

# 2. Créer une migration (si nécessaire)
supabase db diff -f ma_nouvelle_migration

# 3. Vérifier le diff avant push
cat supabase/migrations/[timestamp]_ma_nouvelle_migration.sql

# 4. Appliquer sur Staging
supabase db push

# 5. Vérifier dans le dashboard Staging
```

---

## 📋 **Checklist avant chaque session**

- [ ] `supabase projects list` → Confirmer liaison Staging
- [ ] `.env.local` existe et contient les bonnes variables
- [ ] `npm run dev:staging` → App fonctionnelle
- [ ] Aucun fichier `.env.*` dans git status

---

## 🆘 **Dépannage**

### Problème de liaison

```bash
# Re-lier à Staging
npm run link:staging
```

### Problème de variables

```bash
# Vérifier les variables
cat .env.local
```

### Erreur de migration

```bash
# Voir l'historique
supabase db pull
```

---

## 📞 **Contacts**

- **Staging Dashboard** : [supabase.com/dashboard/project/fepxacqrrjvnvpgzwhyr](https://supabase.com/dashboard/project/fepxacqrrjvnvpgzwhyr)
- **Documentation** : Cette file

---

> **💡 Rappel** : En cas de doute, TOUJOURS vérifier l'environnement avec `supabase projects list` !
