import React, { useState, useEffect } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import { addHapticFeedback } from '@/utils/mobileHelpers';
import { RefreshCw } from 'lucide-react';

interface PullToRefreshProps {
  onRefresh: () => Promise<void>;
  children: React.ReactNode;
  disabled?: boolean;
}

export default function PullToRefresh({ 
  onRefresh, 
  children, 
  disabled = false 
}: PullToRefreshProps) {
  const isMobile = useIsMobile();
  const [isPulling, setIsPulling] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [startY, setStartY] = useState(0);

  const PULL_THRESHOLD = 80;
  const MAX_PULL = 120;

  useEffect(() => {
    if (!isMobile || disabled) return;

    let startPos = 0;
    let currentPos = 0;
    let isAtTop = false;

    const handleTouchStart = (e: TouchEvent) => {
      // Only trigger if we're at the top of the page
      isAtTop = window.scrollY === 0;
      if (!isAtTop) return;

      startPos = e.touches[0].clientY;
      setStartY(startPos);
      setIsPulling(false);
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isAtTop || isRefreshing) return;

      currentPos = e.touches[0].clientY;
      const diff = currentPos - startPos;

      if (diff > 10) {
        // Prevent default scrolling when pulling down
        e.preventDefault();
        
        const pullDistance = Math.min(diff * 0.6, MAX_PULL);
        setPullDistance(pullDistance);
        setIsPulling(true);

        // Haptic feedback at threshold
        if (pullDistance >= PULL_THRESHOLD && !isRefreshing) {
          addHapticFeedback('medium');
        }
      }
    };

    const handleTouchEnd = async () => {
      if (!isPulling || isRefreshing) return;

      if (pullDistance >= PULL_THRESHOLD) {
        setIsRefreshing(true);
        addHapticFeedback('heavy');
        
        try {
          await onRefresh();
        } finally {
          setIsRefreshing(false);
        }
      }

      setIsPulling(false);
      setPullDistance(0);
    };

    // Add event listeners to document to catch all touch events
    document.addEventListener('touchstart', handleTouchStart, { passive: false });
    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    document.addEventListener('touchend', handleTouchEnd);

    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isMobile, disabled, isPulling, pullDistance, isRefreshing, onRefresh]);

  if (!isMobile) {
    return <div>{children}</div>;
  }

  return (
    <div className="relative">
      {/* Pull indicator */}
      {(isPulling || isRefreshing) && (
        <div 
          className="fixed top-0 left-0 right-0 z-50 flex justify-center transition-transform duration-200 ease-out"
          style={{ 
            transform: `translateY(${Math.max(0, pullDistance - 40)}px)`,
            opacity: pullDistance / PULL_THRESHOLD
          }}
        >
          <div className="bg-background/90 backdrop-blur-sm border rounded-full px-4 py-2 mt-4 shadow-lg">
            <div className="flex items-center space-x-2 text-sm">
              <RefreshCw 
                className={`h-4 w-4 ${
                  isRefreshing 
                    ? 'animate-spin text-primary' 
                    : pullDistance >= PULL_THRESHOLD 
                      ? 'text-green-600' 
                      : 'text-muted-foreground'
                }`} 
              />
              <span className={
                isRefreshing 
                  ? 'text-primary' 
                  : pullDistance >= PULL_THRESHOLD 
                    ? 'text-green-600 font-medium' 
                    : 'text-muted-foreground'
              }>
                {isRefreshing 
                  ? 'Actualisation...' 
                  : pullDistance >= PULL_THRESHOLD 
                    ? 'Relâchez pour actualiser' 
                    : 'Tirez pour actualiser'
                }
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Content */}
      <div 
        className="transition-transform duration-200 ease-out"
        style={{ 
          transform: isPulling ? `translateY(${pullDistance * 0.3}px)` : undefined 
        }}
      >
        {children}
      </div>

      {/* Overlay during refresh */}
      {isRefreshing && (
        <div className="fixed inset-0 bg-black/10 z-40 pointer-events-none" />
      )}
    </div>
  );
}