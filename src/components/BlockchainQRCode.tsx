import React from 'react';
import QRCode from 'react-qr-code';
import { Button } from '@/components/ui/button';
import { Download, Copy } from 'lucide-react';
import { toast } from 'sonner';

interface BlockchainQRCodeProps {
  verificationUrl: string;
  title: string;
  size?: number;
}

export const BlockchainQRCode: React.FC<BlockchainQRCodeProps> = ({
  verificationUrl,
  title,
  size = 200,
}) => {
  const handleDownload = () => {
    const svg = document.getElementById('blockchain-qr-code');
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    canvas.width = size;
    canvas.height = size;

    img.onload = () => {
      ctx?.drawImage(img, 0, 0);
      const pngFile = canvas.toDataURL('image/png');
      
      const downloadLink = document.createElement('a');
      downloadLink.download = `qr-certification-${title.replace(/[^a-z0-9]/gi, '-')}.png`;
      downloadLink.href = pngFile;
      downloadLink.click();
    };

    img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
  };

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(verificationUrl);
    toast.success('Lien de vérification copié dans le presse-papier');
  };

  return (
    <div className="flex flex-col items-center space-y-4 p-4 border rounded-lg bg-card">
      <div className="bg-background p-4 rounded-lg border border-border/50">
        <QRCode
          id="blockchain-qr-code"
          value={verificationUrl}
          size={size}
          style={{ height: "auto", maxWidth: "100%", width: "100%" }}
        />
      </div>
      
      <div className="text-center">
        <p className="text-sm font-medium">QR Code de Certification</p>
        <p className="text-xs text-muted-foreground">
          Scannez pour vérifier l'authenticité sur la blockchain
        </p>
      </div>

      <div className="flex gap-2">
        <Button variant="outline" size="sm" onClick={handleCopyUrl}>
          <Copy className="h-4 w-4 mr-2" />
          Copier le lien
        </Button>
        <Button variant="outline" size="sm" onClick={handleDownload}>
          <Download className="h-4 w-4 mr-2" />
          Télécharger
        </Button>
      </div>
    </div>
  );
};