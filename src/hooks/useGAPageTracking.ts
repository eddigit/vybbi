import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Google Analytics 4 Page Tracking Hook
 * Sends page_view events on route changes in SPA
 */
export const useGAPageTracking = () => {
  const location = useLocation();

  useEffect(() => {
    // Check if gtag is available
    if (typeof window.gtag !== 'function') {
      console.warn('[GA4] gtag function not available');
      return;
    }

    // Get page title
    const pageTitle = document.title;
    
    // Construct full path with search params
    const pagePath = location.pathname + location.search;

    // Send page_view event to GA4
    window.gtag('event', 'page_view', {
      page_path: pagePath,
      page_title: pageTitle,
      page_location: window.location.href
    });

    console.log('[GA4] Page view tracked:', {
      path: pagePath,
      title: pageTitle
    });
  }, [location.pathname, location.search]);
};

// Extend Window interface for TypeScript
declare global {
  interface Window {
    gtag: (...args: any[]) => void;
    acceptAll: () => void;
    acceptAnalyticsOnly: () => void;
    refuseAll: () => void;
  }
}
