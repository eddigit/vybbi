import { useState } from 'react';
import { Send, Calendar, MapPin, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useBookingNotifications } from '@/hooks/useBookingNotifications';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

interface DirectContactFormProps {
  artistId: string;
  artistName: string;
  preferredContactId?: string;
  preferredContactName?: string;
  className?: string;
}

interface ContactFormData {
  eventType: string;
  eventDate?: Date;
  location: string;
  budget: string;
  duration: string;
  message: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
}

// DirectContactForm component for booking requests
export function DirectContactForm({
  artistId, 
  artistName, 
  preferredContactId, 
  preferredContactName,
  className = '' 
}: DirectContactFormProps) {
  const { toast } = useToast();
  const { notifyBookingProposed } = useBookingNotifications();
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<ContactFormData>({
    eventType: '',
    location: '',
    budget: '',
    duration: '',
    message: '',
    contactName: '',
    contactEmail: '',
    contactPhone: ''
  });

  const eventTypes = [
    'Concert/Spectacle',
    'Festival', 
    'Soirée privée',
    'Mariage',
    'Événement corporate',
    'Session studio',
    'Autre'
  ];

  const budgetRanges = [
    'Moins de 500€',
    '500€ - 1000€',
    '1000€ - 2500€',
    '2500€ - 5000€',
    '5000€ - 10000€',
    'Plus de 10000€',
    'À négocier'
  ];

  const durationOptions = [
    '1 heure',
    '2 heures', 
    '3 heures',
    '4+ heures',
    'Demi-journée',
    'Journée complète',
    'Plusieurs jours'
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.contactName || !formData.contactEmail || !formData.eventType) {
      toast({
        title: "Champs requis",
        description: "Veuillez remplir tous les champs obligatoires",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      // Create a structured message for the conversation
      const structuredMessage = `
🎵 DEMANDE DE BOOKING - ${artistName}

👤 Contact: ${formData.contactName}
📧 Email: ${formData.contactEmail}
${formData.contactPhone ? `📱 Téléphone: ${formData.contactPhone}` : ''}

🎪 Type d'événement: ${formData.eventType}
${formData.eventDate ? `📅 Date souhaitée: ${format(formData.eventDate, 'dd/MM/yyyy')}` : ''}
${formData.location ? `📍 Lieu: ${formData.location}` : ''}
${formData.duration ? `⏱️ Durée: ${formData.duration}` : ''}
${formData.budget ? `💰 Budget: ${formData.budget}` : ''}

💬 Message:
${formData.message || 'Aucun message supplémentaire'}

---
Cette demande a été générée via le profil Vybbi de ${artistName}.
      `.trim();

      // Start conversation with the artist or preferred contact
      const targetId = preferredContactId || artistId;
      const { data: conversationId, error: convError } = await supabase.rpc('start_direct_conversation', {
        target_user_id: targetId
      });

      if (convError) throw convError;

      // Send the structured message
      const { error: messageError } = await supabase
        .from('messages')
        .insert({
          conversation_id: conversationId,
          sender_id: (await supabase.auth.getUser()).data.user?.id,
          content: structuredMessage
        });

      if (messageError) throw messageError;

      // Envoyer notification de booking à la venue si c'est un profil lieu
      const { data: targetProfile } = await supabase
        .from('profiles')
        .select('profile_type, email, display_name')
        .eq('id', preferredContactId || artistId)
        .single();

      if (targetProfile?.profile_type === 'lieu' && targetProfile.email) {
        notifyBookingProposed({
          venueEmail: targetProfile.email,
          venueName: targetProfile.display_name || 'Lieu',
          eventTitle: formData.eventType,
          eventDate: formData.eventDate ? format(formData.eventDate, 'dd/MM/yyyy') : 'À définir',
          artistName: formData.contactName,
          proposedFee: formData.budget,
          message: formData.message
        });
      }

      toast({
        title: "Demande envoyée !",
        description: `Votre demande a été transmise à ${preferredContactName || artistName}. Vous serez redirigé vers la conversation.`
      });

      // Redirect to messages
      setTimeout(() => {
        window.location.href = `/messages?conversation=${conversationId}`;
      }, 2000);

      setIsOpen(false);
    } catch (error) {
      console.error('Error sending booking request:', error);
      toast({
        title: "Erreur",
        description: "Impossible d'envoyer votre demande. Veuillez réessayer.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const updateFormData = (field: keyof ContactFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className={`w-full ${className}`} size="lg">
          <Send className="h-4 w-4 mr-2" />
          Demande de booking rapide
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">
            Demande de booking - {artistName}
          </DialogTitle>
          {preferredContactName && (
            <p className="text-sm text-muted-foreground">
              Votre demande sera transmise à {preferredContactName}
            </p>
          )}
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Contact Information */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Vos informations</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="contactName">Nom complet *</Label>
                  <Input
                    id="contactName"
                    value={formData.contactName}
                    onChange={(e) => updateFormData('contactName', e.target.value)}
                    placeholder="Votre nom"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="contactEmail">Email *</Label>
                  <Input
                    id="contactEmail"
                    type="email"
                    value={formData.contactEmail}
                    onChange={(e) => updateFormData('contactEmail', e.target.value)}
                    placeholder="votre@email.com"
                    required
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="contactPhone">Téléphone</Label>
                <Input
                  id="contactPhone"
                  value={formData.contactPhone}
                  onChange={(e) => updateFormData('contactPhone', e.target.value)}
                  placeholder="+33 X XX XX XX XX"
                />
              </div>
            </CardContent>
          </Card>

          {/* Event Details */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Détails de l'événement</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Type d'événement *</Label>
                  <Select 
                    value={formData.eventType} 
                    onValueChange={(value) => updateFormData('eventType', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner le type" />
                    </SelectTrigger>
                    <SelectContent>
                      {eventTypes.map(type => (
                        <SelectItem key={type} value={type}>{type}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Date souhaitée</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !formData.eventDate && "text-muted-foreground"
                        )}
                      >
                        <Calendar className="mr-2 h-4 w-4" />
                        {formData.eventDate ? format(formData.eventDate, "PPP") : <span>Choisir une date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <CalendarComponent
                        mode="single"
                        selected={formData.eventDate}
                        onSelect={(date) => updateFormData('eventDate', date)}
                        disabled={(date) => date < new Date()}
                        initialFocus
                        className="p-3 pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              <div>
                <Label htmlFor="location">Lieu de l'événement</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => updateFormData('location', e.target.value)}
                  placeholder="Ville, salle, adresse..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Budget estimé</Label>
                  <Select 
                    value={formData.budget} 
                    onValueChange={(value) => updateFormData('budget', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Fourchette de budget" />
                    </SelectTrigger>
                    <SelectContent>
                      {budgetRanges.map(budget => (
                        <SelectItem key={budget} value={budget}>{budget}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Durée souhaitée</Label>
                  <Select 
                    value={formData.duration} 
                    onValueChange={(value) => updateFormData('duration', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Durée de prestation" />
                    </SelectTrigger>
                    <SelectContent>
                      {durationOptions.map(duration => (
                        <SelectItem key={duration} value={duration}>{duration}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="message">Message supplémentaire</Label>
                <Textarea
                  id="message"
                  value={formData.message}
                  onChange={(e) => updateFormData('message', e.target.value)}
                  placeholder="Décrivez votre projet, vos attentes, contraintes particulières..."
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpen(false)}
              className="flex-1"
            >
              Annuler
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="flex-1"
            >
              {loading ? 'Envoi...' : 'Envoyer la demande'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}