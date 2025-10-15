# Google Analytics 4 - Documentation

## 📊 Vue d'ensemble

Ce document décrit l'implémentation de Google Analytics 4 (GA4) avec Google Consent Mode v2 pour la plateforme Vybbi, garantissant la conformité RGPD.

## 🏗️ Architecture

### Measurement ID
```
G-DKWTBNGQ47
```

### Composants principaux

1. **Google Consent Mode v2** (`index.html`)
   - Configuration par défaut "denied" pour les régions EEE
   - Fonctions globales de mise à jour du consentement
   - Conforme RGPD

2. **Hook `useGAPageTracking`** (`src/hooks/useGAPageTracking.ts`)
   - Tracking automatique des page_view en SPA
   - Intégration React Router v6
   - Capture du titre et du chemin complet

3. **Composant `CookieConsentBanner`** (`src/components/CookieConsentBanner.tsx`)
   - Interface utilisateur pour le consentement
   - 3 niveaux de consentement (tout / analytics / rien)
   - Persistance dans localStorage
   - Synchronisation avec HubSpot

4. **Page Admin** (`src/pages/AdminAnalyticsHealth.tsx`)
   - Diagnostic en temps réel
   - Tests de consentement
   - Liens vers GA4 Realtime et Reports

## 🔧 Détails techniques

### Google Consent Mode v2

Le Consent Mode est défini **avant** le chargement de gtag.js :

```javascript
gtag('consent', 'default', {
  'ad_storage': 'denied',
  'ad_user_data': 'denied',
  'ad_personalization': 'denied',
  'analytics_storage': 'denied',
  'functionality_storage': 'denied',
  'security_storage': 'granted'
}, {
  region: ['AT','BE','BG','HR','CY','CZ','DK','EE','FI','FR','DE','GR','HU','IS','IE','IT','LV','LI','LT','LU','MT','NL','NO','PL','PT','RO','SK','SI','ES','SE','GB','CH']
});
```

### Fonctions de consentement globales

Trois fonctions sont exposées sur l'objet `window` :

```javascript
// Accepter tous les cookies
window.acceptAll()

// Accepter uniquement les cookies analytiques
window.acceptAnalyticsOnly()

// Refuser tous les cookies
window.refuseAll()
```

### Tracking SPA

Le hook `useGAPageTracking` envoie automatiquement des événements `page_view` :

```typescript
gtag('event', 'page_view', {
  page_path: '/current/path',
  page_title: 'Page Title',
  page_location: 'https://vybbi.app/current/path'
});
```

### Persistance des préférences

Les préférences sont stockées dans `localStorage` sous la clé `vybbi_cookie_preferences` :

```json
{
  "analytics": true,
  "marketing": false,
  "functionality": true
}
```

## 🛡️ Conformité RGPD

### Principes appliqués

1. **Consentement explicite** : Aucun tracking avant consentement
2. **Mode "denied" par défaut** : Pour les régions EEE
3. **Granularité** : L'utilisateur peut choisir le niveau de tracking
4. **Révocation facile** : Possibilité de changer d'avis à tout moment
5. **Transparence** : Explication claire de l'utilisation des cookies

### Régions concernées

Le mode "denied" par défaut s'applique aux pays suivants :
- Tous les pays de l'Union Européenne (27 pays)
- Islande, Liechtenstein, Norvège (EEE)
- Royaume-Uni, Suisse

### Données collectées

**Avec consentement analytics uniquement :**
- Page views (URLs visitées)
- Durée des sessions
- Taux de rebond
- Source de trafic (anonymisé)
- Appareil et navigateur

**Avec consentement complet :**
- Tout ce qui précède +
- Remarketing et publicité personnalisée
- Données utilisateur pour ciblage publicitaire

## 🧪 Tests et vérifications

### 1. Test manuel

#### Vérifier le script GA4
```javascript
console.log(typeof window.gtag); // doit afficher "function"
```

#### Vérifier l'état du consentement
```javascript
window.gtag('get', 'G-DKWTBNGQ47', 'consent', (consent) => {
  console.log(consent);
});
```

### 2. GA4 Realtime

Accéder à : https://analytics.google.com/analytics/web/#/p464099935/realtime/overview

**Ce qu'on doit voir :**
- Utilisateurs actifs en temps réel
- Pages vues
- Événements déclenchés

### 3. DebugView

Pour activer le mode debug, ajouter `?debug_mode=true` à l'URL.

Accéder à : GA4 > Configure > DebugView

**Ce qu'on doit voir :**
- Événements `page_view` à chaque navigation
- Paramètres `page_path` et `page_title`
- État du consentement (`consent` object)

### 4. Extension Chrome

