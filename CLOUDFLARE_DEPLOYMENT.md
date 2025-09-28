# Déploiement Vybbi sur Cloudflare Pages

## Configuration requise

### 1. Variables d'environnement
Configurez ces variables dans l'interface Cloudflare Pages :

```
VITE_SUPABASE_PROJECT_ID=votre_project_id
VITE_SUPABASE_PUBLISHABLE_KEY=votre_publishable_key
VITE_SUPABASE_URL=votre_supabase_url
```

### 2. Configuration de build
- **Framework preset**: Vite
- **Build command**: `npm run build`
- **Build output directory**: `dist`
- **Root directory**: `/` (racine du projet)

### 3. Compatibilité Node.js
- **Node.js version**: 18.x ou supérieure

## Étapes de déploiement

### 1. Connecter le repository
1. Allez sur [Cloudflare Pages](https://pages.cloudflare.com/)
2. Cliquez sur "Create a project"
3. Connectez votre repository GitHub
4. Sélectionnez le repository Vybbi

### 2. Configuration du projet
1. **Project name**: `vybbi`
2. **Production branch**: `main`
3. **Framework preset**: Vite
4. **Build command**: `npm run build`
5. **Build output directory**: `dist`

### 3. Variables d'environnement
1. Allez dans Settings > Environment variables
2. Ajoutez les variables listées ci-dessus
3. Assurez-vous qu'elles sont définies pour "Production" et "Preview"

### 4. Domaine personnalisé
1. Allez dans Custom domains
2. Ajoutez votre domaine
3. Configurez les enregistrements DNS selon les instructions

## Fonctionnalités incluses

- ✅ PWA (Progressive Web App)
- ✅ Service Worker pour le cache
- ✅ Routage SPA avec `_redirects`
- ✅ Headers de sécurité avec `_headers`
- ✅ Cache optimisé pour les assets
- ✅ Compression automatique
- ✅ CDN global Cloudflare

## Optimisations

### Cache
- Assets statiques : 1 an
- Service Worker : pas de cache
- Manifest PWA : 1 jour

### Sécurité
- Headers de sécurité configurés
- Protection XSS
- Politique de permissions restrictive

### Performance
- Compression automatique
- CDN global
- Cache intelligent
- Optimisation des images

## Surveillance

### Logs
Consultez les logs de build et de runtime dans l'interface Cloudflare Pages.

### Analytics
Activez Cloudflare Analytics pour surveiller les performances.

### Monitoring
Configurez des alertes pour surveiller la disponibilité.

## Dépannage

### Build qui échoue
1. Vérifiez les logs de build
2. Assurez-vous que toutes les variables d'environnement sont définies
3. Vérifiez la version Node.js

### Erreurs de routage
1. Vérifiez le fichier `_redirects`
2. Assurez-vous que le SPA routing fonctionne

### Problèmes de cache
1. Purgez le cache Cloudflare
2. Vérifiez les headers de cache dans `_headers`