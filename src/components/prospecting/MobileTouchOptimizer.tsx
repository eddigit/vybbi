import React, { useEffect } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import { addHapticFeedback } from '@/utils/mobileHelpers';

interface MobileTouchOptimizerProps {
  children: React.ReactNode;
}

export default function MobileTouchOptimizer({ children }: MobileTouchOptimizerProps) {
  const isMobile = useIsMobile();

  useEffect(() => {
    if (!isMobile) return;

    // Optimize touch targets for mobile
    const style = document.createElement('style');
    style.textContent = `
      /* Mobile touch optimizations */
      .mobile-card {
        min-height: 44px;
        touch-action: manipulation;
      }
      
      .mobile-button {
        min-height: 44px;
        min-width: 44px;
        padding: 12px;
      }
      
      .hover-lift {
        transition: transform 0.2s ease-out;
      }
      
      .hover-lift:active {
        transform: translateY(2px);
      }
      
      /* Improve tap highlight */
      button, .clickable {
        -webkit-tap-highlight-color: hsl(var(--primary) / 0.1);
        -webkit-touch-callout: none;
        -webkit-user-select: none;
        user-select: none;
      }
      
      /* Smooth scrolling on mobile */
      .scroll-area {
        -webkit-overflow-scrolling: touch;
        overscroll-behavior: contain;
      }
      
      /* Better focus states for accessibility */
      *:focus-visible {
        outline: 2px solid hsl(var(--primary));
        outline-offset: 2px;
      }
    `;
    
    document.head.appendChild(style);
    
    // Add global touch event handlers for better responsiveness
    let lastTap = 0;
    const handleDoubleTap = (e: TouchEvent) => {
      const currentTime = new Date().getTime();
      const tapLength = currentTime - lastTap;
      
      if (tapLength < 500 && tapLength > 0) {
        // Double tap detected
        addHapticFeedback('medium');
      }
      
      lastTap = currentTime;
    };
    
    document.addEventListener('touchend', handleDoubleTap);
    
    return () => {
      document.head.removeChild(style);
      document.removeEventListener('touchend', handleDoubleTap);
    };
  }, [isMobile]);

  return <>{children}</>;
}