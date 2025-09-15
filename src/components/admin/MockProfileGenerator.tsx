import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface MockProfile {
  display_name: string;
  profile_type: 'artist' | 'lieu' | 'agent' | 'manager';
  bio: string;
  location: string;
  genres?: string[];
  avatar_url?: string;
}

const MOCK_NAMES = {
  artist: [
    'Luna Martinez', 'Alex Rivers', 'Maya Singh', 'Jordan Blake', 'Sofia Chen',
    'Marcus Johnson', 'Elena Rossi', 'Noah Williams', 'Aria Patel', 'Diego Santos'
  ],
  lieu: [
    'The Underground', 'Skyline Club', 'Crystal Palace', 'The Warehouse', 'Neon Dreams',
    'Blue Moon Venue', 'Electric Garden', 'The Loft', 'Midnight Club', 'Aurora Hall'
  ],
  agent: [
    'Patricia Anderson', 'Michael Brown', 'Sarah Davis', 'Robert Wilson', 'Jennifer Miller',
    'David Garcia', 'Lisa Rodriguez', 'James Martinez', 'Karen Lee', 'Thomas Taylor'
  ],
  manager: [
    'Amanda Clark', 'Christopher Lewis', 'Michelle Walker', 'Andrew Hall', 'Nicole Young',
    'Kevin Allen', 'Rachel Green', 'Steven Adams', 'Laura White', 'Daniel King'
  ]
};

const GENRES = [
  'Pop', 'Rock', 'Hip-Hop', 'Electronic', 'Jazz', 'Blues', 'R&B', 'Country', 
  'Classical', 'Alternative', 'Indie', 'Funk', 'Reggae', 'Latin', 'World'
];

const LOCATIONS = [
  'Paris', 'Lyon', 'Marseille', 'Toulouse', 'Nice', 'Nantes', 'Strasbourg',
  'Montpellier', 'Bordeaux', 'Lille', 'Rennes', 'Reims', 'Le Havre', 'Toulon'
];

