import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface GAStats {
  activeUsers: number;
  newUsers: number;
  sessions: number;
  pageViews: number;
  conversions: number;
  avgSessionDuration: number;
  bounceRate: number;
}

export function useGAStats(startDate: string = 'yesterday', endDate: string = 'today') {
  return useQuery({
    queryKey: ['ga-stats', startDate, endDate],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke<GAStats>('ga4-fetch-data', {
        body: { startDate, endDate },
      });

      if (error) {
        console.error('Error fetching GA4 stats:', error);
        throw new Error(error.message || 'Failed to fetch GA4 statistics');
      }

      return data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });
}
