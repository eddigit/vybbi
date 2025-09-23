import React from 'react';
import { Button } from '@/components/ui/button';
import { ExternalLink, ShoppingCart } from 'lucide-react';
import { VYBBI_TOKEN } from '@/types/wallet';

interface TokenPurchaseButtonProps {
  variant?: 'default' | 'outline' | 'secondary' | 'ghost';
  size?: 'sm' | 'default' | 'lg';
  className?: string;
}

export const TokenPurchaseButton: React.FC<TokenPurchaseButtonProps> = ({
  variant = 'default',
  size = 'lg',
  className = '',
}) => {
  const handlePurchase = () => {
    window.open(VYBBI_TOKEN.pumpFunUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <Button
      onClick={handlePurchase}
      variant={variant}
      size={size}
      className={`bg-gradient-to-r from-primary to-primary-glow hover:from-primary-glow hover:to-primary text-primary-foreground ${className}`}
    >
      <ShoppingCart className="mr-2 h-5 w-5" />
      Acheter VYBBI
      <ExternalLink className="ml-2 h-4 w-4" />
    </Button>
  );
};