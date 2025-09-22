import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface FollowStats {
  following_count: number;
  followers_count: number;
}

export function useFollowStats(userId?: string) {
  const [stats, setStats] = useState<FollowStats>({ following_count: 0, followers_count: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    const fetchStats = async () => {
      try {
        setLoading(true);
        setError(null);

        const { data, error: fetchError } = await supabase.rpc('get_user_follow_stats', {
          user_id_param: userId
        });

        if (fetchError) throw fetchError;

        if (data && data.length > 0) {
          setStats({
            following_count: Number(data[0].following_count) || 0,
            followers_count: Number(data[0].followers_count) || 0
          });
        }
      } catch (err) {
        console.error('Error fetching follow stats:', err);
        setError(err instanceof Error ? err.message : 'Une erreur est survenue');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [userId]);

  return { stats, loading, error };
}