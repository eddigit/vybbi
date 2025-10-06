import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Building2, Mail, Phone, MapPin, Globe, Users } from 'lucide-react';

interface VenueProspectingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

const VenueProspectingDialog: React.FC<VenueProspectingDialogProps> = ({
  open,
  onOpenChange,
  onSuccess
}) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [sendEmail, setSendEmail] = useState(false);
  const [formData, setFormData] = useState({
    displayName: '',
    venueCategory: '',
    venueCapacity: '',
    phone: '',
    email: '',
    location: '',
    city: '',
    website: '',
    instagram_url: '',
    description: '',
    genres: '',
    notes: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Create venue profile via edge function
      const { data, error } = await supabase.functions.invoke('admin-create-venue-profile', {
        body: {
          displayName: formData.displayName,
          venueCategory: formData.venueCategory || undefined,
          venueCapacity: formData.venueCapacity ? parseInt(formData.venueCapacity) : undefined,
          phone: formData.phone || undefined,
          email: formData.email || undefined,
          location: formData.location || undefined,
          city: formData.city || undefined,
          website: formData.website || undefined,
          instagram_url: formData.instagram_url || undefined,
          description: formData.description || undefined,
          genres: formData.genres ? formData.genres.split(',').map(g => g.trim()) : undefined,
          notes: formData.notes || undefined
        }
      });

      if (error) throw error;

      if (!data.success) {
        throw new Error(data.error || 'Failed to create venue profile');
      }

      toast({
        title: "✅ Fiche lieu créée",
        description: `La fiche pour ${formData.displayName} a été créée avec succès.`
      });

      // Send email if requested and email is provided
      if (sendEmail && formData.email) {
        const { error: emailError } = await supabase.functions.invoke('send-venue-claim-email', {
          body: {
            venueName: formData.displayName,
            venueEmail: formData.email,
            profileUrl: data.profileUrl,
            claimUrl: data.claimUrl,
            tempUsername: data.credentials.username,
            tempPassword: data.credentials.password,
            expiresAt: data.credentials.expiresAt
          }
        });

        if (emailError) {
          console.error('Email sending error:', emailError);
          toast({
            title: "⚠️ Email non envoyé",
            description: "La fiche a été créée mais l'email n'a pas pu être envoyé.",
            variant: "destructive"
          });
        } else {
          toast({
            title: "📧 Email envoyé",
            description: `Email envoyé à ${formData.email}`
          });
        }
      }

      // Show credentials to admin
      const credentialsMessage = `
Identifiants temporaires :
• Login: ${data.credentials.username}
• Mot de passe: ${data.credentials.password}
• Lien de réclamation: ${data.claimUrl}
• Expire le: ${new Date(data.credentials.expiresAt).toLocaleDateString('fr-FR')}
      `.trim();

      toast({
        title: "🔐 Identifiants créés",
        description: credentialsMessage,
        duration: 3000
      });

      // Reset form
      setFormData({
        displayName: '',
        venueCategory: '',
        venueCapacity: '',
        phone: '',
        email: '',
        location: '',
        city: '',
        website: '',
        instagram_url: '',
        description: '',
        genres: '',
        notes: ''
      });
      setSendEmail(false);
      onSuccess();
      onOpenChange(false);

    } catch (error: any) {
      console.error('Error creating venue profile:', error);
      toast({
        title: "❌ Erreur",
        description: error.message || "Impossible de créer la fiche lieu",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Créer une Fiche Lieu - Prospection Physique
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Informations de base */}
          <div className="space-y-4">
            <h3 className="font-semibold text-sm">Informations de Base</h3>
            
            <div>
              <Label htmlFor="displayName">Nom de l'établissement *</Label>
              <Input
                id="displayName"
                value={formData.displayName}
                onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                placeholder="Ex: Le Club de Jazz"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="venueCategory">Type de lieu</Label>
                <Select
                  value={formData.venueCategory}
                  onValueChange={(value) => setFormData({ ...formData, venueCategory: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="club">Club / Discothèque</SelectItem>
                    <SelectItem value="bar">Bar / Pub</SelectItem>
                    <SelectItem value="concert_hall">Salle de Concert</SelectItem>
                    <SelectItem value="restaurant">Restaurant</SelectItem>
                    <SelectItem value="theater">Théâtre</SelectItem>
                    <SelectItem value="festival">Festival / Événement</SelectItem>
                    <SelectItem value="private">Événement Privé</SelectItem>
                    <SelectItem value="other">Autre</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="venueCapacity" className="flex items-center gap-1">
                  <Users className="h-3 w-3" />
                  Capacité
                </Label>
                <Input
                  id="venueCapacity"
                  type="number"
                  value={formData.venueCapacity}
                  onChange={(e) => setFormData({ ...formData, venueCapacity: e.target.value })}
                  placeholder="Ex: 200"
                />
              </div>
            </div>
          </div>

          {/* Contact */}
          <div className="space-y-4">
            <h3 className="font-semibold text-sm">Contact</h3>
            
            <div>
              <Label htmlFor="email" className="flex items-center gap-1">
                <Mail className="h-3 w-3" />
                Email (recommandé)
              </Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="contact@etablissement.com"
              />
              {formData.email && (
                <div className="flex items-center gap-2 mt-2">
                  <input
                    type="checkbox"
                    id="sendEmail"
                    checked={sendEmail}
                    onChange={(e) => setSendEmail(e.target.checked)}
                    className="rounded"
                  />
                  <Label htmlFor="sendEmail" className="text-sm font-normal cursor-pointer">
                    Envoyer l'email d'invitation maintenant
                  </Label>
                </div>
              )}
            </div>

            <div>
              <Label htmlFor="phone" className="flex items-center gap-1">
                <Phone className="h-3 w-3" />
                Téléphone
              </Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="06 12 34 56 78"
              />
            </div>
          </div>

          {/* Localisation */}
          <div className="space-y-4">
            <h3 className="font-semibold text-sm">Localisation</h3>
            
            <div>
              <Label htmlFor="location" className="flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                Adresse
              </Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="123 Rue de la Musique"
              />
            </div>

            <div>
              <Label htmlFor="city">Ville</Label>
              <Input
                id="city"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                placeholder="Paris"
              />
            </div>
          </div>

          {/* Web & Réseaux */}
          <div className="space-y-4">
            <h3 className="font-semibold text-sm">Web & Réseaux Sociaux</h3>
            
            <div>
              <Label htmlFor="website" className="flex items-center gap-1">
                <Globe className="h-3 w-3" />
                Site web
              </Label>
              <Input
                id="website"
                type="url"
                value={formData.website}
                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                placeholder="https://monsite.com"
              />
            </div>

            <div>
              <Label htmlFor="instagram_url">Instagram</Label>
              <Input
                id="instagram_url"
                value={formData.instagram_url}
                onChange={(e) => setFormData({ ...formData, instagram_url: e.target.value })}
                placeholder="@etablissement"
              />
            </div>
          </div>

          {/* Description & Genres */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Décrivez l'établissement..."
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="genres">Genres musicaux (séparés par virgules)</Label>
              <Input
                id="genres"
                value={formData.genres}
                onChange={(e) => setFormData({ ...formData, genres: e.target.value })}
                placeholder="Jazz, Blues, Rock"
              />
            </div>

            <div>
              <Label htmlFor="notes">Notes internes (non visibles)</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Notes de la visite, contacts, etc."
                rows={2}
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Annuler
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {loading ? 'Création...' : 'Créer la Fiche'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default VenueProspectingDialog;