import { useState } from 'react';
import { Share2, QrCode, Copy, Facebook, Twitter, LinkedinIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import QRCodeLib from 'qrcode';

interface ProfileShareToolsProps {
  profileUrl: string;
  artistName: string;
  className?: string;
}

export function ProfileShareTools({ profileUrl, artistName, className = '' }: ProfileShareToolsProps) {
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  const [isQRDialogOpen, setIsQRDialogOpen] = useState(false);
  const { toast } = useToast();

  const generateQRCode = async () => {
    try {
      const qrUrl = await QRCodeLib.toDataURL(profileUrl, {
        width: 256,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });
      setQrCodeUrl(qrUrl);
      setIsQRDialogOpen(true);
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de générer le QR Code",
        variant: "destructive"
      });
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(profileUrl);
      toast({
        title: "Lien copié !",
        description: "Le lien du profil a été copié dans le presse-papier",
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de copier le lien",
        variant: "destructive"
      });
    }
  };

  const shareOnSocial = (platform: string) => {
    const text = `Découvrez le profil de ${artistName} sur Vybbi`;
    const encodedText = encodeURIComponent(text);
    const encodedUrl = encodeURIComponent(profileUrl);

    let shareUrl = '';
    
    switch (platform) {
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
        break;
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`;
        break;
      case 'linkedin':
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`;
        break;
      default:
        return;
    }

    window.open(shareUrl, '_blank', 'noopener,noreferrer');
  };

  const downloadQRCode = () => {
    if (!qrCodeUrl) return;
    
    const link = document.createElement('a');
    link.download = `qr-code-${artistName.toLowerCase().replace(/\s+/g, '-')}.png`;
    link.href = qrCodeUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className={`flex items-center gap-1 sm:gap-2 ${className}`}>
      {/* Copy Link Button */}
      <Button
        variant="outline"
        size="sm"
        onClick={copyToClipboard}
        className="bg-white/10 backdrop-blur-sm border-white/20 text-white hover:bg-white/20 px-2 sm:px-3"
      >
        <Copy className="h-4 w-4" />
        <span className="hidden sm:inline sm:ml-2">Copier le lien</span>
      </Button>

      {/* QR Code Dialog */}
      <Dialog open={isQRDialogOpen} onOpenChange={setIsQRDialogOpen}>
        <DialogTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            onClick={generateQRCode}
            className="bg-white/10 backdrop-blur-sm border-white/20 text-white hover:bg-white/20 px-2 sm:px-3"
          >
            <QrCode className="h-4 w-4" />
            <span className="hidden sm:inline sm:ml-2">QR Code</span>
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>QR Code du profil</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center space-y-4">
            {qrCodeUrl && (
              <>
                <img src={qrCodeUrl} alt="QR Code du profil" className="rounded-lg" />
                <p className="text-sm text-muted-foreground text-center">
                  Scannez ce code pour accéder directement au profil de {artistName}
                </p>
                <Button onClick={downloadQRCode} variant="outline" className="w-full">
                  Télécharger le QR Code
                </Button>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Share Menu */}
      <Dialog>
        <DialogTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="bg-white/10 backdrop-blur-sm border-white/20 text-white hover:bg-white/20 px-2 sm:px-3"
          >
            <Share2 className="h-4 w-4" />
            <span className="hidden sm:inline sm:ml-2">Partager</span>
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Partager ce profil</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-3 gap-4">
            <Button
              variant="outline"
              className="flex flex-col items-center p-4 h-auto"
              onClick={() => shareOnSocial('facebook')}
            >
              <Facebook className="h-6 w-6 mb-2 text-blue-600" />
              <span className="text-xs">Facebook</span>
            </Button>
            <Button
              variant="outline"
              className="flex flex-col items-center p-4 h-auto"
              onClick={() => shareOnSocial('twitter')}
            >
              <Twitter className="h-6 w-6 mb-2 text-blue-400" />
              <span className="text-xs">Twitter</span>
            </Button>
            <Button
              variant="outline"
              className="flex flex-col items-center p-4 h-auto"
              onClick={() => shareOnSocial('linkedin')}
            >
              <LinkedinIcon className="h-6 w-6 mb-2 text-blue-700" />
              <span className="text-xs">LinkedIn</span>
            </Button>
          </div>
          <div className="pt-4 border-t">
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={profileUrl}
                readOnly
                className="flex-1 p-2 border rounded text-sm bg-muted"
              />
              <Button size="sm" onClick={copyToClipboard}>
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}