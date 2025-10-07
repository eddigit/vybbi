-- Temporarily disable the foreign key constraint
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_user_id_fkey;

-- Insert sample artists
INSERT INTO public.profiles (
  user_id, 
  display_name, 
  profile_type, 
  bio, 
  location, 
  genres, 
  experience,
  instagram_url,
  spotify_url,
  soundcloud_url
) VALUES 
(
  'bef868e7-7a4b-4e59-944f-1ff57cccccab',
  'DJ Luna',
  'artist',
  'DJ et productrice électronique passionnée, spécialisée dans la house et la techno. J''ai commencé ma carrière il y a 5 ans et j''ai joué dans de nombreux clubs à Paris.',
  'Paris, France',
  ARRAY['House', 'Techno', 'Deep House'],
  'Plus de 100 performances dans des clubs parisiens renommés. Résidente au Rex Club depuis 2 ans.',
  'https://instagram.com/djluna_official',
  'https://open.spotify.com/artist/djluna',
  'https://soundcloud.com/djluna'
),
(
  '048d6a10-1072-444f-abc3-b18cef7d940f',
  'Marcus Beat',
  'artist',
  'Producteur de hip-hop et rappeur originaire de Lyon. Mon style mélange les sonorités old-school avec des influences modernes.',
  'Lyon, France',
  ARRAY['Hip-Hop', 'Rap', 'Trap'],
  'Artiste depuis 8 ans avec plusieurs albums à mon actif. Collaborations avec des artistes nationaux.',
  'https://instagram.com/marcusbeat_music',
  'https://open.spotify.com/artist/marcusbeat',
  'https://soundcloud.com/marcusbeat'
);

-- Insert sample agents with fictitious user_ids for testing
INSERT INTO public.profiles (
  user_id, 
  display_name, 
  profile_type, 
  bio, 
  location, 
  experience
) VALUES 
(
  '11111111-1111-1111-1111-111111111111',
  'Sophie Dubois',
  'agent',
  'Agent artistique spécialisée dans la musique électronique avec plus de 10 ans d''expérience. Je représente des artistes émergents et établis.',
  'Paris, France',
  'Agente depuis 2014, j''ai organisé plus de 500 événements et géré la carrière de 25+ artistes.'
),
(
  '22222222-2222-2222-2222-222222222222',
  'Alex Martin',
  'agent',
  'Booker et agent pour événements privés et festivals. Expert en négociation de contrats et développement d''artistes.',
  'Marseille, France',
  'Spécialiste des festivals de musique depuis 7 ans. Réseau étendu dans toute l''Europe.'
);

-- Insert sample venues with fictitious user_ids for testing
INSERT INTO public.profiles (
  user_id, 
  display_name, 
  profile_type, 
  bio, 
  location, 
  experience,
  website
) VALUES 
(
  '33333333-3333-3333-3333-333333333333',
  'Le Warehouse',
  'venue',
  'Club emblématique de la scène électronique parisienne. Capacité de 800 personnes, son système de pointe et ambiance underground.',
  'Belleville, Paris',
  'Ouvert depuis 2018, nous avons accueilli les plus grands noms de la scène électronique mondiale.',
  'https://lewarehouse-paris.com'
),
(
  '44444444-4444-4444-4444-444444444444',
  'Jazz Corner',
  'venue',
  'Bar à ambiance feutrée spécialisé dans le jazz et la musique live. Scène intime pour des concerts acoustiques.',
  'Vieux-Port, Marseille',
  'Lieu historique depuis 1995, nous programmons 3 concerts par semaine dans une ambiance chaleureuse.',
  'https://jazzcorner-marseille.fr'
);