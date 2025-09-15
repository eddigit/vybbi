import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { sendContactMessage } from '@/lib/emailService';
import { Mail } from 'lucide-react';

interface ContactFormProps {
  recipientEmail?: string;
  recipientName?: string;
  title?: string;
  className?: string;
}

export default function ContactForm({ 
  recipientEmail = "vybbiapp@gmail.com", 
  recipientName = "Équipe Vybbi", 
  title = "Envoyer un message",
  className = ""
}: ContactFormProps) {
  const [senderName, setSenderName] = useState('');
  const [senderEmail, setSenderEmail] = useState('');
  const [profileType, setProfileType] = useState('');
  const [country, setCountry] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!senderName.trim() || !senderEmail.trim() || !profileType.trim() || !subject.trim() || !message.trim()) {
      toast({
        title: "Champs requis",
        description: "Veuillez remplir tous les champs obligatoires.",
        variant: "destructive"
      });
      return;
    }

    // Validation email basique
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(senderEmail)) {
      toast({
        title: "Email invalide",
        description: "Veuillez saisir une adresse email valide.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const fullMessage = `
Profil: ${profileType}
Pays/Région: ${country || 'Non spécifié'}
Sujet: ${subject}

Message:
${message.trim()}
      `;

      const result = await sendContactMessage(
        recipientEmail,
        senderName.trim(),
        senderEmail.trim(),
        fullMessage
      );

      if (result.success) {
        toast({
          title: "Message envoyé !",
          description: `Votre message a été envoyé${recipientName ? ` à ${recipientName}` : ''}.`,
        });

        // Reset form
        setSenderName('');
        setSenderEmail('');
        setProfileType('');
        setCountry('');
        setSubject('');
        setMessage('');
      } else {
        throw new Error(result.error || 'Erreur inconnue');
      }
      
    } catch (error: any) {
      console.error('Error sending contact message:', error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de l'envoi du message. Veuillez réessayer.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mail className="h-5 w-5" />
          {title}
        </CardTitle>
        {recipientName && (
          <p className="text-sm text-muted-foreground">
            Destinataire : {recipientName}
          </p>
        )}
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="senderName">Nom complet *</Label>
              <Input
                id="senderName"
                type="text"
                placeholder="Votre nom"
                value={senderName}
                onChange={(e) => setSenderName(e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="senderEmail">Adresse email *</Label>
              <Input
                id="senderEmail"
                type="email"
                placeholder="votre@email.com"
                value={senderEmail}
                onChange={(e) => setSenderEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="profileType">Type de profil *</Label>
              <Select value={profileType} onValueChange={setProfileType} required>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionnez votre profil" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="artist">Artiste</SelectItem>
                  <SelectItem value="venue">Lieu / Événement</SelectItem>
                  <SelectItem value="agent">Agent / Manager</SelectItem>
                  <SelectItem value="influencer">Influenceur</SelectItem>
                  <SelectItem value="partner">Partenaire</SelectItem>
                  <SelectItem value="press">Presse / Média</SelectItem>
                  <SelectItem value="other">Autre</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="country">Pays / Région</Label>
              <Input
                id="country"
                type="text"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                placeholder="France, Espagne, etc."
              />
            </div>
          </div>

          <div>
            <Label htmlFor="subject">Sujet de votre demande *</Label>
            <Select value={subject} onValueChange={setSubject} required>
              <SelectTrigger>
                <SelectValue placeholder="Choisissez le sujet" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="general">Demande générale</SelectItem>
                <SelectItem value="partnership">Partenariat</SelectItem>
                <SelectItem value="booking">Réservation / Booking</SelectItem>
                <SelectItem value="technical">Support technique</SelectItem>
                <SelectItem value="press">Demande presse</SelectItem>
                <SelectItem value="business">Opportunité business</SelectItem>
                <SelectItem value="other">Autre</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="message">Message *</Label>
            <Textarea
              id="message"
              placeholder="Décrivez votre demande en détail..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="min-h-[120px]"
              required
            />
          </div>

          <Button 
            type="submit" 
            disabled={isSubmitting} 
            className="w-full"
          >
            {isSubmitting ? "Envoi en cours..." : "Envoyer le message"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}