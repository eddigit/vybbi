import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

export type SubscriptionTier = 'freemium' | 'solo' | 'pro' | 'elite';
export type SubscriptionStatus = 'active' | 'cancelled' | 'expired' | 'trialing';

interface SubscriptionData {
  tier: SubscriptionTier;
  status: SubscriptionStatus;
  expiresAt: string | null;
  startedAt: string | null;
  trialEndsAt: string | null;
}

interface QuotaInfo {
  allowed: boolean;
  quota_used: number;
  quota_limit: number;
  remaining?: number;
  reset_at?: string;
  reason?: string;
}

export function useSubscription() {
  const { user, profile } = useAuth();
  const [subscription, setSubscription] = useState<SubscriptionData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (profile) {
      // Les nouveaux champs ne sont pas encore dans le type TypeScript généré, on utilise any
      const profileAny = profile as any;
      setSubscription({
        tier: (profileAny.subscription_tier as SubscriptionTier) || 'freemium',
        status: (profileAny.subscription_status as SubscriptionStatus) || 'active',
        expiresAt: profileAny.subscription_expires_at || null,
        startedAt: profileAny.subscription_started_at || null,
        trialEndsAt: profileAny.trial_ends_at || null,
      });
      setLoading(false);
    }
  }, [profile]);

  // Fonction pour vérifier si un quota est disponible
  const checkQuota = async (quotaType: string): Promise<QuotaInfo> => {
    if (!user) {
      return {
        allowed: false,
        quota_used: 0,
        quota_limit: 0,
        reason: 'User not authenticated',
      };
    }

    try {
      const { data, error } = await supabase.rpc('check_quota', {
        p_user_id: user.id,
        p_quota_type: quotaType,
      });

      if (error) throw error;

      // Convertir explicitement le résultat JSONB en QuotaInfo
      return data ? (data as unknown as QuotaInfo) : {
        allowed: false,
        quota_used: 0,
        quota_limit: 0,
        reason: 'No data returned',
      };
    } catch (error) {
      console.error('Error checking quota:', error);
      return {
        allowed: false,
        quota_used: 0,
        quota_limit: 0,
        reason: 'Error checking quota',
      };
    }
  };

  // Fonction pour incrémenter un quota (à appeler après une action)
  const incrementQuota = async (quotaType: string): Promise<boolean> => {
    if (!user) return false;

    try {
      const { data, error } = await supabase.rpc('increment_quota', {
        p_user_id: user.id,
        p_quota_type: quotaType,
      });

      if (error) throw error;

      return data as boolean;
    } catch (error) {
      console.error('Error incrementing quota:', error);
      return false;
    }
  };

  // Fonction pour créer une session de checkout Stripe
  const createCheckoutSession = async (tier: SubscriptionTier, profileType: string) => {
    if (!user || !profile) {
      toast.error('Vous devez être connecté pour souscrire à un abonnement');
      return null;
    }

    try {
      const { data, error } = await supabase.functions.invoke('create-subscription-checkout', {
        body: { tier, profileType },
      });

      if (error) throw error;

      if (data?.url) {
        // Ouvrir Stripe Checkout dans un nouvel onglet
        window.open(data.url, '_blank');
        return data.url;
      }

      return null;
    } catch (error) {
      console.error('Error creating checkout session:', error);
      toast.error('Erreur lors de la création de la session de paiement');
      return null;
    }
  };

  // Fonction pour vérifier si l'utilisateur a accès à une fonctionnalité premium
  const hasFeatureAccess = (requiredTier: SubscriptionTier): boolean => {
    if (!subscription) return false;

    const tierHierarchy: Record<SubscriptionTier, number> = {
      freemium: 0,
      solo: 1,
      pro: 2,
      elite: 3,
    };

    return tierHierarchy[subscription.tier] >= tierHierarchy[requiredTier];
  };

  // Fonction pour afficher un message d'upgrade si nécessaire
  const requireFeatureAccess = (
    requiredTier: SubscriptionTier,
    featureName: string
  ): boolean => {
    const hasAccess = hasFeatureAccess(requiredTier);

    if (!hasAccess) {
      const tierNames: Record<SubscriptionTier, string> = {
        freemium: 'Freemium',
        solo: 'Solo',
        pro: 'Pro',
        elite: 'Elite',
      };

      toast.error(
        `Cette fonctionnalité (${featureName}) nécessite l'abonnement ${tierNames[requiredTier]} ou supérieur`,
        {
          action: {
            label: 'Voir les plans',
            onClick: () => window.location.href = '/tarification-specifique',
          },
        }
      );
    }

    return hasAccess;
  };

  return {
    subscription,
    loading,
    checkQuota,
    incrementQuota,
    createCheckoutSession,
    hasFeatureAccess,
    requireFeatureAccess,
    isFreemium: subscription?.tier === 'freemium',
    isSolo: subscription?.tier === 'solo',
    isPro: subscription?.tier === 'pro',
    isElite: subscription?.tier === 'elite',
  };
}
