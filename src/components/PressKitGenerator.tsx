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
        title: "Génération Vybbi Press Kit...",
        description: "Création du PDF professionnel haute qualité, veuillez patienter.",
      });

      // Configuration optimisée pour le thème dark Vybbi
      const canvas = await html2canvas(templateRef.current, {
        scale: 3, // Qualité maximum pour impression professionnelle
        useCORS: true,
        allowTaint: false,
        backgroundColor: null, // Respecter le CSS natif (thème dark)
        logging: false,
        removeContainer: true,
        foreignObjectRendering: true,
        width: templateRef.current.scrollWidth,
        height: templateRef.current.scrollHeight,
        windowWidth: 1200, // Simule un écran large pour meilleur rendu
        windowHeight: 1600,
        imageTimeout: 15000, // Plus de temps pour charger les images
        onclone: (clonedDoc) => {
          // Optimisations pour le document cloné
          const clonedElement = clonedDoc.querySelector('[data-html2canvas-ignore]');
          if (clonedElement) {
            (clonedElement as HTMLElement).style.display = 'none';
          }
        }
      });

      // Créer le PDF avec métadonnées Vybbi
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
        compress: true
      });

      // Métadonnées PDF professionnelles
      pdf.setProperties({
        title: `${profileData.display_name} - Press Kit Vybbi`,
        subject: `Press Kit professionnel de ${profileData.display_name} - Généré par Vybbi`,
        author: 'Vybbi Platform',
        keywords: `${profileData.display_name}, press kit, artist, music, vybbi, ${profileData.genres?.join(', ') || ''}`,
        creator: 'Vybbi - Platform for Artists & Venues'
      });

      // Calculer les dimensions pour ajuster parfaitement à A4
      const imgWidth = 210; // A4 width in mm
      const pageHeight = 297; // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      let heightLeft = imgHeight;
      let position = 0;
      let pageNumber = 1;

      // Ajouter la première page avec qualité optimale
      pdf.addImage(
        canvas.toDataURL('image/png', 1.0), // PNG qualité maximale
        'PNG',
        0,
        position,
        imgWidth,
        imgHeight,
        undefined,
        'FAST' // Compression rapide mais qualité préservée
      );
      heightLeft -= pageHeight;

      // Ajouter des pages supplémentaires si nécessaire
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pageNumber++;
        
        pdf.addImage(
          canvas.toDataURL('image/png', 1.0),
          'PNG',
          0,
          position,
          imgWidth,
          imgHeight,
          undefined,
          'FAST'
        );
        heightLeft -= pageHeight;
      }

      // Nom de fichier professionnel avec timestamp
      const timestamp = new Date().toISOString().split('T')[0];
      const fileName = `${profileData.display_name.replace(/[^a-zA-Z0-9]/g, '_')}_PressKit_Vybbi_${timestamp}.pdf`;
      
      // Télécharger le PDF
      pdf.save(fileName);
      
      toast({
        title: "Press Kit Vybbi généré avec succès !",
        description: `${fileName} - PDF professionnel haute qualité prêt à partager.`,
      });
      
    } catch (error) {
      console.error('Erreur génération Press Kit Vybbi:', error);
      toast({
        title: "Erreur génération Press Kit",
        description: "Impossible de générer le press kit Vybbi. Veuillez vérifier vos photos et réessayer.",
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
              Créez un press kit professionnel Vybbi pour promouvoir votre musique auprès des organisateurs, médias et professionnels de l'industrie musicale.
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
                  <li>• PDF haute qualité avec thème dark Vybbi</li>
                  <li>• Design professionnel aux couleurs de la marque</li>
                  <li>• Optimisé pour impression et partage digital</li>
                  <li>• Conforme aux standards de l'industrie musicale</li>
                  <li>• Toutes vos informations et médias inclus</li>
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
            <div className="mt-6 border rounded-lg overflow-hidden" style={{ backgroundColor: 'hsl(220 13% 9%)' }}>
              <div className="p-4 bg-muted/30 text-center border-b border-border">
                <p className="text-sm text-muted-foreground">
                  Aperçu du Press Kit Vybbi - Le PDF final aura une qualité optimale
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