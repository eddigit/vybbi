import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';

interface AffiliateLinkDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onLinkCreated: () => void;
}

export const AffiliateLinkDialog = ({ open, onOpenChange, onLinkCreated }: AffiliateLinkDialogProps) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    customCode: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      setLoading(true);

      // Get user profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user.id)
        .eq('profile_type', 'influenceur')
        .single();

      if (!profile) {
        throw new Error('Profil influenceur non trouvé');
      }

      // Generate or use custom code
      let affiliateCode = formData.customCode;
      if (!affiliateCode) {
        const { data: generatedCode, error: codeError } = await supabase
          .rpc('generate_affiliate_code', { base_name: formData.name });

        if (codeError) throw codeError;
        affiliateCode = generatedCode;
      }

      // Create the link
      const { error } = await supabase
        .from('influencer_links')
        .insert({
          influencer_profile_id: profile.id,
          code: affiliateCode,
          name: formData.name || null,
          description: formData.description || null,
          is_active: true
        });

      if (error) {
        if (error.code === '23505') { // Unique violation
          throw new Error('Ce code existe déjà. Essayez un autre code.');
        }
        throw error;
      }

      toast({
        title: "Succès",
        description: "Lien d'affiliation créé avec succès"
      });

      // Reset form
      setFormData({ name: '', description: '', customCode: '' });
      onLinkCreated();
      onOpenChange(false);

    } catch (error: any) {
      console.error('Error creating affiliate link:', error);
      toast({
        title: "Erreur",
        description: error.message || "Impossible de créer le lien",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Créer un nouveau lien d'affiliation</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nom du lien</Label>
            <Input
              id="name"
              placeholder="ex: Campagne Instagram"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Description de la campagne..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="customCode">Code personnalisé (optionnel)</Label>
            <Input
              id="customCode"
              placeholder="ex: INSTAGRAM2024"
              value={formData.customCode}
              onChange={(e) => setFormData({ ...formData, customCode: e.target.value.toUpperCase() })}
            />
            <p className="text-xs text-muted-foreground">
              Si vide, un code sera généré automatiquement
            </p>
          </div>

          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Annuler
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Création...' : 'Créer le lien'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};