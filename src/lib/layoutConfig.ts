// Design system tokens pour layouts cohérents
export const LAYOUT_CONFIG = {
  container: {
    maxWidth: {
      default: 'max-w-7xl', // Pages standards (1280px)
      wide: 'max-w-[1600px]', // Pages larges (dashboards, landing)
      narrow: 'max-w-4xl', // Formulaires, articles
      full: 'max-w-full', // Fullscreen
    },
    padding: {
      desktop: 'px-6 lg:px-8', // 24px → 32px
      mobile: 'px-4 sm:px-6', // 16px → 24px
      vertical: 'py-8 lg:py-12', // 32px → 48px
    },
  },
  
  spacing: {
    section: 'space-y-8 lg:space-y-12', // Entre sections
    content: 'space-y-6', // Entre contenus
    compact: 'space-y-4', // Contenus serrés
    grid: 'gap-6', // Grilles standards
    gridCompact: 'gap-4', // Grilles serrées
  },
  
  card: {
    padding: {
      default: 'p-6',
      compact: 'p-4',
      large: 'p-8',
    },
    spacing: 'space-y-4',
  },
  
  text: {
    truncate: {
      title: 'line-clamp-2', // Titres max 2 lignes
      description: 'line-clamp-3', // Descriptions max 3 lignes
      single: 'truncate', // 1 ligne avec ...
    },
  },
};
