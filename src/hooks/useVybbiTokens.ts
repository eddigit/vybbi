import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

interface TokenBalance {
  id: string;
  balance: number;
  total_earned: number;
  total_spent: number;
  level: string;
  multiplier: number;
}

interface TokenTransaction {
  id: string;
  transaction_type: 'earned' | 'spent' | 'bonus' | 'penalty';
  amount: number;
  reason: string;
  description?: string;
  reference_type?: string;
  reference_id?: string;
  metadata?: any;
  processed_at: string;
}

interface SpendingOption {
  id: string;
  option_name: string;
  option_type: string;
  vybbi_cost: number;
  duration_days?: number;
  description?: string;
  benefits?: any;
}

export const useVybbiTokens = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch user token balance
  const { data: balance, isLoading: balanceLoading } = useQuery({
    queryKey: ['vybbi-balance', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      
      const { data, error } = await supabase
        .from('user_token_balances')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      return data as TokenBalance | null;
    },
    enabled: !!user?.id,
  });

  // Fetch transaction history
  const { data: transactions, isLoading: transactionsLoading } = useQuery({
    queryKey: ['vybbi-transactions', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('token_transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('processed_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      return data as TokenTransaction[];
    },
    enabled: !!user?.id,
  });

  // Fetch spending options
  const { data: spendingOptions, isLoading: optionsLoading } = useQuery({
    queryKey: ['vybbi-spending-options'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('token_spending_options')
        .select('*')
        .eq('is_active', true)
        .order('vybbi_cost', { ascending: true });

      if (error) throw error;
      return data as SpendingOption[];
    },
  });

  // Award tokens (admin only)
  const awardTokens = useMutation({
    mutationFn: async ({ 
      targetUserId, 
      amount, 
      reason, 
      description 
    }: { 
      targetUserId: string; 
      amount: number; 
      reason: string; 
      description?: string;
    }) => {
      const { data, error } = await supabase.rpc('award_vybbi_tokens', {
        target_user_id: targetUserId,
        amount,
        reason,
        description,
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vybbi-balance'] });
      queryClient.invalidateQueries({ queryKey: ['vybbi-transactions'] });
      toast.success('Jetons VYBBI attribués avec succès !');
    },
    onError: (error) => {
      console.error('Error awarding tokens:', error);
      toast.error('Erreur lors de l\'attribution des jetons');
    },
  });

  // Spend tokens with marketplace effects processing
  const spendTokens = useMutation({
    mutationFn: async ({ 
      amount, 
      reason, 
      description,
      referenceType,
      referenceId,
      optionId
    }: { 
      amount: number; 
      reason: string; 
      description?: string;
      referenceType?: string;
      referenceId?: string;
      optionId?: string;
    }) => {
      if (!user?.id) throw new Error('User not authenticated');
      
      // First spend the tokens
      const { data: spendData, error: spendError } = await supabase.rpc('spend_vybbi_tokens', {
        spender_user_id: user.id,
        amount,
        reason,
        description,
        reference_type: referenceType,
        reference_id: referenceId,
      });

      if (spendError) throw spendError;

      // If this is a marketplace purchase, process the real effects
      if (optionId && referenceType === 'spending_option') {
        const { data: effectsData, error: effectsError } = await supabase.rpc('process_marketplace_purchase', {
          purchase_user_id: user.id,
          option_id: optionId,
          tokens_spent: amount
        });

        if (effectsError) {
          console.error('Error processing marketplace effects:', effectsError);
          // Continue anyway - tokens were spent successfully
        } else {
          console.log('Marketplace effects applied:', effectsData);
        }
      }

      return spendData;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['vybbi-balance'] });
      queryClient.invalidateQueries({ queryKey: ['vybbi-transactions'] });
      
      if (variables.optionId && variables.referenceType === 'spending_option') {
        toast.success('Achat effectué ! Les effets ont été activés sur votre compte.');
      } else {
        toast.success('Jetons VYBBI dépensés avec succès !');
      }
    },
    onError: (error) => {
      console.error('Error spending tokens:', error);
      toast.error('Solde VYBBI insuffisant ou erreur de transaction');
    },
  });

  // Daily login token claim
  const claimDailyTokens = useMutation({
    mutationFn: async () => {
      if (!user?.id) throw new Error('User not authenticated');
      
      const { data, error } = await supabase.rpc('award_daily_login_tokens', {
        user_id_param: user.id
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (awarded) => {
      if (awarded) {
        queryClient.invalidateQueries({ queryKey: ['vybbi-balance'] });
        queryClient.invalidateQueries({ queryKey: ['vybbi-transactions'] });
        toast.success('🎉 +10 VYBBI pour votre connexion quotidienne !');
      }
    },
    onError: (error) => {
      console.error('Error claiming daily tokens:', error);
    },
  });

  // Initialize user balance if not exists
  const initializeBalance = useMutation({
    mutationFn: async () => {
      if (!user?.id) throw new Error('User not authenticated');
      
      const { error } = await supabase
        .from('user_token_balances')
        .insert({ user_id: user.id })
        .select()
        .single();

      if (error && error.code !== '23505') { // Ignore unique constraint error
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vybbi-balance'] });
    },
  });

  // Auto-initialize balance on first load
  useEffect(() => {
    if (user?.id && !balanceLoading && !balance && !initializeBalance.isPending) {
      initializeBalance.mutate();
    }
  }, [user?.id, balanceLoading, balance, initializeBalance]);

  return {
    balance: balance || { balance: 0, total_earned: 0, total_spent: 0, level: 'bronze', multiplier: 1.05 },
    transactions: transactions || [],
    spendingOptions: spendingOptions || [],
    isLoading: balanceLoading || transactionsLoading || optionsLoading,
    awardTokens,
    spendTokens,
    claimDailyTokens,
    initializeBalance,
  };
};