export default function MockProfileGenerator() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [config, setConfig] = useState({
    artistCount: 20,
    venueCount: 10,
    agentCount: 5,
    managerCount: 5,
  });

  const generateAvatar = async (profileType: string, description: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('generate-ai-avatar', {
        body: { 
          prompt: description,
          profileType,
          seed: Math.random().toString()
        }
      });

      if (error) throw error;
      return data.imageUrl;
    } catch (error) {
      console.error('Avatar generation failed:', error);
      return null;
    }
  };

  const createMockProfile = async (mockData: MockProfile) => {
    try {
      // Create user first (this is a simplified approach - in production you'd want proper auth)
      const randomEmail = `mock_${Date.now()}_${Math.random().toString(36).substring(7)}@vybbi.com`;
      
      // Create profile directly (bypassing auth for mocks)
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .insert({
          display_name: mockData.display_name,
          profile_type: mockData.profile_type,
          bio: mockData.bio,
          location: mockData.location,
          genres: mockData.genres || [],
          avatar_url: mockData.avatar_url,
          is_public: true,
          email: randomEmail,
          user_id: crypto.randomUUID() // Mock user ID
        })
        .select()
        .single();

      if (profileError) throw profileError;

      // Track as mock profile
      const { error: mockError } = await supabase
        .from('admin_mock_profiles')
        .insert({
          profile_id: profile.id,
          profile_type: mockData.profile_type,
          ai_generated_data: mockData as any
        });

      if (mockError) throw mockError;

      return profile;
    } catch (error) {
      console.error('Profile creation failed:', error);
      throw error;
    }
  };

  const generateMockProfiles = async () => {
    setIsGenerating(true);
    setProgress(0);

    const totalProfiles = config.artistCount + config.venueCount + config.agentCount + config.managerCount;
    let currentProgress = 0;

    try {
      // Generate artists
      for (let i = 0; i < config.artistCount; i++) {
        const name = MOCK_NAMES.artist[i % MOCK_NAMES.artist.length];
        const genres = GENRES.slice(0, 2 + Math.floor(Math.random() * 3));
        
        const bio = `Artiste passionné·e de ${genres.join(' et ')}, ${name} apporte une énergie unique à chaque performance. Avec plusieurs années d'expérience sur scène, cet·te artiste sait captiver son public.`;
        
        const avatar_url = await generateAvatar('artist', `${genres[0]} musician, creative person`);
        
        await createMockProfile({
          display_name: name,
          profile_type: 'artist',
          bio,
          location: LOCATIONS[Math.floor(Math.random() * LOCATIONS.length)],
          genres,
          avatar_url
        });

        currentProgress++;
        setProgress((currentProgress / totalProfiles) * 100);
      }

      // Generate venues
      for (let i = 0; i < config.venueCount; i++) {
        const name = MOCK_NAMES.lieu[i % MOCK_NAMES.lieu.length];
        const capacity = 50 + Math.floor(Math.random() * 500);
        
        const bio = `${name} est un lieu incontournable de la scène musicale locale. Avec une capacité de ${capacity} personnes, nous accueillons des artistes de tous horizons dans une ambiance chaleureuse et professionnelle.`;
        
        const avatar_url = await generateAvatar('lieu', 'modern music venue, concert hall');
        
        await createMockProfile({
          display_name: name,
          profile_type: 'lieu',
          bio,
          location: LOCATIONS[Math.floor(Math.random() * LOCATIONS.length)],
          avatar_url
        });

        currentProgress++;
        setProgress((currentProgress / totalProfiles) * 100);
      }

      // Generate agents
      for (let i = 0; i < config.agentCount; i++) {
        const name = MOCK_NAMES.agent[i % MOCK_NAMES.agent.length];
        
        const bio = `Agent artistique expérimenté·e, ${name} accompagne les talents émergents et confirmés dans leur développement professionnel. Spécialisé·e dans la négociation et le booking, je mets mon réseau au service de vos projets.`;
        
        const avatar_url = await generateAvatar('agent', 'professional music industry agent');
        
        await createMockProfile({
          display_name: name,
          profile_type: 'agent',
          bio,
          location: LOCATIONS[Math.floor(Math.random() * LOCATIONS.length)],
          avatar_url
        });

        currentProgress++;
        setProgress((currentProgress / totalProfiles) * 100);
      }

      // Generate managers
      for (let i = 0; i < config.managerCount; i++) {
        const name = MOCK_NAMES.manager[i % MOCK_NAMES.manager.length];
        
        const bio = `Manager artistique passionné·e, ${name} accompagne les artistes dans tous les aspects de leur carrière. De la stratégie artistique au développement commercial, je suis là pour faire grandir votre projet musical.`;
        
        const avatar_url = await generateAvatar('manager', 'professional music manager');
        
        await createMockProfile({
          display_name: name,
          profile_type: 'manager',
          bio,
          location: LOCATIONS[Math.floor(Math.random() * LOCATIONS.length)],
          avatar_url
        });

        currentProgress++;
        setProgress((currentProgress / totalProfiles) * 100);
      }

      toast.success(`${totalProfiles} profils mocks générés avec succès !`);
    } catch (error) {
      console.error('Generation failed:', error);
      toast.error('Erreur lors de la génération des profils');
    } finally {
      setIsGenerating(false);
      setProgress(0);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Générateur de Profils Mocks</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <Label htmlFor="artistCount">Artistes</Label>
            <Input
              id="artistCount"
              type="number"
              value={config.artistCount}
              onChange={(e) => setConfig(prev => ({ ...prev, artistCount: parseInt(e.target.value) || 0 }))}
              min="0"
              max="50"
            />
          </div>
          <div>
            <Label htmlFor="venueCount">Lieux</Label>
            <Input
              id="venueCount"
              type="number"
              value={config.venueCount}
              onChange={(e) => setConfig(prev => ({ ...prev, venueCount: parseInt(e.target.value) || 0 }))}
              min="0"
              max="25"
            />
          </div>
          <div>
            <Label htmlFor="agentCount">Agents</Label>
            <Input
              id="agentCount"
              type="number"
              value={config.agentCount}
              onChange={(e) => setConfig(prev => ({ ...prev, agentCount: parseInt(e.target.value) || 0 }))}
              min="0"
              max="15"
            />
          </div>
          <div>
            <Label htmlFor="managerCount">Managers</Label>
            <Input
              id="managerCount"
              type="number"
              value={config.managerCount}
              onChange={(e) => setConfig(prev => ({ ...prev, managerCount: parseInt(e.target.value) || 0 }))}
              min="0"
              max="15"
            />
          </div>
        </div>

        {isGenerating && (
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span>Génération en cours...</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="w-full" />
          </div>
        )}

        <Button 
          onClick={generateMockProfiles}
          disabled={isGenerating}
          className="w-full"
          size="lg"
        >
          {isGenerating ? 'Génération en cours...' : 'Générer les Profils Mocks'}
        </Button>

        <div className="text-sm text-muted-foreground">
          <p>⚠️ Cette action va créer {config.artistCount + config.venueCount + config.agentCount + config.managerCount} nouveaux profils avec des avatars générés par IA.</p>
          <p>📸 La génération d'avatars peut prendre plusieurs minutes.</p>
        </div>
      </CardContent>
    </Card>
  );
}