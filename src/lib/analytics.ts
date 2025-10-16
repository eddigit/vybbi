// GA4 initialization gated to production
export function initAnalytics() {
  if (!import.meta.env.PROD) {
    // In development, do not load GA to avoid noisy network errors
    return;
  }

  const MEASUREMENT_ID = (import.meta as any).env?.VITE_GA_ID || 'G-K1LQ1MVX3R';
  if (!MEASUREMENT_ID) return;

  // Ensure dataLayer exists
  (window as any).dataLayer = (window as any).dataLayer || [];
  (window as any).gtag = function gtag() {
    (window as any).dataLayer.push(arguments);
  };

  // Default consent (EEA) must be set before gtag.js
  (window as any).gtag('consent', 'default', {
    ad_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied',
    analytics_storage: 'denied',
    functionality_storage: 'denied',
    security_storage: 'granted',
    region: [
      'AT','BE','BG','HR','CY','CZ','DK','EE','FI','FR','DE','GR','HU','IS','IE','IT','LV','LI','LT','LU','MT','NL','NO','PL','PT','RO','SK','SI','ES','SE','GB','CH'
    ]
  });

  // Global consent update helpers
  (window as any).acceptAll = function () {
    (window as any).gtag('consent', 'update', {
      ad_storage: 'granted',
      ad_user_data: 'granted',
      ad_personalization: 'granted',
      analytics_storage: 'granted',
      functionality_storage: 'granted'
    });
  };

  (window as any).acceptAnalyticsOnly = function () {
    (window as any).gtag('consent', 'update', {
      analytics_storage: 'granted',
      functionality_storage: 'granted'
    });
  };

  (window as any).refuseAll = function () {
    (window as any).gtag('consent', 'update', {
      ad_storage: 'denied',
      ad_user_data: 'denied',
      ad_personalization: 'denied',
      analytics_storage: 'denied',
      functionality_storage: 'denied'
    });
  };

  // Inject gtag.js
  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${MEASUREMENT_ID}`;
  script.onload = () => {
    (window as any).gtag('js', new Date());
    (window as any).gtag('config', MEASUREMENT_ID, { send_page_view: false });
  };
  document.head.appendChild(script);
}

declare global {
  interface Window {
    dataLayer: any[];
    gtag: (...args: any[]) => void;
    acceptAll: () => void;
    acceptAnalyticsOnly: () => void;
    refuseAll: () => void;
  }
}