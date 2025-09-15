import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface EventRSVPData {
  attendeesCount: number;
  userStatus: 'attending' | 'not_attending' | null;
  loading: boolean;
  error: string | null;
}

export function useEventRSVP(eventId: string): EventRSVPData & { refetch: () => void } {
  const { user } = useAuth();
  const [data, setData] = useState<EventRSVPData>({
    attendeesCount: 0,
    userStatus: null,
    loading: true,
    error: null
  });

  const fetchRSVPData = async () => {
    if (!eventId) return;

    setData(prev => ({ ...prev, loading: true, error: null }));

    try {
      // Get attendees count
      const { data: countData, error: countError } = await supabase
        .rpc('get_event_attendees_count', { event_uuid: eventId });

      if (countError) throw countError;

      // Get user status if logged in
      let userStatus = null;
      if (user) {
        const { data: statusData, error: statusError } = await supabase
          .rpc('get_user_event_status', { 
            event_uuid: eventId, 
            user_uuid: user.id 
          });

        if (statusError && statusError.code !== 'PGRST116') {
          throw statusError;
        }

        userStatus = statusData;
      }

      setData({
        attendeesCount: countData || 0,
        userStatus: userStatus as 'attending' | 'not_attending' | null,
        loading: false,
        error: null
      });
    } catch (error) {
      console.error('Error fetching RSVP data:', error);
      setData(prev => ({
        ...prev,
        loading: false,
        error: 'Erreur lors du chargement des données RSVP'
      }));
    }
  };

  useEffect(() => {
    fetchRSVPData();
  }, [eventId, user?.id]);

  // Subscribe to real-time changes
  useEffect(() => {
    if (!eventId) return;

    const subscription = supabase
      .channel('event_attendees_changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'event_attendees',
        filter: `event_id=eq.${eventId}`
      }, () => {
        fetchRSVPData();
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [eventId]);

  return {
    ...data,
    refetch: fetchRSVPData
  };
}