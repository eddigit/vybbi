import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

// Session storage key for tracking affiliate visits
const AFFILIATE_SESSION_KEY = 'vybbi_affiliate_session';

export const useAffiliateTracking = () => {
  useEffect(() => {
    const trackAffiliateVisit = async () => {
      try {
        // Get affiliate code from URL params
        const urlParams = new URLSearchParams(window.location.search);
        const affiliateCode = urlParams.get('ref') || urlParams.get('affiliate');
        
        if (!affiliateCode) return;

        // Check if we already tracked this session
        const existingSession = sessionStorage.getItem(AFFILIATE_SESSION_KEY);
        if (existingSession) {
          const sessionData = JSON.parse(existingSession);
          if (sessionData.code === affiliateCode) {
            return; // Already tracked this session
          }
        }

        // Get or find the affiliate link
        const { data: linkData, error: linkError } = await supabase
          .from('influencer_links')
          .select('id')
          .eq('code', affiliateCode)
          .eq('is_active', true)
          .single();

        if (linkError || !linkData) {
          console.warn('Invalid affiliate code:', affiliateCode);
          return;
        }

        // Generate session ID
        const sessionId = crypto.randomUUID();

        // Track the visit
        const { error: visitError } = await supabase
          .from('affiliate_visits')
          .insert({
            link_id: linkData.id,
            session_id: sessionId,
            visitor_ip: null, // Will be handled server-side if needed
            user_agent: navigator.userAgent,
            referrer: document.referrer || null,
            page_url: window.location.href,
          });

        if (visitError) {
          console.error('Error tracking affiliate visit:', visitError);
          return;
        }

        // Update link clicks count
        const { error: updateError } = await supabase
          .rpc('increment_link_clicks', { link_id: linkData.id });

        if (updateError) {
          console.error('Error updating clicks count:', updateError);
        }

        // Store session data
        sessionStorage.setItem(AFFILIATE_SESSION_KEY, JSON.stringify({
          sessionId,
          linkId: linkData.id,
          code: affiliateCode,
          timestamp: new Date().toISOString()
        }));

        // Clean URL params
        const newUrl = new URL(window.location.href);
        newUrl.searchParams.delete('ref');
        newUrl.searchParams.delete('affiliate');
        window.history.replaceState({}, '', newUrl.toString());

      } catch (error) {
        console.error('Error in affiliate tracking:', error);
      }
    };

    trackAffiliateVisit();
  }, []);

  // Function to track conversions (to be called when user registers, subscribes, etc.)
  const trackConversion = async (conversionType: 'registration' | 'subscription' | 'booking', value?: number) => {
    try {
      const sessionData = sessionStorage.getItem(AFFILIATE_SESSION_KEY);
      if (!sessionData) return null;

      const { sessionId, linkId } = JSON.parse(sessionData);

      // Get current user ID if authenticated
      const { data: { user } } = await supabase.auth.getUser();
      
      const { data, error } = await supabase.functions.invoke('track-conversion', {
        body: {
          sessionId,
          linkId,
          userId: user?.id,
          conversionType,
          conversionValue: value
        }
      });

      if (error) {
        console.error('Error tracking conversion:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in conversion tracking:', error);
      return null;
    }
  };

  return { trackConversion };
};