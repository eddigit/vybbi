# Design System - Layout Standards

## Vue d'ensemble

Ce design system garantit une cohérence visuelle parfaite sur toutes les pages de l'application Vybbi.

## Containers

### PageContainer
Composant principal pour wrapper toutes les pages.

```tsx
import { PageContainer } from "@/components/layout/PageContainer";

// Pages standards (listes, recherche, profils)
<PageContainer width="default">...</PageContainer>

// Pages larges (dashboards, landing)
<PageContainer width="wide">...</PageContainer>

// Formulaires, onboarding, articles
<PageContainer width="narrow">...</PageContainer>

// Fullscreen (rare)
<PageContainer width="full">...</PageContainer>
```

### SectionContainer
Pour espacer les sections de contenu de manière cohérente.

```tsx
import { SectionContainer } from "@/components/layout/SectionContainer";

// Espacement entre sections principales
<SectionContainer spacing="section">...</SectionContainer>

// Espacement entre contenus (défaut)
<SectionContainer spacing="content">...</SectionContainer>

// Espacement compact
<SectionContainer spacing="compact">...</SectionContainer>
```

## Cards

### StandardCard
Remplace les Card personnalisées pour une cohérence totale.

```tsx
import { StandardCard } from "@/components/ui/standard-card";

// Card standard avec titre et description
<StandardCard 
  title="Titre" 
  description="Description"
  padding="default"
>
  Contenu
</StandardCard>

// Card compacte
<StandardCard padding="compact">...</StandardCard>

// Card avec hover effect
<StandardCard hover>...</StandardCard>

// Card avec footer
<StandardCard footer={<Button>Action</Button>}>...</StandardCard>
```

## Spacing & Layout Tokens

Tous les espacements utilisent `LAYOUT_CONFIG` de `src/lib/layoutConfig.ts`.

```typescript
import { LAYOUT_CONFIG } from "@/lib/layoutConfig";

// Grilles
className={LAYOUT_CONFIG.spacing.grid} // gap-6
className={LAYOUT_CONFIG.spacing.gridCompact} // gap-4

// Espacement vertical
className={LAYOUT_CONFIG.spacing.section} // space-y-8 lg:space-y-12
className={LAYOUT_CONFIG.spacing.content} // space-y-6
className={LAYOUT_CONFIG.spacing.compact} // space-y-4
```

## Textes - Prévention débordements

**Règle absolue** : Tout texte dynamique DOIT avoir une classe de truncate.

```tsx
// Titres (max 2 lignes)
<h1 className={LAYOUT_CONFIG.text.truncate.title}>...</h1>
// ou directement
<h1 className="line-clamp-2">...</h1>

// Descriptions (max 3 lignes)
<p className={LAYOUT_CONFIG.text.truncate.description}>...</p>
// ou directement
<p className="line-clamp-3">...</p>

// Labels/textes courts (1 ligne)
<span className={LAYOUT_CONFIG.text.truncate.single}>...</span>
// ou directement
<span className="truncate">...</span>
```

## Grilles Responsive

```tsx
// Grille standard (cards, profils)
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  {items.map(...)}
</div>

// Grille compacte (petits items)
<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
  {items.map(...)}
</div>

// Grille large (dashboards metrics)
<div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
  {metrics.map(...)}
</div>
```

## ⚠️ RÈGLES STRICTES - À NE JAMAIS ENFREINDRE

### ❌ INTERDIT
1. `max-w-*` hardcodé directement dans les composants
2. `p-*` ou `px-*` hardcodé sur les containers de page
3. Textes dynamiques sans `truncate`/`line-clamp`
4. `bg-white` ou couleurs hardcodées (utiliser tokens CSS)
5. Paddings différents entre pages similaires
6. Containers sans `PageContainer`

### ✅ OBLIGATOIRE
1. Toujours wrapper les pages avec `<PageContainer>`
2. Toujours utiliser `<StandardCard>` pour les cards
3. Toujours utiliser `LAYOUT_CONFIG` pour spacings
4. Toujours ajouter `truncate`/`line-clamp` sur textes dynamiques
5. Toujours utiliser les tokens CSS pour couleurs
6. Toujours tester responsive mobile (375px, 768px, 1280px)

## Exemples de Migration

### Avant (❌ Inconsistant)
```tsx
export default function MyPage() {
  return (
    <div className="container mx-auto p-6 max-w-[1400px]">
      <h1 className="text-3xl font-bold">{dynamicTitle}</h1>
      <div className="grid grid-cols-3 gap-8 mt-6">
        <Card className="p-8">
          <h2 className="text-xl">{cardTitle}</h2>
          <p>{longDescription}</p>
        </Card>
      </div>
    </div>
  );
}
```

### Après (✅ Standardisé)
```tsx
import { PageContainer } from "@/components/layout/PageContainer";
import { SectionContainer } from "@/components/layout/SectionContainer";
import { StandardCard } from "@/components/ui/standard-card";
import { LAYOUT_CONFIG } from "@/lib/layoutConfig";

export default function MyPage() {
  return (
    <PageContainer width="wide">
      <SectionContainer spacing="content">
        <h1 className="text-3xl font-bold line-clamp-2">{dynamicTitle}</h1>
        
        <div className={cn("grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3", LAYOUT_CONFIG.spacing.grid)}>
          <StandardCard title={cardTitle} padding="default">
            <p className="line-clamp-3">{longDescription}</p>
          </StandardCard>
        </div>
      </SectionContainer>
    </PageContainer>
  );
}
```

## Maintenance

### Modifier un token global
Tous les changements se font dans `src/lib/layoutConfig.ts`.

**Exemple** : Augmenter padding des cards
```typescript
card: {
  padding: {
    default: 'p-8', // était p-6
    // ...
  }
}
```
→ Toutes les cards de l'app se mettent à jour automatiquement.

### Ajouter un nouveau token
```typescript
export const LAYOUT_CONFIG = {
  // ... existant
  button: {
    height: {
      default: 'h-10',
      large: 'h-12',
    }
  }
};
```

## Checklist par Page (Validation)

Avant de valider une page comme "standardisée" :

- [ ] Utilise `<PageContainer>` avec width approprié
- [ ] Tous les spacings utilisent `LAYOUT_CONFIG`
- [ ] Toutes les cards utilisent `<StandardCard>`
- [ ] Tous les textes dynamiques ont `truncate`/`line-clamp`
- [ ] Aucune couleur hardcodée (seulement tokens CSS)
- [ ] Responsive testé sur mobile (375px), tablet (768px), desktop (1280px)
- [ ] Aucun débordement horizontal
- [ ] Padding cohérent avec les autres pages du même type

## Support

Questions ou propositions d'amélioration → Voir `KNOWLEDGE_BASE.md` ou contacter l'équipe dev.
