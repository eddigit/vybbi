import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

const COMMUNITY_SEEDS = [
  {
    name: 'Artistes Émergents',
    description: 'Communauté dédiée aux nouveaux talents qui souhaitent partager leurs créations et obtenir des retours constructifs.',
    category: 'Musique',
    type: 'public',
    channels: [
      { name: 'général', description: 'Discussions générales entre artistes' },
      { name: 'partage-créations', description: 'Partagez vos dernières compositions' },
      { name: 'conseils-techniques', description: 'Échanges sur les techniques de production' },
      { name: 'opportunités', description: 'Annonces de concerts et collaborations' }
    ]
  },
  {
    name: 'Organisateurs d\'Événements',
    description: 'Espace pour les organisateurs de concerts, festivals et événements musicaux.',
    category: 'Événements',
    type: 'public',
    channels: [
      { name: 'général', description: 'Discussions générales entre organisateurs' },
      { name: 'recherche-artistes', description: 'Postez vos recherches d\'artistes' },
      { name: 'retours-événements', description: 'Partagez vos expériences' },
      { name: 'bonnes-pratiques', description: 'Conseils et astuces d\'organisation' }
    ]
  },
  {
    name: 'Professionnels du Son',
    description: 'Communauté regroupant les ingénieurs du son, producteurs et techniciens audio.',
    category: 'Technique',
    type: 'public',
    channels: [
      { name: 'général', description: 'Discussions générales sur l\'audio' },
      { name: 'matériel', description: 'Conseils sur le matériel audio' },
      { name: 'techniques-mixage', description: 'Partage de techniques de mixage' },
      { name: 'opportunités-emploi', description: 'Offres d\'emploi dans l\'audio' }
    ]
  },
  {
    name: 'Musique Électronique',
    description: 'Dédiée aux passionnés de musique électronique, producteurs et DJ.',
    category: 'Genre Musical',
    type: 'public',
    channels: [
      { name: 'général', description: 'Discussions sur la musique électronique' },
      { name: 'production', description: 'Techniques de production électronique' },
      { name: 'mix-sets', description: 'Partagez vos mix et sets DJ' },
      { name: 'événements-électro', description: 'Annonces de soirées et festivals' }
    ]
  },
  {
    name: 'Musique Acoustique',
    description: 'Pour les amoureux des instruments acoustiques et des performances live.',
    category: 'Genre Musical',
    type: 'public',
    channels: [
      { name: 'général', description: 'Discussions sur la musique acoustique' },
      { name: 'instruments', description: 'Conseils sur les instruments acoustiques' },
      { name: 'techniques-jeu', description: 'Partage de techniques instrumentales' },
      { name: 'sessions-live', description: 'Organisation de sessions acoustiques' }
    ]
  }
];

const SAMPLE_MESSAGES = [
  'Bienvenue dans cette communauté ! N\'hésitez pas à vous présenter et à partager vos projets.',
  'Excellente initiative de créer cet espace d\'échange ! Hâte de voir les discussions qui vont naître ici.',
  'Merci pour cette communauté, c\'était vraiment nécessaire sur Vybbi !',
  'Super ! J\'ai hâte de pouvoir échanger avec d\'autres passionnés.',
  'Cette communauté va vraiment aider à créer du lien dans notre secteur.'
];

export default function CommunitySeeder() {
  const [isSeeding, setIsSeeding] = useState(false);
  const [progress, setProgress] = useState(0);

  const seedCommunities = async () => {
    setIsSeeding(true);
    setProgress(0);

    try {
      for (let i = 0; i < COMMUNITY_SEEDS.length; i++) {
        const communityData = COMMUNITY_SEEDS[i];
        
        // Create community
        const { data: community, error: communityError } = await supabase
          .from('communities')
          .insert({
            name: communityData.name,
            description: communityData.description,
            category: communityData.category,
            type: communityData.type,
            is_active: true
          })
          .select()
          .single();

        if (communityError) throw communityError;

        // Create channels for the community
        for (const channelData of communityData.channels) {
          const { error: channelError } = await supabase
            .from('community_channels')
            .insert({
              community_id: community.id,
              name: channelData.name,
              description: channelData.description,
              type: 'text'
            });

          if (channelError) throw channelError;
        }

        // Add some initial messages to the general channel
        const { data: generalChannel } = await supabase
          .from('community_channels')
          .select('id')
          .eq('community_id', community.id)
          .eq('name', 'général')
          .single();

        if (generalChannel) {
          // Add sample messages from system/admin
          for (let j = 0; j < 2; j++) {
            const messageContent = SAMPLE_MESSAGES[j % SAMPLE_MESSAGES.length];
            
            const { error: messageError } = await supabase
              .from('community_messages')
              .insert({
                channel_id: generalChannel.id,
                sender_id: crypto.randomUUID(), // Mock sender
                content: messageContent,
                message_type: 'text'
              });

            if (messageError) console.warn('Message creation failed:', messageError);
          }
        }

        setProgress(((i + 1) / COMMUNITY_SEEDS.length) * 100);
      }

      toast.success(`${COMMUNITY_SEEDS.length} communautés créées avec succès !`);
    } catch (error) {
      console.error('Community seeding failed:', error);
      toast.error('Erreur lors de la création des communautés');
    } finally {
      setIsSeeding(false);
      setProgress(0);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Initialisation des Communautés</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Cette action va créer {COMMUNITY_SEEDS.length} communautés par défaut avec leurs canaux de discussion et quelques messages d'accueil.
          </p>

          <div className="grid gap-3">
            {COMMUNITY_SEEDS.map((community, index) => (
              <div key={index} className="p-3 border rounded-lg">
                <h4 className="font-medium">{community.name}</h4>
                <p className="text-sm text-muted-foreground mb-2">{community.description}</p>
                <p className="text-xs text-muted-foreground">
                  Canaux: {community.channels.map(c => c.name).join(', ')}
                </p>
              </div>
            ))}
          </div>
        </div>

        {isSeeding && (
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span>Création en cours...</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="w-full" />
          </div>
        )}

        <Button 
          onClick={seedCommunities}
          disabled={isSeeding}
          className="w-full"
          size="lg"
        >
          {isSeeding ? 'Création en cours...' : 'Créer les Communautés'}
        </Button>

        <div className="text-sm text-muted-foreground">
          <p>💡 Ces communautés donneront vie à la plateforme en créant des espaces d'échange actifs.</p>
          <p>📝 Chaque communauté aura plusieurs canaux thématiques et des messages d'accueil.</p>
        </div>
      </CardContent>
    </Card>
  );
}