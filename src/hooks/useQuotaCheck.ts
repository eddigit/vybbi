import { useState, useCallback } from 'react';
import { useSubscription } from './useSubscription';
import { toast } from 'sonner';

export type QuotaType = 
  | 'radio_submissions' 
  | 'offer_responses' 
  | 'conversations' 
  | 'social_posts' 
  | 'blockchain_certifications'
  | 'profile_boosts';

interface UseQuotaCheckOptions {
  showToast?: boolean;
  onQuotaExceeded?: () => void;
}

export function useQuotaCheck(
  quotaType: QuotaType,
  options: UseQuotaCheckOptions = {}
) {
  const { showToast = true, onQuotaExceeded } = options;
  const { checkQuota, incrementQuota, subscription } = useSubscription();
  const [checking, setChecking] = useState(false);

  const checkAndIncrement = useCallback(async (): Promise<boolean> => {
    setChecking(true);

    try {
      // Vérifier d'abord si l'action est autorisée
      const quotaInfo = await checkQuota(quotaType);

      if (!quotaInfo.allowed) {
        if (showToast) {
          const quotaNames: Record<QuotaType, string> = {
            radio_submissions: 'soumissions radio',
            offer_responses: 'réponses aux offres',
            conversations: 'conversations',
            social_posts: 'publications sociales',
            blockchain_certifications: 'certifications blockchain',
            profile_boosts: 'mises en avant de profil',
          };

          if (quotaInfo.reason === 'Quota exceeded') {
            toast.error(
              `Limite de ${quotaNames[quotaType]} atteinte (${quotaInfo.quota_used}/${quotaInfo.quota_limit})`,
              {
                description: quotaInfo.reset_at
                  ? `Réinitialisation le ${new Date(quotaInfo.reset_at).toLocaleDateString('fr-FR')}`
                  : 'Passez à un plan supérieur pour augmenter vos quotas',
                action: {
                  label: 'Voir les plans',
                  onClick: () => window.location.href = '/tarification-specifique',
                },
              }
            );
          } else {
            toast.error(`Action non autorisée: ${quotaInfo.reason}`);
          }
        }

        if (onQuotaExceeded) {
          onQuotaExceeded();
        }

        return false;
      }

      // Si autorisé, incrémenter le compteur
      const incremented = await incrementQuota(quotaType);

      if (!incremented) {
        if (showToast) {
          toast.error('Erreur lors de la mise à jour du quota');
        }
        return false;
      }

      // Afficher un toast informatif si proche de la limite
      if (quotaInfo.remaining && quotaInfo.remaining <= 2 && showToast) {
        toast.warning(
          `Il vous reste ${quotaInfo.remaining} action(s) avant d'atteindre votre limite`,
          {
            description: 'Pensez à passer à un plan supérieur',
          }
        );
      }

      return true;
    } catch (error) {
      console.error('Error checking quota:', error);
      if (showToast) {
        toast.error('Erreur lors de la vérification du quota');
      }
      return false;
    } finally {
      setChecking(false);
    }
  }, [quotaType, checkQuota, incrementQuota, showToast, onQuotaExceeded]);

  return {
    checkAndIncrement,
    checking,
    subscription,
  };
}
