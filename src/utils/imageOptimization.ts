/**
 * Utilitaires d'optimisation d'images
 */

interface ImageOptimizationConfig {
  quality?: number;
  width?: number;
  height?: number;
  format?: 'webp' | 'jpg' | 'png';
}

/**
 * Optimise une URL d'image avec les paramètres donnés
 */
export function optimizeImageUrl(
  url: string, 
  config: ImageOptimizationConfig = {}
): string {
  if (!url) return url;
  
  // Si c'est une image Supabase, on peut ajouter des paramètres de transformation
  if (url.includes('supabase')) {
    const params = new URLSearchParams();
    
    if (config.width) params.append('width', config.width.toString());
    if (config.height) params.append('height', config.height.toString());
    if (config.quality) params.append('quality', config.quality.toString());
    if (config.format) params.append('format', config.format);
    
    const separator = url.includes('?') ? '&' : '?';
    return params.toString() ? `${url}${separator}${params.toString()}` : url;
  }
  
  return url;
}

/**
 * Génère des URLs d'images optimisées pour différentes tailles
 */
export function generateResponsiveImageUrls(url: string) {
  if (!url) return { original: url };
  
  return {
    original: url,
    thumbnail: optimizeImageUrl(url, { width: 150, height: 150, quality: 80, format: 'webp' }),
    small: optimizeImageUrl(url, { width: 300, quality: 85, format: 'webp' }),
    medium: optimizeImageUrl(url, { width: 600, quality: 85, format: 'webp' }),
    large: optimizeImageUrl(url, { width: 1200, quality: 90, format: 'webp' }),
  };
}

/**
 * Précharge une image
 */
export function preloadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

/**
 * Précharge plusieurs images en parallèle avec limite
 */
export async function preloadImages(
  urls: string[], 
  concurrency = 3
): Promise<void> {
  const chunks = [];
  for (let i = 0; i < urls.length; i += concurrency) {
    chunks.push(urls.slice(i, i + concurrency));
  }
  
  for (const chunk of chunks) {
    try {
      await Promise.all(chunk.map(url => preloadImage(url)));
    } catch (error) {
      console.warn('Failed to preload some images:', error);
    }
  }
}

/**
 * Détecte si l'utilisateur préfère des données réduites
 */
export function shouldUseDataSaving(): boolean {
  if (typeof navigator === 'undefined') return false;
  
  // @ts-ignore - Connection API n'est pas encore dans tous les types
  const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
  
  if (connection) {
    // Sur connexion lente, utiliser la sauvegarde de données
    return connection.effectiveType === '2g' || connection.effectiveType === 'slow-2g';
  }
  
  return false;
}

/**
 * Cache d'images avec LRU
 */
class ImageCache {
  private cache = new Map<string, HTMLImageElement>();
  private maxSize: number;
  
  constructor(maxSize = 50) {
    this.maxSize = maxSize;
  }
  
  get(url: string): HTMLImageElement | undefined {
    const img = this.cache.get(url);
    if (img) {
      // Move to end (most recently used)
      this.cache.delete(url);
      this.cache.set(url, img);
    }
    return img;
  }
  
  set(url: string, img: HTMLImageElement): void {
    if (this.cache.has(url)) {
      this.cache.delete(url);
    } else if (this.cache.size >= this.maxSize) {
      // Remove least recently used
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
    this.cache.set(url, img);
  }
  
  clear(): void {
    this.cache.clear();
  }
}

export const imageCache = new ImageCache();

/**
 * Hook pour gérer le chargement optimisé d'images
 */
export function useOptimizedImage(url: string, config?: ImageOptimizationConfig) {
  const optimizedUrl = optimizeImageUrl(url, {
    quality: shouldUseDataSaving() ? 70 : 85,
    format: 'webp',
    ...config,
  });
  
  return {
    src: optimizedUrl,
    onLoad: (img: HTMLImageElement) => {
      imageCache.set(optimizedUrl, img);
    },
  };
}