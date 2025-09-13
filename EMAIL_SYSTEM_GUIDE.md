# Guide de Développement - Système Email Vybbi

## 🎯 Objectif
Ce guide documente l'implémentation du système email "propre avec des templates facilement modifiables" via Brevo.

## 🏗️ Architecture Mise en Place

### 1. Provider System
Le système email supporte maintenant deux providers :

#### Provider "internal"
- Templates HTML stockés en base dans `email_templates.html_content`
- Édition via l'interface admin avec drag-and-drop
- Variables remplacées côté serveur : `{{userName}}` → valeur

#### Provider "brevo" 
- Templates gérés dans l'interface Brevo
- Sélection du template via `email_templates.brevo_template_id`
- Paramètres envoyés via l'API Brevo
- Variables gérées par Brevo : `{{params.userName}}`

### 2. Base de Données

#### Migration Appliquée
```sql
-- Ajout des colonnes provider dans email_templates
ALTER TABLE email_templates 
ADD COLUMN provider TEXT DEFAULT 'internal' CHECK (provider IN ('internal', 'brevo'));

ALTER TABLE email_templates 
ADD COLUMN brevo_template_id INTEGER;

ALTER TABLE email_templates 
ADD COLUMN required_variables JSONB;
```

#### Structure Finale
```typescript
interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  html_content: string;  // Utilisé pour provider='internal'
  type: string;
  provider: 'internal' | 'brevo';
  brevo_template_id?: number;  // ID du template Brevo
  required_variables?: string[];  // Variables obligatoires
  // ... autres champs
}
```

### 3. Edge Function `send-notification`

#### Logique de Routage
```typescript
// 1. Récupération du template
const template = await supabase
  .from('email_templates')
  .select('subject, html_content, provider, brevo_template_id, required_variables')
  .eq('type', type)
  .single();

// 2. Routage selon le provider
if (template.provider === 'brevo' && template.brevo_template_id) {
  // Envoi via template Brevo
  await fetch('https://api.brevo.com/v3/smtp/email', {
    body: JSON.stringify({
      templateId: template.brevo_template_id,
      to: [{ email: to }],
      params: data,  // Variables injectées par Brevo
    })
  });
} else {
  // Envoi HTML classique
  await fetch('https://api.brevo.com/v3/smtp/email', {
    body: JSON.stringify({
      to: [{ email: to }],
      subject: processedSubject,
      htmlContent: processedHtml,  // Variables remplacées côté serveur
    })
  });
}
```

### 4. Interface Admin

#### EmailTemplateManager Updates
- **Sélection Provider** : Dropdown "Interne" / "Brevo"
- **Template Brevo** : Dropdown alimenté par l'edge function `brevo-templates`
- **Éditeur Conditionnel** :
  - Provider "internal" → Drag-and-drop HTML editor
  - Provider "brevo" → Sélecteur de template + guidance

#### Workflow Utilisateur
1. **Créer template** → Choisir provider
2. **Si Brevo** → Sélectionner template existant dans Brevo
3. **Si Interne** → Éditer HTML avec l'éditeur
4. **Sauvegarder** → Template prêt à l'usage
5. **Tester** → Envoi d'email de test

## 🔧 Utilisation Pratique

### Créer un Template Brevo
```typescript
// 1. Créer le template dans l'interface Brevo avec variables {{params.userName}}
// 2. Noter l'ID du template (ex: 42)
// 3. Dans l'admin Vybbi :
{
  name: "Bienvenue Brevo",
  type: "user_registration", 
  provider: "brevo",
  brevo_template_id: 42,
  subject: "Bienvenue {{params.userName}} !",  // Optionnel, peut override Brevo
  required_variables: ["userName", "userEmail"]
}
```

### Envoyer un Email
```typescript
// Côté client - même API qu'avant
await supabase.functions.invoke('send-notification', {
  body: {
    type: 'user_registration',
    to: 'user@example.com',
    data: {
      userName: 'John Doe',
      userEmail: 'user@example.com'
    }
  }
});

// L'edge function route automatiquement selon le provider du template
```

### Variables et Validation
```typescript
// Si required_variables défini, validation automatique
{
  required_variables: ["userName", "userEmail"],
  // Si data ne contient pas ces clés → erreur 400
}
```

## 🚀 Avantages de cette Architecture

### ✅ Flexibilité
- **Marketeurs** : Peuvent éditer templates complexes dans Brevo
- **Développeurs** : Gardent le contrôle avec templates internes
- **Migration Progressive** : Ancien système reste compatible

### ✅ Maintenabilité  
- **API Unifiée** : `send-notification` pour tous les emails
- **Type Safety** : Types TypeScript pour tous les paramètres
- **Validation** : Variables requises vérifiées automatiquement

### ✅ Facilité d'Usage
- **Interface Admin** : Point unique pour gérer tous les templates
- **Test Intégré** : Envoi de test depuis l'interface
- **Fallback** : Templates hardcodés si pas en base

## 🔄 Migration des Templates Existants

### Étapes Recommandées
1. **Audit** : Lister tous les types d'email actuels
2. **Création Brevo** : Créer templates dans Brevo pour emails complexes
3. **Configuration** : Ajouter les templates via l'admin UI
4. **Test** : Valider chaque template
5. **Mise en Production** : Basculer progressivement

### Templates Prioritaires pour Brevo
- Newsletters (design complexe)
- Emails marketing/promotionnels  
- Notifications utilisateur avec branding

### Garder en Interne
- Emails système simples
- Notifications admin
- Emails transactionnels basiques

## 🐛 Debugging

### Logs Edge Function
```typescript
console.log(`Sending ${type} email via ${useBrevoTemplate ? 'Brevo template' : 'HTML'}`);
console.log(`Template ID: ${brevoTemplateId}, Subject: ${subject}`);
```

### Erreurs Communes
- **Template not found** : Vérifier `type` et `is_active=true`
- **Brevo API error** : Vérifier `BREVO_API_KEY` et template ID
- **Variables manquantes** : Vérifier `required_variables` vs `data`

### Test en Local
```bash
# Vérifier les templates
curl http://localhost:54321/functions/v1/brevo-templates

# Test d'envoi
curl -X POST http://localhost:54321/functions/v1/send-notification \
  -H "Content-Type: application/json" \
  -d '{"type":"user_registration","to":"test@example.com","data":{"userName":"Test"}}'
```

---

*Guide créé le 13 septembre 2025 suite à l'implémentation du système email hybride.*
