import React from 'react';
import { Button } from '@/components/ui/button';
import { Wallet, Loader2 } from 'lucide-react';
import { useWallet } from './PhantomWalletProvider';

interface WalletConnectionButtonProps {
  variant?: 'default' | 'outline' | 'secondary' | 'ghost';
  size?: 'sm' | 'default' | 'lg';
  className?: string;
}

export const WalletConnectionButton: React.FC<WalletConnectionButtonProps> = ({
  variant = 'default',
  size = 'default',
  className = '',
}) => {
  const { connected, connecting, connect, disconnect, publicKey, error } = useWallet();

  const handleClick = () => {
    if (connected) {
      disconnect();
    } else {
      connect();
    }
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 4)}...${address.slice(-4)}`;
  };

  if (error) {
    return (
      <div className="text-destructive text-sm">{error}</div>
    );
  }

  return (
    <Button
      onClick={handleClick}
      variant={variant}
      size={size}
      className={className}
      disabled={connecting}
    >
      {connecting ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Connexion...
        </>
      ) : connected ? (
        <>
          <Wallet className="mr-2 h-4 w-4" />
          {publicKey ? formatAddress(publicKey) : 'Connecté'}
        </>
      ) : (
        <>
          <Wallet className="mr-2 h-4 w-4" />
          Connecter Phantom
        </>
      )}
    </Button>
  );
};