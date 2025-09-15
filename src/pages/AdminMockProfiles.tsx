import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import MockProfileGenerator from '@/components/admin/MockProfileGenerator';
import MockProfileManager from '@/components/admin/MockProfileManager';
import { Bot, Settings } from 'lucide-react';

export default function AdminMockProfiles() {
  return (
    <div className="container mx-auto px-6 py-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Gestion des Profils Mocks</h1>
        <p className="text-muted-foreground">
          Créez et gérez des profils de démonstration avec des avatars générés par IA
        </p>
      </div>

      <Tabs defaultValue="generator" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="generator" className="flex items-center gap-2">
            <Bot className="h-4 w-4" />
            Générateur
          </TabsTrigger>
          <TabsTrigger value="manager" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Gestion
          </TabsTrigger>
        </TabsList>

        <TabsContent value="generator" className="space-y-6">
          <MockProfileGenerator />
          
          <Card>
            <CardHeader>
              <CardTitle>À propos de la génération</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4 text-sm">
                <div>
                  <h4 className="font-medium mb-2">🎨 Avatars IA</h4>
                  <p className="text-muted-foreground">
                    Chaque profil reçoit un avatar unique généré par DALL-E 3, 
                    adapté au type de profil (artiste, lieu, agent, manager).
                  </p>
                </div>
                <div>
                  <h4 className="font-medium mb-2">📝 Contenu Réaliste</h4>
                  <p className="text-muted-foreground">
                    Les biographies, genres musicaux et localisations sont 
                    générés de manière cohérente pour créer des profils crédibles.
                  </p>
                </div>
                <div>
                  <h4 className="font-medium mb-2">🔄 Traçabilité</h4>
                  <p className="text-muted-foreground">
                    Tous les profils mocks sont marqués et peuvent être 
                    supprimés facilement depuis l'interface de gestion.
                  </p>
                </div>
                <div>
                  <h4 className="font-medium mb-2">⚡ Performance</h4>
                  <p className="text-muted-foreground">
                    La génération peut prendre quelques minutes selon le nombre 
                    de profils et la génération des avatars IA.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="manager">
          <MockProfileManager />
        </TabsContent>
      </Tabs>
    </div>
  );
}