import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Download, FileText, Image, User, Music, Calendar } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface PressKitGeneratorProps {
  profileData: {
    display_name: string;
    bio?: string;
    avatar_url?: string;
    genres?: string[];
    location?: string;
    email?: string;
    phone?: string;
    website?: string;
    spotify_url?: string;
    youtube_url?: string;
    instagram_url?: string;
  };
  mediaAssets?: any[];
  reviews?: any[];
  events?: any[];
}

export const PressKitGenerator = ({ profileData, mediaAssets, reviews, events }: PressKitGeneratorProps) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedSections, setSelectedSections] = useState({
    bio: true,
    photos: true,
    contact: true,
    testimonials: true,
    events: false,
    social: true
  });
  const { toast } = useToast();

  const handleGeneratePresKit = async () => {
    setIsGenerating(true);
    
    try {
      // Simulate press kit generation
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: "Press Kit généré avec succès",
        description: "Votre press kit professionnel est prêt à télécharger.",
      });
      
      // Here would be the actual PDF generation logic
      // For now, we simulate the download
      const blob = new Blob(['Press Kit Content'], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${profileData.display_name}_PressKit.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de générer le press kit.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const sections = [
    { id: 'bio', label: 'Biographie', icon: User, description: 'Biographie complète et informations artistiques' },
    { id: 'photos', label: 'Photos HD', icon: Image, description: 'Photos haute résolution pour promotion' },
    { id: 'contact', label: 'Informations de contact', icon: FileText, description: 'Coordonnées professionnelles' },
    { id: 'testimonials', label: 'Témoignages', icon: Music, description: 'Avis et recommandations professionnelles' },
    { id: 'events', label: 'Événements récents', icon: Calendar, description: 'Historique des performances' },
    { id: 'social', label: 'Réseaux sociaux', icon: Download, description: 'Liens vers plateformes musicales' }
  ];

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full">
          <Download className="w-4 h-4 mr-2" />
          Générer Press Kit
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Générateur de Press Kit</DialogTitle>
          <DialogDescription>
            Créez un press kit professionnel pour promouvoir votre musique auprès des organisateurs et médias.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="text-sm font-medium">Sections à inclure :</div>
          
          <div className="space-y-3">
            {sections.map((section) => {
              const Icon = section.icon;
              return (
                <div key={section.id} className="flex items-start space-x-3">
                  <Checkbox
                    id={section.id}
                    checked={selectedSections[section.id as keyof typeof selectedSections]}
                    onCheckedChange={(checked) =>
                      setSelectedSections(prev => ({ ...prev, [section.id]: checked }))
                    }
                  />
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <Icon className="w-4 h-4 text-primary" />
                      <label htmlFor={section.id} className="text-sm font-medium cursor-pointer">
                        {section.label}
                      </label>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{section.description}</p>
                  </div>
                </div>
              );
            })}
          </div>

          <Card className="bg-muted/30">
            <CardContent className="pt-4">
              <div className="text-sm">
                <div className="font-medium mb-1">Aperçu du contenu :</div>
                <ul className="text-xs text-muted-foreground space-y-1">
                  <li>• Format PDF professionnel haute qualité</li>
                  <li>• Design aux couleurs de votre marque</li>
                  <li>• Prêt pour impression et envoi digital</li>
                  <li>• Conforme aux standards de l'industrie musicale</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <Button 
            onClick={handleGeneratePresKit}
            disabled={isGenerating || !Object.values(selectedSections).some(Boolean)}
            className="w-full"
          >
            {isGenerating ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-background mr-2"></div>
                Génération en cours...
              </>
            ) : (
              <>
                <Download className="w-4 h-4 mr-2" />
                Générer & Télécharger
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};