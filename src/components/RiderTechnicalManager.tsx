import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { FileText, Upload, Download, Trash2, Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface RiderSection {
  id: string;
  title: string;
  content: string;
  mandatory: boolean;
}

interface RiderTechnicalManagerProps {
  profileId?: string;
}

export const RiderTechnicalManager = ({ profileId }: RiderTechnicalManagerProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [riderSections, setRiderSections] = useState<RiderSection[]>([
    {
      id: '1',
      title: 'Configuration Scène',
      content: 'Scène minimum 4x3m, hauteur sous plafond 3m minimum',
      mandatory: true
    },
    {
      id: '2', 
      title: 'Sonorisation',
      content: 'Table de mixage 16 pistes minimum, retours de scène',
      mandatory: true
    },
    {
      id: '3',
      title: 'Éclairage',
      content: 'Éclairage face et contre-jour, possibilité dimmer',
      mandatory: false
    }
  ]);
  const { toast } = useToast();

  const addSection = () => {
    const newSection: RiderSection = {
      id: Date.now().toString(),
      title: '',
      content: '',
      mandatory: false
    };
    setRiderSections(prev => [...prev, newSection]);
  };

  const updateSection = (id: string, field: keyof RiderSection, value: string | boolean) => {
    setRiderSections(prev => prev.map(section => 
      section.id === id ? { ...section, [field]: value } : section
    ));
  };

  const removeSection = (id: string) => {
    setRiderSections(prev => prev.filter(section => section.id !== id));
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      // Simulate file upload
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast({
        title: "Rider technique uploadé",
        description: `Le fichier "${file.name}" a été uploadé avec succès.`,
      });
    } catch (error) {
      toast({
        title: "Erreur d'upload",
        description: "Impossible d'uploader le fichier.",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
    }
  };

  const generateRider = async () => {
    try {
      // Simulate rider generation
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Rider technique généré",
        description: "Votre rider technique a été généré en PDF.",
      });
      
      // Simulate download
      const blob = new Blob(['Rider Technique Content'], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'Rider_Technique.pdf';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de générer le rider.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileText className="w-5 h-5" />
            <span>Rider Technique</span>
          </CardTitle>
          <CardDescription>
            Gérez vos exigences techniques pour faciliter l'organisation de vos concerts.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="rider-upload" className="text-sm font-medium">Upload Rider existant</Label>
              <div className="flex items-center space-x-2 mt-2">
                <Input
                  id="rider-upload"
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={handleFileUpload}
                  disabled={isUploading}
                  className="flex-1"
                />
                <Button size="sm" disabled={isUploading} variant="outline">
                  {isUploading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                  ) : (
                    <Upload className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </div>
            
            <div className="flex flex-col justify-end">
              <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="w-full">
                    <FileText className="w-4 h-4 mr-2" />
                    Créer/Éditer Rider
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Gestionnaire de Rider Technique</DialogTitle>
                    <DialogDescription>
                      Créez et personnalisez votre rider technique pour vos performances.
                    </DialogDescription>
                  </DialogHeader>
                  
                  <div className="space-y-6">
                    {riderSections.map((section) => (
                      <Card key={section.id} className="bg-muted/30">
                        <CardContent className="pt-4 space-y-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2 flex-1">
                              <Input
                                placeholder="Titre de la section"
                                value={section.title}
                                onChange={(e) => updateSection(section.id, 'title', e.target.value)}
                                className="font-medium"
                              />
                              <div className="flex items-center space-x-2">
                                <input
                                  type="checkbox"
                                  id={`mandatory-${section.id}`}
                                  checked={section.mandatory}
                                  onChange={(e) => updateSection(section.id, 'mandatory', e.target.checked)}
                                  className="h-4 w-4"
                                />
                                <Label htmlFor={`mandatory-${section.id}`} className="text-xs">
                                  Obligatoire
                                </Label>
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeSection(section.id)}
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                          
                          <Textarea
                            placeholder="Détails techniques..."
                            value={section.content}
                            onChange={(e) => updateSection(section.id, 'content', e.target.value)}
                            className="min-h-[80px]"
                          />
                        </CardContent>
                      </Card>
                    ))}
                    
                    <Button onClick={addSection} variant="outline" className="w-full">
                      <Plus className="w-4 h-4 mr-2" />
                      Ajouter une section
                    </Button>
                    
                    <div className="flex space-x-2">
                      <Button onClick={generateRider} className="flex-1">
                        <Download className="w-4 h-4 mr-2" />
                        Générer PDF
                      </Button>
                      <Button variant="outline" onClick={() => setIsOpen(false)}>
                        Fermer
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
          
          <div className="text-xs text-muted-foreground">
            Le rider technique aide les organisateurs à préparer votre performance dans les meilleures conditions.
          </div>
        </CardContent>
      </Card>
    </div>
  );
};