import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { InfluencerLink } from '@/lib/types';
import { Download, Copy } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface AffiliateQRGeneratorProps {
  link: InfluencerLink | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const AffiliateQRGenerator = ({ link, open, onOpenChange }: AffiliateQRGeneratorProps) => {
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [affiliateUrl, setAffiliateUrl] = useState<string>('');

  useEffect(() => {
    if (link && open) {
      const baseUrl = window.location.origin;
      const url = `${baseUrl}?ref=${link.code}`;
      setAffiliateUrl(url);
      
      // Generate QR code using a free service
      const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(url)}&format=png`;
      setQrCodeUrl(qrUrl);
    }
  }, [link, open]);

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Copié !",
        description: "Le lien a été copié dans le presse-papiers"
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de copier le lien",
        variant: "destructive"
      });
    }
  };

  const downloadQRCode = async () => {
    try {
      const response = await fetch(qrCodeUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = `qr-code-${link?.code}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      
      toast({
        title: "Téléchargé !",
        description: "QR Code téléchargé avec succès"
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de télécharger le QR Code",
        variant: "destructive"
      });
    }
  };

  if (!link) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>QR Code - {link.name || link.code}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* QR Code Display */}
          <div className="flex justify-center">
            <div className="p-4 bg-white rounded-lg border">
              <img
                src={qrCodeUrl}
                alt="QR Code"
                className="w-64 h-64"
              />
            </div>
          </div>

          {/* Affiliate URL */}
          <div className="space-y-2">
            <Label>Lien d'affiliation</Label>
            <div className="flex gap-2">
              <Input
                value={affiliateUrl}
                readOnly
                className="font-mono text-sm"
              />
              <Button
                size="sm"
                variant="outline"
                onClick={() => copyToClipboard(affiliateUrl)}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={downloadQRCode}
              className="flex items-center gap-2 flex-1"
            >
              <Download className="h-4 w-4" />
              Télécharger QR
            </Button>
            <Button
              onClick={() => copyToClipboard(affiliateUrl)}
              className="flex items-center gap-2 flex-1"
            >
              <Copy className="h-4 w-4" />
              Copier lien
            </Button>
          </div>

          {/* Instructions */}
          <div className="text-sm text-muted-foreground space-y-1">
            <p><strong>Comment utiliser :</strong></p>
            <p>• Partagez ce lien sur vos réseaux sociaux</p>
            <p>• Intégrez le QR code dans vos supports visuels</p>
            <p>• Suivez vos conversions dans le dashboard</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};