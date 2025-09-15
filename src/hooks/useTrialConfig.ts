import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface TrialConfig {
  days: number;
  active: boolean;
  end_date?: string;
  expired?: boolean;
  switched_on?: string;
}

interface UseTrialConfigResult {
  trialDays: number;
  isPromotionalActive: boolean;
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export function useTrialConfig(): UseTrialConfigResult {
  const [trialDays, setTrialDays] = useState<number>(30); // Default to 30 days
  const [isPromotionalActive, setIsPromotionalActive] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTrialConfig = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Fetch both promotional and standard trial configurations
      const { data: configs, error: fetchError } = await supabase
        .from('system_config')
        .select('config_key, config_value, description')
        .in('config_key', ['promotional_trial', 'standard_trial']);

      if (fetchError) {
        throw fetchError;
      }

      if (!configs || configs.length === 0) {
        // Fallback to default values if no config found
        setTrialDays(30);
        setIsPromotionalActive(true);
        return;
      }

      const promotionalConfig = configs.find(c => c.config_key === 'promotional_trial');
      const standardConfig = configs.find(c => c.config_key === 'standard_trial');

      // Check if promotional offer is still active
      const promoValue = promotionalConfig?.config_value as unknown as TrialConfig | undefined;
      const standardValue = standardConfig?.config_value as unknown as TrialConfig | undefined;
      
      const isPromoActive = promoValue?.active === true && !promoValue?.expired;

      if (isPromoActive) {
        // Use promotional offer (30 days)
        setTrialDays(promoValue?.days || 30);
        setIsPromotionalActive(true);
      } else {
        // Use standard offer (7 days)
        setTrialDays(standardValue?.days || 7);
        setIsPromotionalActive(false);
      }

    } catch (err) {
      console.error('Error fetching trial configuration:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
      
      // Fallback to safe defaults
      setTrialDays(7); // Use conservative default
      setIsPromotionalActive(false);
    } finally {
      setIsLoading(false);
    }
  };

  const refresh = async () => {
    await fetchTrialConfig();
  };

  useEffect(() => {
    fetchTrialConfig();
  }, []);

  return {
    trialDays,
    isPromotionalActive,
    isLoading,
    error,
    refresh
  };
}