Installer [Google Analytics Debugger](https://chrome.google.com/webstore/detail/google-analytics-debugger) :
- Active automatiquement les logs de débogage
- Affiche tous les hits GA dans la console

### 5. Page Admin

Accéder à : https://vybbi.app/admin/analytics-health

**Tests disponibles :**
- ✅ Vérification du chargement du script
- 📊 État actuel du consentement
- 🔘 Boutons de test (acceptAll, analyticsOnly, refuseAll)
- 🔗 Liens vers GA4 Realtime et Reports

## 📝 Scénarios de test

### Scénario 1 : Premier visiteur

1. Hard refresh (Ctrl+Shift+R)
2. ✅ Le bandeau de consentement apparaît
3. ✅ Aucun hit GA4 envoyé (mode "denied")
4. Cliquer "Accepter analytics"
5. ✅ Le bandeau disparaît
6. ✅ Un `page_view` est envoyé immédiatement
7. Naviguer vers une autre page
8. ✅ Un nouveau `page_view` est envoyé

### Scénario 2 : Visiteur récurrent

1. Recharger la page
2. ✅ Le bandeau n'apparaît pas
3. ✅ Le tracking est actif automatiquement
4. ✅ `page_view` envoyé au chargement

### Scénario 3 : Changement de consentement

1. Accéder à `/admin/analytics-health`
2. Cliquer "Réinitialiser les préférences"
3. ✅ La page recharge
4. ✅ Le bandeau réapparaît
5. Tester les différents boutons

## 🔍 Troubleshooting

### Le script GA4 ne se charge pas

**Symptôme :** `window.gtag` est `undefined`

**Solutions :**
1. Vérifier que le script est dans `<head>` de `index.html`
2. Vérifier la connexion internet
3. Vérifier qu'aucun bloqueur de pub n'est actif
4. Vérifier la console pour les erreurs de chargement

### Aucun événement dans GA4 Realtime

**Symptôme :** GA4 Realtime affiche 0 utilisateurs

**Solutions :**
1. Vérifier que le consentement est accordé :
   ```javascript
   window.gtag('get', 'G-DKWTBNGQ47', 'consent', console.log);
   ```
2. Vérifier que les events sont envoyés (Console Network > filter "collect")
3. Attendre 10-30 secondes (délai de traitement GA4)
4. Vérifier le Measurement ID

### Le bandeau ne s'affiche pas

**Symptôme :** Le bandeau de consentement n'apparaît jamais

**Solutions :**
1. Vérifier `localStorage.getItem('vybbi_cookie_preferences')`
2. Si présent, le supprimer : `localStorage.removeItem('vybbi_cookie_preferences')`
3. Recharger la page
4. Vérifier la console pour les erreurs React

### Les page_view ne sont pas trackés en SPA

**Symptôme :** Seul le premier `page_view` est envoyé

**Solutions :**
1. Vérifier que `<GAPageTracker />` est bien dans `App.tsx`
2. Vérifier la console pour les erreurs
3. Vérifier que React Router est configuré
4. Tester manuellement :
   ```javascript
   window.gtag('event', 'page_view', { page_path: '/test' });
   ```

## 🔗 Ressources utiles

### Officielles Google

- [Documentation GA4](https://developers.google.com/analytics/devguides/collection/ga4)
- [Consent Mode v2](https://developers.google.com/tag-platform/security/guides/consent)
- [gtag.js Reference](https://developers.google.com/tag-platform/gtagjs/reference)

### Outils

- [GA4 Realtime](https://analytics.google.com/analytics/web/#/p464099935/realtime/overview)
- [GA4 Reports](https://analytics.google.com/analytics/web/#/p464099935/reports/intelligenthome)
- [Google Tag Assistant](https://tagassistant.google.com/)
- [GA Debugger Extension](https://chrome.google.com/webstore/detail/google-analytics-debugger)

### Vybbi spécifique

- Page admin : `/admin/analytics-health`
- Code source : `src/hooks/useGAPageTracking.ts`
- Bandeau cookies : `src/components/CookieConsentBanner.tsx`

## 📊 Métriques importantes à surveiller

### Performance

- **Temps de chargement** : Le script ne doit pas ralentir le site
- **Taux de consentement** : % d'utilisateurs qui acceptent les cookies
- **Taux d'adoption** : % d'utilisateurs trackés

### Analytics

- **Page views** : Nombre de pages vues
- **Sessions** : Durée moyenne des sessions
- **Bounce rate** : Taux de rebond
- **Conversion events** : Événements personnalisés (à venir)

## 🚀 Prochaines étapes

### Événements personnalisés

Ajouter des événements métier :

```javascript
// Exemple : Tracking d'inscription
window.gtag('event', 'sign_up', {
  method: 'email',
  user_type: 'artist'
});

// Exemple : Tracking de réservation
window.gtag('event', 'booking_request', {
  venue_id: 'xyz',
  artist_id: 'abc'
});
```

### Intégration API GA4 Data

Pour afficher les stats dans l'admin :
1. Activer Google Analytics Data API
2. Créer un Service Account
3. Créer un endpoint backend Node.js
4. Afficher les métriques dans un dashboard React

### Enhanced Measurement

Activer dans GA4 les mesures améliorées :
- Scroll tracking
- File downloads
- Outbound clicks
- Video engagement

## 💡 Bonnes pratiques

1. **Ne jamais tracker d'informations personnelles** : Pas d'emails, noms, etc.
2. **Utiliser des événements sémantiques** : Suivre les conventions GA4
3. **Tester en mode debug** : Toujours vérifier avant de déployer
4. **Documenter les événements custom** : Maintenir une liste à jour
5. **Respecter le consentement** : Ne jamais contourner le Consent Mode

## ❓ FAQ

### Pourquoi "denied" par défaut ?

C'est une exigence RGPD pour les visiteurs européens. Sans consentement explicite, aucun tracking personnalisé n'est autorisé.

### Que se passe-t-il en mode "denied" ?

GA4 envoie des "pings" anonymisés sans cookies, permettant de mesurer le trafic global sans identifier les utilisateurs.

### Peut-on tracker sans consentement ?

Non. Le RGPD impose un consentement explicite pour tout tracking non essentiel.

### Combien de temps sont conservées les données GA4 ?

Par défaut : 2 mois pour les données utilisateur, 14 mois pour les événements.

### Comment supprimer les données d'un utilisateur ?

Via GA4 Admin > Data Settings > Data Deletion Requests

---

**Dernière mise à jour :** 15 octobre 2025  
**Maintainer :** Équipe Tech Vybbi  
**Contact :** tech@vybbi.app
