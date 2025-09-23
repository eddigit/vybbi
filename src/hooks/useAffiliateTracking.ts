import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

// Session storage key for tracking affiliate visits
const AFFILIATE_SESSION_KEY = 'vybbi_affiliate_session';

// Type for the RPC response
interface AffiliateTrackingResult {
  success: boolean;
  error?: string;
  visit_id?: string;
  link_id?: string;
  clicks_count?: number;
}

export const useAffiliateTracking = () => {
  useEffect(() => {
    const trackAffiliateVisit = async () => {
      try {
        // Get affiliate code from URL params
        const urlParams = new URLSearchParams(window.location.search);
        const affiliateCode = urlParams.get('ref') || urlParams.get('affiliate');
        
        if (!affiliateCode) {
          console.log('No affiliate code found in URL');
          return;
        }

        console.log('Affiliate code detected:', affiliateCode);

        // Check if we already tracked this session
        const existingSession = sessionStorage.getItem(AFFILIATE_SESSION_KEY);
        if (existingSession) {
          const sessionData = JSON.parse(existingSession);
          if (sessionData.code === affiliateCode) {
            console.log('Visit already tracked for this session');
            return; // Already tracked this session
          }
        }

        // Generate session ID
        const sessionId = crypto.randomUUID();

        console.log('Tracking affiliate visit with session ID:', sessionId);

        // Use the secure RPC function to track the visit
        const { data: result, error } = await supabase.rpc('track_affiliate_visit', {
          p_affiliate_code: affiliateCode,
          p_session_id: sessionId,
          p_user_agent: navigator.userAgent,
          p_referrer: document.referrer || null,
          p_page_url: window.location.href
        });

        if (error) {
          console.error('Error calling track_affiliate_visit RPC:', error);
          return;
        }

        const trackingResult = result as unknown as AffiliateTrackingResult;

        if (!trackingResult?.success) {
          console.warn('Affiliate tracking failed:', trackingResult?.error);
          return;
        }

        console.log('Affiliate visit tracked successfully:', trackingResult);

        // Store session data
        sessionStorage.setItem(AFFILIATE_SESSION_KEY, JSON.stringify({
          sessionId,
          linkId: trackingResult.link_id,
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

  // Function to track conversions with VYBBI token rewards
  const trackConversion = async (conversionType: 'registration' | 'subscription' | 'booking', value?: number) => {
    try {
      const sessionData = sessionStorage.getItem(AFFILIATE_SESSION_KEY);
      if (!sessionData) return null;

      // Get current user ID if authenticated
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;
      
      // Use the enhanced RPC function that awards VYBBI tokens
      const { data, error } = await supabase.rpc('track_affiliate_conversion_with_tokens', {
        p_user_id: user.id,
        p_conversion_type: conversionType,
        p_conversion_value: value || 25.00
      });

      if (error) {
        console.error('Error tracking conversion:', error);
        return null;
      }

      // Clear affiliate session after successful conversion
      if (data && (data as any).success) {
        sessionStorage.removeItem(AFFILIATE_SESSION_KEY);
      }

      return data;
    } catch (error) {
      console.error('Error in conversion tracking:', error);
      return null;
    }
  };

  return { trackConversion };
};