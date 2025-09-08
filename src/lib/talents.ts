export interface Talent {
  id: string;
  label: string;
  icon: string;
  category: 'music' | 'performance' | 'production';
}

export const TALENTS: Talent[] = [
  // Musique
  { id: 'musician', label: 'Musicien', icon: '🎵', category: 'music' },
  { id: 'singer', label: 'Chanteur/se', icon: '🎤', category: 'music' },
  { id: 'guitarist', label: 'Guitariste', icon: '🎸', category: 'music' },
  { id: 'pianist', label: 'Pianiste', icon: '🎹', category: 'music' },
  { id: 'drummer', label: 'Batteur/se', icon: '🥁', category: 'music' },
  { id: 'violinist', label: 'Violoniste', icon: '🎻', category: 'music' },
  { id: 'saxophonist', label: 'Saxophoniste', icon: '🎷', category: 'music' },
  { id: 'trumpeter', label: 'Trompettiste', icon: '🎺', category: 'music' },
  
  // Performance
  { id: 'dj', label: 'DJ', icon: '🎧', category: 'performance' },
  { id: 'dancer', label: 'Danseur/se', icon: '💃', category: 'performance' },
  { id: 'performer', label: 'Performeur/se', icon: '🎭', category: 'performance' },
  { id: 'mc', label: 'MC/Animateur', icon: '🎙️', category: 'performance' },
  { id: 'comedian', label: 'Comédien/ne', icon: '😂', category: 'performance' },
  { id: 'magician', label: 'Magicien/ne', icon: '🎩', category: 'performance' },
  
  // Production
  { id: 'producer', label: 'Producteur', icon: '🎚️', category: 'production' },
  { id: 'sound_engineer', label: 'Ingénieur son', icon: '🔊', category: 'production' },
  { id: 'composer', label: 'Compositeur', icon: '✍️', category: 'production' },
  { id: 'arranger', label: 'Arrangeur', icon: '🎼', category: 'production' },
  { id: 'beatmaker', label: 'Beatmaker', icon: '🥊', category: 'production' },
  { id: 'mixing_engineer', label: 'Mixeur', icon: '🎛️', category: 'production' },
];

export const TALENT_CATEGORIES = [
  { id: 'music', label: 'Musique', icon: '🎵' },
  { id: 'performance', label: 'Performance', icon: '🎭' },
  { id: 'production', label: 'Production', icon: '🎚️' },
] as const;

export const getTalentById = (id: string): Talent | undefined => {
  return TALENTS.find(talent => talent.id === id);
};

export const getTalentsByCategory = (category: string): Talent[] => {
  return TALENTS.filter(talent => talent.category === category);
};