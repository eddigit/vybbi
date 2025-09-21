import React from 'react';
import { Shield, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useBlockchainCertification, CertificationMetadata } from '@/hooks/useBlockchainCertification';

interface BlockchainCertifyButtonProps {
  musicReleaseId: string;
  metadata: CertificationMetadata;
  variant?: 'default' | 'outline' | 'secondary';
  size?: 'sm' | 'default' | 'lg';
  className?: string;
  disabled?: boolean;
}

export const BlockchainCertifyButton: React.FC<BlockchainCertifyButtonProps> = ({
  musicReleaseId,
  metadata,
  variant = 'default',
  size = 'default',
  className,
  disabled = false,
}) => {
  const { createCertification, isCreating, isCertified } = useBlockchainCertification(musicReleaseId);

  const handleCertify = () => {
    createCertification({ musicReleaseId, metadata });
  };

  if (isCertified) {
    return (
      <Button
        variant="secondary"
        size={size}
        className={`${className} cursor-default`}
        disabled
      >
        <Shield className="h-4 w-4 mr-2 text-green-600" />
        Déjà certifié
      </Button>
    );
  }

  return (
    <Button
      variant={variant}
      size={size}
      className={className}
      onClick={handleCertify}
      disabled={disabled || isCreating}
    >
      {isCreating ? (
        <>
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          Certification...
        </>
      ) : (
        <>
          <Shield className="h-4 w-4 mr-2" />
          Certifier sur Blockchain
        </>
      )}
    </Button>
  );
};