import React from 'react';
import { Shield, ExternalLink, QrCode } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useBlockchainCertification } from '@/hooks/useBlockchainCertification';
import { toast } from 'sonner';

interface BlockchainCertificationBadgeProps {
  musicReleaseId: string;
  title: string;
  artist: string;
  className?: string;
}

export const BlockchainCertificationBadge: React.FC<BlockchainCertificationBadgeProps> = ({
  musicReleaseId,
  title,
  artist,
  className,
}) => {
  const { certification, isCertified } = useBlockchainCertification(musicReleaseId);

  if (!isCertified || !certification) {
    return null;
  }

  const handleCopyVerificationUrl = () => {
    if (certification.certificate_url) {
      navigator.clipboard.writeText(certification.certificate_url);
      toast.success('Lien de vérification copié dans le presse-papier');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Badge 
          variant="secondary" 
          className={`cursor-pointer hover:bg-primary/10 ${className}`}
        >
          <Shield className="h-3 w-3 mr-1" />
          Certifié Blockchain
        </Badge>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-green-600" />
            Certificat Blockchain
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="bg-muted/50 p-4 rounded-lg">
            <h4 className="font-semibold text-sm mb-2">Œuvre Certifiée</h4>
            <p className="text-sm font-medium">{title}</p>
            <p className="text-sm text-muted-foreground">par {artist}</p>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Réseau :</span>
              <p className="font-medium capitalize">{certification.blockchain_network}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Bloc :</span>
              <p className="font-medium">#{certification.block_number}</p>
            </div>
            <div className="col-span-2">
              <span className="text-muted-foreground">Date de certification :</span>
              <p className="font-medium">{formatDate(certification.created_at)}</p>
            </div>
          </div>

          <div className="border-t pt-4">
            <p className="text-xs text-muted-foreground">Hash de transaction :</p>
            <p className="text-xs font-mono bg-muted p-2 rounded break-all">
              {certification.transaction_hash}
            </p>
          </div>

          <div className="border-t pt-4">
            <p className="text-xs text-muted-foreground">Hash de certification :</p>
            <p className="text-xs font-mono bg-muted p-2 rounded break-all">
              {certification.certification_hash}
            </p>
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopyVerificationUrl}
              className="flex-1"
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Copier le lien
            </Button>
            {certification.qr_code_url && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  // Download QR code (simplified implementation)
                  const link = document.createElement('a');
                  link.href = certification.qr_code_url!;
                  link.download = `qr-${title.replace(/[^a-z0-9]/gi, '-')}.txt`;
                  link.click();
                }}
              >
                <QrCode className="h-4 w-4" />
              </Button>
            )}
          </div>

          <div className="bg-green-50 border border-green-200 p-3 rounded-lg">
            <p className="text-xs text-green-800">
              ✅ Cette œuvre musicale est protégée par la blockchain et dispose d'une preuve d'antériorité immuable.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};