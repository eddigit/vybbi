import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { MessageCircle, Send, Phone, ExternalLink } from 'lucide-react';

interface Prospect {
  id: string;
  contact_name: string;
  whatsapp_number?: string;
  phone?: string;
  company_name?: string;
  prospect_type: string;
  status: string;
}

interface WhatsAppTemplate {
  id: string;
  name: string;
  content: string;
  category: string;
  variables: string[];
}

interface WhatsAppSenderProps {
  isOpen: boolean;
  onClose: () => void;
  selectedProspect?: Prospect;
  onMessageSent?: () => void;
}

export default function WhatsAppSender({ isOpen, onClose, selectedProspect, onMessageSent }: WhatsAppSenderProps) {
  const { toast } = useToast();
  const [selectedTemplate, setSelectedTemplate] = useState<WhatsAppTemplate | null>(null);
  const [customMessage, setCustomMessage] = useState('');
  const [whatsappNumber, setWhatsappNumber] = useState(selectedProspect?.whatsapp_number || selectedProspect?.phone || '');
  const [activeTab, setActiveTab] = useState('templates');
  const [loading, setLoading] = useState(false);
  
  // Templates WhatsApp prédéfinis
  const whatsappTemplates: WhatsAppTemplate[] = [
    {
      id: '1',
      name: 'Premier Contact - Artiste',
      category: 'first_contact',
      content: `Bonjour {{contact_name}} ! 👋\n\nJe suis de l'équipe Vybbi, la plateforme qui connecte les artistes aux professionnels de la musique.\n\nJ'aimerais vous présenter nos services qui pourraient vous intéresser pour développer votre carrière artistique.\n\nSeriez-vous disponible pour un bref échange cette semaine ? 🎵`,
      variables: ['contact_name']
    },
    {
      id: '2', 
      name: 'Premier Contact - Venue/Club',
      category: 'first_contact',
      content: `Bonjour {{contact_name}} ! 🎶\n\nJe découvre {{company_name}} et j'aimerais vous parler de Vybbi, une plateforme qui facilite la mise en relation entre lieux et artistes.\n\nNous avons des artistes exceptionnels qui cherchent des scènes comme la vôtre.\n\nÇa vous intéresse d'en savoir plus ? 🎤`,
      variables: ['contact_name', 'company_name']
    },
    {
      id: '3',
      name: 'Suivi Sponsor/Partenaire',
      category: 'follow_up',
      content: `Salut {{contact_name}} ! ✨\n\nSuite à notre échange, je voulais vous présenter nos opportunités de partenariat avec Vybbi.\n\nNous organisons des événements exclusifs et cherchons des partenaires visionnaires comme {{company_name}}.\n\nQuand pourrait-on programmer un call ? 📞`,
      variables: ['contact_name', 'company_name']
    },
    {
      id: '4',
      name: 'Proposition Interview/Reportage',
      category: 'media',
      content: `Bonjour {{contact_name}} ! 🎙️\n\nJe vous contacte car nous préparons une série d'interviews avec les acteurs influents de la scène musicale.\n\nVotre expertise chez {{company_name}} nous intéresse beaucoup.\n\nSeriez-vous partant(e) pour une interview exclusive ? 🎬`,
      variables: ['contact_name', 'company_name']
    }
  ];

  const handleTemplateSelect = (template: WhatsAppTemplate) => {
    setSelectedTemplate(template);
    setCustomMessage(template.content);
    setActiveTab('compose');
  };

  const replaceVariables = (content: string): string => {
    if (!selectedProspect) return content;
    
      return content
        .replace(/\{\{contact_name\}\}/g, selectedProspect.contact_name)
        .replace(/\{\{company_name\}\}/g, selectedProspect.company_name || 'votre organisation');
  };

  const getFinalMessage = (): string => {
    return replaceVariables(customMessage);
  };

  const handleSendWhatsApp = async () => {
    if (!selectedProspect || !whatsappNumber.trim() || !customMessage.trim()) {
      toast({
        title: "Informations manquantes",
        description: "Veuillez renseigner le numéro WhatsApp et le message",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      // Créer le lien WhatsApp
      const cleanNumber = whatsappNumber.replace(/[^\d+]/g, '');
      const finalMessage = getFinalMessage();
      const whatsappUrl = `https://wa.me/${cleanNumber}?text=${encodeURIComponent(finalMessage)}`;

      // Enregistrer l'interaction dans la base
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: agentData } = await supabase
          .from('vybbi_agents')
          .select('id')
          .eq('user_id', user.id)
          .maybeSingle();

        if (agentData) {
          await supabase.from('prospect_interactions').insert([{
            prospect_id: selectedProspect.id,
            agent_id: agentData.id,
            interaction_type: 'message',
            subject: selectedTemplate?.name || 'Message WhatsApp',
            content: finalMessage,
            completed_at: new Date().toISOString()
          }]);

          // Mettre à jour la date de dernier contact
          await supabase
            .from('prospects')
            .update({ 
              last_contact_at: new Date().toISOString(),
              whatsapp_number: cleanNumber
            })
            .eq('id', selectedProspect.id);
        }
      }

      // Ouvrir WhatsApp
      window.open(whatsappUrl, '_blank');

      toast({
        title: "WhatsApp ouvert",
        description: "Le message a été préparé dans WhatsApp. L'interaction a été enregistrée.",
      });

      onMessageSent?.();
      onClose();
      resetForm();

    } catch (error) {
      console.error('Erreur WhatsApp:', error);
      toast({
        title: "Erreur",
        description: "Impossible d'ouvrir WhatsApp",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setSelectedTemplate(null);
    setCustomMessage('');
    setActiveTab('templates');
    setWhatsappNumber(selectedProspect?.whatsapp_number || selectedProspect?.phone || '');
  };

  if (!selectedProspect) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5 text-green-500" />
            Envoi WhatsApp - {selectedProspect.contact_name}
          </DialogTitle>
        </DialogHeader>

        {/* Infos Prospect */}
        <Card className="mb-4">
          <CardContent className="pt-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">Contact:</span> {selectedProspect.contact_name}
              </div>
              <div>
                <span className="font-medium">Entreprise:</span> {selectedProspect.company_name || 'N/A'}
              </div>
              <div>
                <span className="font-medium">Type:</span> 
                <Badge className="ml-2">{selectedProspect.prospect_type}</Badge>
              </div>
              <div>
                <span className="font-medium">Statut:</span> 
                <Badge className="ml-2">{selectedProspect.status}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="templates">Templates</TabsTrigger>
            <TabsTrigger value="compose">Composer</TabsTrigger>
            <TabsTrigger value="preview">Aperçu</TabsTrigger>
          </TabsList>

          <TabsContent value="templates" className="space-y-4">
            <div className="space-y-3">
              {whatsappTemplates.map((template) => (
                <Card key={template.id} className="cursor-pointer hover:bg-muted/50 transition-colors"
                      onClick={() => handleTemplateSelect(template)}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">{template.name}</CardTitle>
                      <Badge variant="outline">{template.category}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                  <p className="text-sm text-muted-foreground line-clamp-3">
                    {replaceVariables(template.content)}
                  </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="compose" className="space-y-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="whatsapp_number">Numéro WhatsApp</Label>
                <Input
                  id="whatsapp_number"
                  value={whatsappNumber}
                  onChange={(e) => setWhatsappNumber(e.target.value)}
                  placeholder="+33612345678"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="message">Message</Label>
                <Textarea
                  id="message"
                  value={customMessage}
                  onChange={(e) => setCustomMessage(e.target.value)}
                  placeholder="Tapez votre message WhatsApp..."
                  rows={8}
                />
                <p className="text-xs text-muted-foreground">
                  Variables disponibles: {`{{contact_name}}, {{company_name}}`}
                </p>
              </div>

                <div className="bg-muted/30 p-3 rounded-lg">
                  <p className="text-sm font-medium mb-1">Template sélectionné:</p>
                  <p className="text-sm text-muted-foreground">{selectedTemplate.name}</p>
                </div>
            </div>
          </TabsContent>

          <TabsContent value="preview" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <MessageCircle className="h-5 w-5 text-green-500" />
                  Aperçu du message WhatsApp
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Phone className="h-4 w-4" />
                    <span className="text-sm font-medium">À: {whatsappNumber}</span>
                  </div>
                  <div className="whitespace-pre-wrap text-sm bg-white p-3 rounded border">
                    {getFinalMessage()}
                  </div>
                </div>
                
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <ExternalLink className="h-4 w-4" />
                  <span>Le message s'ouvrira dans WhatsApp Web ou l'application</span>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex justify-between gap-2 pt-4 border-t">
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Annuler
          </Button>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={() => setActiveTab('preview')}
              disabled={!customMessage.trim()}
            >
              Aperçu
            </Button>
            <Button 
              onClick={handleSendWhatsApp} 
              disabled={loading || !customMessage.trim() || !whatsappNumber.trim()}
              className="bg-green-600 hover:bg-green-700"
            >
              <Send className="mr-2 h-4 w-4" />
              {loading ? 'Ouverture...' : 'Envoyer WhatsApp'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}