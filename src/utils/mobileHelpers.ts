/**
 * Mobile-first utility functions for better UX
 */

// Check if device supports touch
export const isTouchDevice = () => {
  return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
};

// Get safe area insets for different devices
export const getSafeAreaInsets = () => {
  const style = getComputedStyle(document.documentElement);
  return {
    top: style.getPropertyValue('--safe-area-inset-top') || '0px',
    right: style.getPropertyValue('--safe-area-inset-right') || '0px',
    bottom: style.getPropertyValue('--safe-area-inset-bottom') || '0px',
    left: style.getPropertyValue('--safe-area-inset-left') || '0px',
  };
};

// Check if device is in landscape mode
export const isLandscape = () => {
  return window.innerHeight < window.innerWidth;
};

// Get device pixel ratio for high-DPI displays
export const getPixelRatio = () => {
  return window.devicePixelRatio || 1;
};

// Optimize image URLs for mobile (smaller sizes)
export const getMobileOptimizedImageUrl = (url: string, width = 400) => {
  if (!url) return url;
  
  // For Supabase images, add transformation parameters
  if (url.includes('supabase') || url.includes('lovable-uploads')) {
    const separator = url.includes('?') ? '&' : '?';
    return `${url}${separator}width=${width}&quality=80&format=webp`;
  }
  
  return url;
};

// Debounce function for better performance on mobile
export const debounce = <T extends (...args: any[]) => void>(
  func: T,
  wait: number,
  immediate?: boolean
): T => {
  let timeout: NodeJS.Timeout | null;
  
  return ((...args: any[]) => {
    const later = () => {
      timeout = null;
      if (!immediate) func(...args);
    };
    
    const callNow = immediate && !timeout;
    
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    
    if (callNow) func(...args);
  }) as T;
};

// Throttle function for scroll events
export const throttle = <T extends (...args: any[]) => void>(
  func: T,
  limit: number
): T => {
  let inThrottle: boolean;
  
  return ((...args: any[]) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  }) as T;
};

// Add haptic feedback on supported devices
export const addHapticFeedback = (type: 'light' | 'medium' | 'heavy' = 'light') => {
  if ('vibrate' in navigator) {
    const patterns = {
      light: [10],
      medium: [20],
      heavy: [30]
    };
    navigator.vibrate(patterns[type]);
  }
};

// Check if running as PWA
export const isPWA = () => {
  return window.matchMedia('(display-mode: standalone)').matches ||
         (window.navigator as any).standalone === true;
};

// Mobile-optimized scroll to top
export const smoothScrollToTop = () => {
  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  });
};