import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Download, FileText, Image, User, Music, Calendar } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { PressKitTemplate } from './PressKitTemplate';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

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
  const [showPreview, setShowPreview] = useState(false);
  const templateRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const handleGeneratePresKit = async () => {
    if (!templateRef.current) {
      toast({
        title: "Erreur",
        description: "Template non disponible. Veuillez ouvrir l'aperçu d'abord.",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);
    
    try {
      toast({
        title: "Génération en cours...",
        description: "Création du PDF professionnel, veuillez patienter.",
      });

      // Configuration pour une qualité optimale
      const canvas = await html2canvas(templateRef.current, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        logging: false,
        width: templateRef.current.scrollWidth,
        height: templateRef.current.scrollHeight
      });

      // Créer le PDF avec jsPDF
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
        compress: true
      });

      // Calculer les dimensions pour ajuster à la page A4
      const imgWidth = 210; // A4 width in mm
      const pageHeight = 297; // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      let heightLeft = imgHeight;
      let position = 0;

      // Ajouter la première page
      pdf.addImage(
        canvas.toDataURL('image/jpeg', 0.95),
        'JPEG',
        0,
        position,
        imgWidth,
        imgHeight
      );
      heightLeft -= pageHeight;

      // Ajouter des pages supplémentaires si nécessaire
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(
          canvas.toDataURL('image/jpeg', 0.95),
          'JPEG',
          0,
          position,
          imgWidth,
          imgHeight
        );
        heightLeft -= pageHeight;
      }

      // Télécharger le PDF
      const fileName = `${profileData.display_name.replace(/[^a-zA-Z0-9]/g, '_')}_PressKit.pdf`;
      pdf.save(fileName);
      
      toast({
        title: "Press Kit généré avec succès !",
        description: "Votre press kit professionnel a été téléchargé.",
      });
      
    } catch (error) {
      console.error('Erreur génération PDF:', error);
      toast({
        title: "Erreur",
        description: "Impossible de générer le press kit. Veuillez réessayer.",
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

          <div className="flex gap-2">
            <Button 
              variant="outline"
              onClick={() => setShowPreview(!showPreview)}
              className="flex-1"
            >
              <FileText className="w-4 h-4 mr-2" />
              {showPreview ? 'Masquer aperçu' : 'Aperçu'}
            </Button>
            
            <Button 
              onClick={handleGeneratePresKit}
              disabled={isGenerating || !Object.values(selectedSections).some(Boolean)}
              className="flex-1"
            >
              {isGenerating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-background mr-2"></div>
                  Génération...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 mr-2" />
                  Télécharger PDF
                </>
              )}
            </Button>
          </div>

          {showPreview && (
            <div className="mt-6 border rounded-lg overflow-hidden bg-gray-50">
              <div className="p-4 bg-muted text-center">
                <p className="text-sm text-muted-foreground">
                  Aperçu du Press Kit - Le PDF final aura une qualité optimale
                </p>
              </div>
              <div className="max-h-96 overflow-y-auto">
                <div className="transform scale-50 origin-top">
                  <PressKitTemplate
                    ref={templateRef}
                    profileData={profileData}
                    mediaAssets={mediaAssets}
                    reviews={reviews}
                    events={events}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Template caché pour la génération PDF */}
          <div className="sr-only">
            <PressKitTemplate
              ref={templateRef}
              profileData={profileData}
              mediaAssets={mediaAssets}
              reviews={reviews}
              events={events}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};