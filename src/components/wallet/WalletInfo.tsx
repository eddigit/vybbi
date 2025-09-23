import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Copy, Wallet, ExternalLink } from 'lucide-react';
import { useWallet } from './PhantomWalletProvider';
import { toast } from 'sonner';

export const WalletInfo: React.FC = () => {
  const { connected, publicKey, balance, disconnect } = useWallet();

  if (!connected || !publicKey) {
    return null;
  }

  const copyAddress = () => {
    navigator.clipboard.writeText(publicKey);
    toast.success('Adresse copiée dans le presse-papiers');
  };

  const formatBalance = (balance: number | null) => {
    if (balance === null) return '-.---';
    return balance.toFixed(3);
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wallet className="h-5 w-5" />
          Wallet Connecté
          <Badge variant="secondary" className="bg-success/10 text-success">
            Actif
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="text-sm font-medium text-muted-foreground">
            Adresse
          </label>
          <div className="flex items-center gap-2 mt-1">
            <code className="flex-1 px-2 py-1 bg-muted rounded text-sm font-mono">
              {`${publicKey.slice(0, 8)}...${publicKey.slice(-8)}`}
            </code>
            <Button
              size="sm"
              variant="ghost"
              onClick={copyAddress}
              className="h-8 w-8 p-0"
            >
              <Copy className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              asChild
              className="h-8 w-8 p-0"
            >
              <a
                href={`https://solscan.io/account/${publicKey}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <ExternalLink className="h-4 w-4" />
              </a>
            </Button>
          </div>
        </div>

        <div>
          <label className="text-sm font-medium text-muted-foreground">
            Solde SOL
          </label>
          <div className="text-lg font-semibold mt-1">
            {formatBalance(balance)} SOL
          </div>
        </div>

        <Button
          onClick={disconnect}
          variant="outline"
          size="sm"
          className="w-full"
        >
          Déconnecter
        </Button>
      </CardContent>
    </Card>
  );
};