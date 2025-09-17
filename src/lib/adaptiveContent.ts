import { getTalentById, TALENTS } from './talents';

export interface AdaptiveContent {
  title: string;
  icon: string;
  trackTerm: string; // "morceaux", "performances", "sets", etc.
  albumTerm: string; // "albums", "spectacles", "collections", etc.
  emptyMessage: string;
}

export function getContentByTalents(talentIds: string[] = []): AdaptiveContent {
  if (!talentIds || talentIds.length === 0) {
    return {
      title: 'Contenu',
      icon: '🎭',
      trackTerm: 'créations',
      albumTerm: 'collections',
      emptyMessage: 'Aucun contenu pour le moment'
    };
  }

  // Get talent objects from IDs
  const talents = talentIds.map(id => getTalentById(id)).filter(Boolean);
  const categories = [...new Set(talents.map(t => t!.category))];

  // Determine primary category based on most common talents
  let primaryCategory = 'music'; // default
  
  if (categories.length === 1) {
    primaryCategory = categories[0];
  } else {
    // If multiple categories, prioritize based on most specific talents
    const categoryCount = categories.reduce((acc, cat) => {
      acc[cat] = talents.filter(t => t!.category === cat).length;
      return acc;
    }, {} as Record<string, number>);
    
    primaryCategory = Object.entries(categoryCount)
      .sort(([,a], [,b]) => b - a)[0][0];
  }

  // Check for specific talent combinations
  const talentLabels = talents.map(t => t!.id.toLowerCase());
  
  // DJ/Producer specific
  if (talentLabels.includes('dj') || talentLabels.includes('producer') || talentLabels.includes('beatmaker')) {
    return {
      title: 'Sets & Productions',
      icon: '🎧',
      trackTerm: 'tracks',
      albumTerm: 'mixes',
      emptyMessage: 'Aucun set ou production pour le moment'
    };
  }
  
  // Dancer specific
  if (talentLabels.includes('dancer')) {
    return {
      title: 'Performances',
      icon: '💃',
      trackTerm: 'performances',
      albumTerm: 'spectacles',
      emptyMessage: 'Aucune performance pour le moment'
    };
  }
  
  // Performer/MC/Comedian specific
  if (talentLabels.includes('performer') || talentLabels.includes('mc') || talentLabels.includes('comedian') || talentLabels.includes('magician')) {
    return {
      title: 'Spectacles',
      icon: '🎭',
      trackTerm: 'performances',
      albumTerm: 'spectacles',
      emptyMessage: 'Aucun spectacle pour le moment'
    };
  }

  // Based on primary category
  switch (primaryCategory) {
    case 'music':
      return {
        title: 'Discographie',
        icon: '🎵',
        trackTerm: 'morceaux',
        albumTerm: 'albums',
        emptyMessage: 'Aucune sortie musicale pour le moment'
      };
      
    case 'performance':
      return {
        title: 'Performances',
        icon: '🎭',
        trackTerm: 'performances',
        albumTerm: 'spectacles',
        emptyMessage: 'Aucune performance pour le moment'
      };
      
    case 'production':
      return {
        title: 'Productions',
        icon: '🎚️',
        trackTerm: 'productions',
        albumTerm: 'projets',
        emptyMessage: 'Aucune production pour le moment'
      };
      
    default:
      return {
        title: 'Discographie',
        icon: '🎵',
        trackTerm: 'morceaux',
        albumTerm: 'albums',
        emptyMessage: 'Aucune sortie musicale pour le moment'
      };
  }
}