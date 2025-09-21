import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { UserPresence } from "@/types/social";

export function useOnlineUsers() {
  const [onlineUsers, setOnlineUsers] = useState<UserPresence[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOnlineUsers = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase.rpc('get_online_users', {
        limit_param: 20
      });

      if (fetchError) {
        throw fetchError;
      }

      const mappedUsers: UserPresence[] = (data || []).map(user => ({
        ...user,
        is_online: true // Users returned by get_online_users are online by definition
      }));
      setOnlineUsers(mappedUsers);
    } catch (err) {
      console.error('Error fetching online users:', err);
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOnlineUsers();

    // Subscribe to presence changes
    const channel = supabase
      .channel('user_presence_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_presence'
        },
        () => {
          fetchOnlineUsers();
        }
      )
      .subscribe();

    // Refresh every 30 seconds to update "last seen" times
    const interval = setInterval(fetchOnlineUsers, 30000);

    return () => {
      supabase.removeChannel(channel);
      clearInterval(interval);
    };
  }, []);

  return {
    onlineUsers,
    loading,
    error,
    refresh: fetchOnlineUsers
  };
}