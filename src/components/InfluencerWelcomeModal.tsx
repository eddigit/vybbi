import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Copy, Check, ExternalLink, Instagram, Youtube, Mail, PartyPopper } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface InfluencerWelcomeModalProps {
  isOpen: boolean;
  onClose: () => void;
  influencerProfileId: string;
}

export function InfluencerWelcomeModal({
  isOpen,
  onClose,
  influencerProfileId,
}: InfluencerWelcomeModalProps) {
  const [linkName, setLinkName] = useState('');
  const [generatedLink, setGeneratedLink] = useState('');
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);

  const generateLink = async () => {
    if (!linkName.trim()) {
      toast.error('Veuillez entrer un nom pour votre lien');
      return;
    }

    setLoading(true);

    try {
      // Générer un code unique
      const code = `${linkName.toLowerCase().replace(/[^a-z0-9]/g, '')}-${Date.now().toString(36)}`;

      // Créer le lien d'affiliation
      const { data, error } = await supabase
        .from('influencer_links')
        .insert({
          influencer_profile_id: influencerProfileId,
          name: linkName,
          code: code,
          is_active: true,
        })
        .select()
        .single();

      if (error) throw error;

      const fullLink = `${window.location.origin}/get-started?ref=${code}`;
      setGeneratedLink(fullLink);
      
      // Copier automatiquement
      await navigator.clipboard.writeText(fullLink);
      setCopied(true);
      toast.success('Lien créé et copié dans le presse-papier !');
      
      setTimeout(() => setCopied(false), 3000);
    } catch (error: any) {
      console.error('Erreur création lien:', error);
      toast.error('Erreur lors de la création du lien');
    } finally {
      setLoading(false);
    }
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(generatedLink);
      setCopied(true);
      toast.success('Lien copié !');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error('Erreur lors de la copie');
    }
  };

  const handleComplete = () => {
    localStorage.setItem('influencer_welcome_shown', 'true');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleComplete}>
      <DialogContent className="sm:max-w-2xl bg-gradient-card border-border">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <PartyPopper className="w-6 h-6 text-primary" />
            <DialogTitle className="text-2xl">Bienvenue dans le club !</DialogTitle>
          </div>
          <DialogDescription className="text-base">
            Créez votre premier lien d'affiliation et commencez à gagner dès maintenant
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {!generatedLink ? (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="linkName">Nom de votre lien</Label>
                <Input
                  id="linkName"
                  placeholder="Ex: Instagram, Bio, Newsletter..."
                  value={linkName}
                  onChange={(e) => setLinkName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && generateLink()}
                />
                <p className="text-xs text-muted-foreground">
                  Donnez un nom pour identifier où vous allez partager ce lien
                </p>
              </div>

              <Button
                onClick={generateLink}
                disabled={loading || !linkName.trim()}
                className="w-full"
                size="lg"
              >
                {loading ? 'Génération...' : 'Générer mon lien'}
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="p-4 bg-primary/10 border border-primary/20 rounded-lg">
                <Label className="text-xs text-muted-foreground mb-2 block">Votre lien d'affiliation</Label>
                <div className="flex items-center gap-2">
                  <code className="flex-1 text-sm bg-background/50 p-2 rounded border border-border truncate">
                    {generatedLink}
                  </code>
                  <Button
                    size="icon"
                    variant="outline"
                    onClick={copyLink}
                    className="shrink-0"
                  >
                    {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                  </Button>
                </div>
              </div>

              <div className="bg-gradient-card border border-border rounded-lg p-4 space-y-3">
                <h4 className="font-semibold flex items-center gap-2">
                  💡 Comment partager efficacement
                </h4>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <div className="flex items-start gap-2">
                    <Instagram className="w-4 h-4 mt-0.5 shrink-0 text-primary" />
                    <div>
                      <strong>Instagram/TikTok:</strong> Ajoutez le lien dans votre bio ou en story avec sticker
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <Youtube className="w-4 h-4 mt-0.5 shrink-0 text-primary" />
                    <div>
                      <strong>YouTube:</strong> Mettez le lien dans la description de vos vidéos
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <Mail className="w-4 h-4 mt-0.5 shrink-0 text-primary" />
                    <div>
                      <strong>Newsletter:</strong> Intégrez-le dans vos emails avec un CTA
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-primary/10 border border-primary/20 rounded-lg p-4">
                <p className="text-sm">
                  <strong className="text-primary">💰 Vos gains:</strong> 2€ par inscription + 0,50€/mois récurrents*
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  *Tant que l'utilisateur reste actif sur Vybbi
                </p>
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => window.open('/influenceurs#guide', '_blank')}
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Guide complet
                </Button>
                <Button
                  className="flex-1"
                  onClick={handleComplete}
                >
                  Accéder au dashboard
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
