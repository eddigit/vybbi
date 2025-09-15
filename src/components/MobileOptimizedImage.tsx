import { useState } from 'react';
import { cn } from '@/lib/utils';
import { getMobileOptimizedImageUrl } from '@/utils/mobileHelpers';

interface MobileOptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  mobileWidth?: number;
  loading?: 'lazy' | 'eager';
  quality?: number;
  fallbackSrc?: string;
}

export function MobileOptimizedImage({
  src,
  alt,
  className,
  width,
  height,
  mobileWidth = 400,
  loading = 'lazy',
  quality = 80,
  fallbackSrc = '/placeholder.svg'
}: MobileOptimizedImageProps) {
  const [error, setError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  const optimizedSrc = getMobileOptimizedImageUrl(src, mobileWidth);
  const displaySrc = error ? fallbackSrc : optimizedSrc;

  return (
    <div className={cn("relative overflow-hidden", className)}>
      {!isLoaded && (
        <div className="absolute inset-0 bg-muted animate-pulse" />
      )}
      
      <img
        src={displaySrc}
        alt={alt}
        width={width}
        height={height}
        loading={loading}
        onLoad={() => setIsLoaded(true)}
        onError={() => setError(true)}
        className={cn(
          "transition-opacity duration-300",
          isLoaded ? "opacity-100" : "opacity-0",
          "w-full h-full object-cover"
        )}
        style={{
          aspectRatio: width && height ? `${width}/${height}` : undefined
        }}
      />
    </div>
  );
}