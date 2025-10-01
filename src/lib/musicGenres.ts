// Liste complète des genres musicaux pour l'auto-complétion
export const MUSIC_GENRES = [
  // Pop & Mainstream
  'Pop', 'Pop Rock', 'Synth Pop', 'Indie Pop', 'K-Pop', 'J-Pop',
  
  // Rock
  'Rock', 'Hard Rock', 'Punk Rock', 'Alternative Rock', 'Progressive Rock', 
  'Indie Rock', 'Garage Rock', 'Post-Rock', 'Psychedelic Rock',
  
  // Electronic
  'House', 'Techno', 'Trance', 'Dubstep', 'Drum & Bass', 'EDM',
  'Electro', 'Ambient', 'Downtempo', 'IDM', 'Breakbeat', 'UK Garage',
  
  // Hip Hop & Urban
  'Hip Hop', 'Rap', 'Trap', 'Boom Bap', 'R&B', 'Soul', 'Funk',
  'Neo Soul', 'Afrobeat', 'Reggaeton', 'Dancehall',
  
  // Jazz & Blues
  'Jazz', 'Bebop', 'Smooth Jazz', 'Jazz Fusion', 'Blues', 
  'Soul Jazz', 'Acid Jazz', 'Nu Jazz',
  
  // Metal
  'Metal', 'Heavy Metal', 'Death Metal', 'Black Metal', 'Thrash Metal',
  'Power Metal', 'Metalcore', 'Deathcore',
  
  // Latin
  'Salsa', 'Bachata', 'Merengue', 'Cumbia', 'Reggaeton', 
  'Latin Pop', 'Tango', 'Bossa Nova', 'Samba',
  
  // World Music
  'Reggae', 'Ska', 'Dub', 'World Music', 'Celtic', 'Flamenco',
  'Afrobeats', 'Zouk', 'Raï',
  
  // Classique & Traditionnel
  'Classique', 'Baroque', 'Romantique', 'Contemporain',
  'Opéra', 'Chanson Française', 'Variété Française',
  
  // Autres
  'Country', 'Folk', 'Indie', 'Lo-Fi', 'Experimental',
  'Soundtrack', 'Gospel', 'Spiritual'
].sort();

// Top 10 genres les plus populaires (affichés en premier)
export const TOP_GENRES = [
  'Pop',
  'Rock', 
  'Hip Hop',
  'Electronic',
  'R&B',
  'Jazz',
  'Metal',
  'House',
  'Techno',
  'Reggae'
];

export function filterGenres(query: string): string[] {
  if (!query || query.trim().length === 0) {
    return TOP_GENRES;
  }
  
  const lowerQuery = query.toLowerCase();
  const filtered = MUSIC_GENRES.filter(genre => 
    genre.toLowerCase().includes(lowerQuery)
  );
  
  // Si aucun résultat, retourner les top genres
  return filtered.length > 0 ? filtered : TOP_GENRES;
}
