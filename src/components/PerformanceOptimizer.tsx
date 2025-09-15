import React, { useEffect, Suspense } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { preloadImages, shouldUseDataSaving } from '@/utils/imageOptimization';

interface PerformanceOptimizerProps {
  children: React.ReactNode;
}

/**
 * Composant pour optimiser les performances globales
 */
export function PerformanceOptimizer({ children }: PerformanceOptimizerProps) {
  const queryClient = useQueryClient();

  useEffect(() => {
    // Optimisations au montage du composant
    const optimizePerformance = async () => {
      // 1. Précharger les images critiques uniquement si bonne connexion
      if (!shouldUseDataSaving()) {
        const criticalImages = [
          '/placeholder.svg',
          // Ajouter d'autres images critiques ici
        ];
        
        try {
          await preloadImages(criticalImages, 2);
        } catch (error) {
          console.warn('Failed to preload critical images:', error);
        }
      }

      // 2. Configurer le garbage collection des requêtes
      queryClient.setQueryDefaults(['profile-data'], {
        gcTime: 10 * 60 * 1000, // 10 minutes
        staleTime: 5 * 60 * 1000, // 5 minutes
      });

      queryClient.setQueryDefaults(['venue-events'], {
        gcTime: 5 * 60 * 1000, // 5 minutes
        staleTime: 2 * 60 * 1000, // 2 minutes
      });

      // 3. Nettoyer le cache des requêtes obsolètes
      queryClient.invalidateQueries({
        predicate: (query) => {
          const lastFetch = query.state.dataUpdatedAt;
          const oneHourAgo = Date.now() - 60 * 60 * 1000;
          return lastFetch < oneHourAgo;
        },
      });
    };

    // Exécuter les optimisations après un léger délai
    const timeout = setTimeout(optimizePerformance, 100);
    
    return () => clearTimeout(timeout);
  }, [queryClient]);

  // Optimisations de rendu
  useEffect(() => {
    // Optimiser le navigateur pour les performances
    if (typeof window !== 'undefined') {
      // Utiliser requestIdleCallback si disponible
      const scheduleWork = (callback: () => void) => {
        if ('requestIdleCallback' in window) {
          window.requestIdleCallback(callback);
        } else {
          setTimeout(callback, 1);
        }
      };

      scheduleWork(() => {
        // Préchargement des polices critiques
        const criticalFonts = [
          // Ajouter les polices critiques ici si nécessaire
        ];

        criticalFonts.forEach(font => {
          const link = document.createElement('link');
          link.rel = 'preload';
          link.href = font;
          link.as = 'font';
          link.type = 'font/woff2';
          link.crossOrigin = 'anonymous';
          document.head.appendChild(link);
        });
      });
    }
  }, []);

  return (
    <Suspense fallback={<div className="min-h-screen bg-background" />}>
      {children}
    </Suspense>
  );
}

/**
 * Hook pour optimiser le rendu des listes longues
 */
export function useVirtualization<T>(
  items: T[],
  itemHeight: number,
  containerHeight: number
) {
  const [startIndex, setStartIndex] = React.useState(0);
  const [endIndex, setEndIndex] = React.useState(
    Math.min(Math.ceil(containerHeight / itemHeight) + 2, items.length)
  );

  const handleScroll = React.useCallback((scrollTop: number) => {
    const newStartIndex = Math.floor(scrollTop / itemHeight);
    const visibleCount = Math.ceil(containerHeight / itemHeight);
    const newEndIndex = Math.min(newStartIndex + visibleCount + 2, items.length);

    setStartIndex(newStartIndex);
    setEndIndex(newEndIndex);
  }, [itemHeight, containerHeight, items.length]);

  const visibleItems = React.useMemo(() => {
    return items.slice(startIndex, endIndex).map((item, index) => ({
      item,
      index: startIndex + index,
      style: {
        position: 'absolute' as const,
        top: (startIndex + index) * itemHeight,
        height: itemHeight,
        left: 0,
        right: 0,
      },
    }));
  }, [items, startIndex, endIndex, itemHeight]);

  return {
    visibleItems,
    totalHeight: items.length * itemHeight,
    handleScroll,
  };
}

/**
 * Composant pour détecter et optimiser selon la connexion
 */
export function ConnectionOptimizer({ children }: PerformanceOptimizerProps) {
  const [isSlowConnection, setIsSlowConnection] = React.useState(false);

  useEffect(() => {
    setIsSlowConnection(shouldUseDataSaving());

    // Écouter les changements de connexion
    const handleConnectionChange = () => {
      setIsSlowConnection(shouldUseDataSaving());
    };

    // @ts-ignore - Connection API
    const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    
    if (connection) {
      connection.addEventListener('change', handleConnectionChange);
      return () => {
        connection.removeEventListener('change', handleConnectionChange);
      };
    }
  }, []);

  return (
    <div data-connection-slow={isSlowConnection}>
      {children}
    </div>
  );
}