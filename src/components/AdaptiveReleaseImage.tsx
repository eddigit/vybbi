import React from 'react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Music } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AdaptiveReleaseImageProps {
  src?: string;
  alt: string;
  compactMode?: boolean;
  className?: string;
}

const isYouTubeImage = (url?: string): boolean => {
  return url ? url.includes('img.youtube.com') || url.includes('ytimg.com') : false;
};

export function AdaptiveReleaseImage({ 
  src, 
  alt, 
  compactMode = false, 
  className 
}: AdaptiveReleaseImageProps) {
  const isYouTube = isYouTubeImage(src);
  
  // For YouTube images, use rectangular container
  if (isYouTube) {
    return (
      <div className={cn(
        "relative overflow-hidden rounded-lg bg-muted flex items-center justify-center",
        compactMode ? "w-16 h-9" : "w-20 h-12", // 16:9 ratio
        className
      )}>
        <img
          src={src}
          alt={alt}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.currentTarget.style.display = 'none';
            const fallback = e.currentTarget.nextElementSibling as HTMLElement;
            if (fallback) fallback.style.display = 'flex';
          }}
        />
        <div className="hidden absolute inset-0 bg-muted items-center justify-center">
          <Music className={cn("h-6 w-6 text-muted-foreground", compactMode && "h-4 w-4")} />
        </div>
      </div>
    );
  }
  
  // For other images (Spotify, manual uploads), use square format
  return (
    <Avatar className={cn("rounded-lg", compactMode ? "h-10 w-10" : "h-16 w-16", className)}>
      <AvatarImage src={src} alt={alt} />
      <AvatarFallback className="rounded-lg">
        <Music className={cn("h-6 w-6", compactMode && "h-4 w-4")} />
      </AvatarFallback>
    </Avatar>
  );
}