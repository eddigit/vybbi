import { useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';

// Generate a session ID that persists during the browser session
const getSessionId = (): string => {
  let sessionId = sessionStorage.getItem('vybbi_session_id');
  if (!sessionId) {
    sessionId = crypto.randomUUID();
    sessionStorage.setItem('vybbi_session_id', sessionId);
  }
  return sessionId;
};

export const useProfileTracking = (
  profileId?: string,
  viewType: 'full_profile' | 'quick_preview' | 'search_result' = 'full_profile',
  referrerPage?: string
) => {
  const trackedRef = useRef(false);

  useEffect(() => {
    if (!profileId || trackedRef.current) return;

    const trackView = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const sessionId = getSessionId();
        
        await supabase.rpc('track_profile_view', {
          p_viewed_profile_id: profileId,
          p_view_type: viewType,
          p_referrer_page: referrerPage || window.location.pathname,
          p_session_id: sessionId
        });

        trackedRef.current = true;
      } catch (error) {
        console.error('Error tracking profile view:', error);
      }
    };

    // Add a small delay to avoid tracking quick page transitions
    const timer = setTimeout(trackView, 2000);
    
    return () => clearTimeout(timer);
  }, [profileId, viewType, referrerPage]);
};

export const useProfileViewStats = (profileId?: string) => {
  const fetchStats = async () => {
    if (!profileId) return null;
    
    const { data, error } = await supabase.rpc('get_profile_view_stats', {
      p_profile_id: profileId
    });
    
    if (error) {
      console.error('Error fetching profile stats:', error);
      return null;
    }
    
    return data?.[0] || null;
  };

  return { fetchStats };
};

export const useProfileVisitors = (profileId?: string, limit = 20) => {
  const fetchVisitors = async () => {
    if (!profileId) return [];
    
    const { data, error } = await supabase
      .from('profile_views')
      .select(`
        id,
        created_at,
        view_type,
        referrer_page,
        viewer_profile:viewer_profile_id(
          id,
          display_name,
          avatar_url,
          profile_type,
          location
        )
      `)
      .eq('viewed_profile_id', profileId)
      .order('created_at', { ascending: false })
      .limit(limit);
    
    if (error) {
      console.error('Error fetching profile visitors:', error);
      return [];
    }
    
    return data || [];
  };

  return { fetchVisitors };
};