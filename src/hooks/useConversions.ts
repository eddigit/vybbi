import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface ConversionData {
  id: string;
  prospect_id: string;
  agent_id: string;
  user_id: string;
  conversion_status: string;
  conversion_value?: number;
  commission_amount?: number;
  commission_paid: boolean;
  commission_paid_at?: string;
  subscription_type?: string;
  confirmed_at?: string;
  created_at: string;
}

export interface ConversionMetrics {
  totalConversions: number;
  thisMonthConversions: number;
  totalRevenue: number;
  thisMonthRevenue: number;
  conversionRate: number;
  avgDealSize: number;
  pendingCommissions: number;
  paidCommissions: number;
}

export function useConversions(agentId?: string) {
  const [conversions, setConversions] = useState<ConversionData[]>([]);
  const [loading, setLoading] = useState(true);

  const loadConversions = async () => {
    try {
      setLoading(true);
      
      let query = supabase
        .from('conversion_tracking')
        .select('*')
        .order('created_at', { ascending: false });

      if (agentId) {
        query = query.eq('agent_id', agentId);
      }

      const { data, error } = await query;

      if (error) throw error;
      
      setConversions(data || []);
    } catch (err) {
      console.error('Error loading conversions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadConversions();
  }, [agentId]);

  return { conversions, loading, refetch: loadConversions };
}

export function useConversionMetrics() {
  const [metrics, setMetrics] = useState<ConversionMetrics>({
    totalConversions: 0,
    thisMonthConversions: 0,
    totalRevenue: 0,
    thisMonthRevenue: 0,
    conversionRate: 0,
    avgDealSize: 0,
    pendingCommissions: 0,
    paidCommissions: 0
  });
  const [loading, setLoading] = useState(true);

  const loadMetrics = async () => {
    try {
      setLoading(true);
      
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      // Get conversions
      const { data: conversions, error: conversionsError } = await supabase
        .from('conversion_tracking')
        .select('*');

      // Get prospects for conversion rate calculation
      const { data: prospects, error: prospectsError } = await supabase
        .from('prospects')
        .select('id');

      if (conversionsError || prospectsError) {
        throw conversionsError || prospectsError;
      }

      if (conversions && prospects) {
        const confirmedConversions = conversions.filter(c => c.conversion_status === 'confirmed');
        const thisMonthConversions = confirmedConversions.filter(c => 
          new Date(c.created_at) >= startOfMonth
        );

        const totalRevenue = confirmedConversions.reduce((sum, c) => 
          sum + (c.conversion_value || 0), 0
        );
        
        const thisMonthRevenue = thisMonthConversions.reduce((sum, c) => 
          sum + (c.conversion_value || 0), 0
        );

        const pendingCommissions = conversions
          .filter(c => c.conversion_status === 'confirmed' && !c.commission_paid)
          .reduce((sum, c) => sum + (c.commission_amount || 0), 0);

        const paidCommissions = conversions
          .filter(c => c.commission_paid)
          .reduce((sum, c) => sum + (c.commission_amount || 0), 0);

        setMetrics({
          totalConversions: confirmedConversions.length,
          thisMonthConversions: thisMonthConversions.length,
          totalRevenue,
          thisMonthRevenue,
          conversionRate: prospects.length > 0 ? (confirmedConversions.length / prospects.length) * 100 : 0,
          avgDealSize: confirmedConversions.length > 0 ? totalRevenue / confirmedConversions.length : 0,
          pendingCommissions,
          paidCommissions
        });
      }
    } catch (err) {
      console.error('Error loading conversion metrics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMetrics();
  }, []);

  return { metrics, loading, refetch: loadMetrics };
}