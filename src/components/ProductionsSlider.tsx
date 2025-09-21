import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { AdaptiveReleaseImage } from '@/components/AdaptiveReleaseImage';
import { BlockchainCertificationBadge } from '@/components/BlockchainCertificationBadge';
import { 
  Music, 
  Play, 
  Calendar, 
  Clock, 
  Eye,
  Heart,
  ExternalLink,
  Award,
  Video,
  Radio
} from 'lucide-react';
import { useMusicReleases } from '@/hooks/useMusicReleases';
import { useRadioSubmissions } from '@/hooks/useRadioSubmissions';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { cn } from '@/lib/utils';

interface ProductionsSliderProps {
  profileId: string;
  onPlayTrack?: (track: any, playlist: any[]) => void;
  className?: string;
}

export const ProductionsSlider: React.FC<ProductionsSliderProps> = ({
  profileId,
  onPlayTrack,
  className
}) => {
  const { data: releases = [], isLoading } = useMusicReleases(profileId, 'published');
  const { hasAnySubmission } = useRadioSubmissions(profileId);

  const publishedReleases = releases?.filter(r => r.status === 'published') || [];

  const formatDuration = (seconds?: number) => {
    if (!seconds) return '--:--';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (isLoading) {
    return (
      <Card className={cn("mobile-card", className)}>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
            <Music className="h-5 w-5" />
            Sets & Productions
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (publishedReleases.length === 0) {
    return (
      <Card className={cn("mobile-card", className)}>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
            <Music className="h-5 w-5" />
            Sets & Productions ({publishedReleases.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <p className="text-center text-muted-foreground py-6 sm:py-8 text-sm sm:text-base">
            Aucune production disponible pour le moment.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("mobile-card", className)}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
          <Music className="h-5 w-5" />
          Sets & Productions ({publishedReleases.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <Carousel
          opts={{
            align: "start",
          }}
          className="w-full"
        >
          <CarouselContent>
            {publishedReleases.map((release) => {
              const submissionStatus = hasAnySubmission(release.media_assets || []);
              
              return (
                <CarouselItem key={release.id} className="basis-full sm:basis-1/2 lg:basis-1/3">
                  <Card className="h-full cursor-pointer transition-all hover:shadow-md group mobile-card">
                    <CardContent className="p-3 sm:p-4">
                      <div className="space-y-3">
                        {/* Cover Image with Play Button */}
                        <div className="relative group/image">
                          <AdaptiveReleaseImage 
                            src={release.cover_image_url} 
                            alt={release.title} 
                            compactMode={false}
                          />
                          
                          {/* Video indicator */}
                          {release.youtube_url && (
                            <div className="absolute top-2 right-2 bg-red-600 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                              <Video className="h-3 w-3" />
                              Vidéo
                            </div>
                          )}
                          
                          {/* Play Button Overlay */}
                          <Button
                            size="sm"
                            className="absolute inset-0 m-auto h-10 w-10 sm:h-12 sm:w-12 rounded-full opacity-0 group-hover/image:opacity-100 transition-opacity"
                            onClick={(e) => {
                              e.stopPropagation();
                              onPlayTrack?.(release, publishedReleases);
                            }}
                          >
                            <Play className="h-4 w-4 sm:h-5 sm:w-5" />
                          </Button>
                        </div>

                        {/* Track Info */}
                        <div className="space-y-2">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-sm sm:text-base line-clamp-2">{release.title}</h3>
                              <p className="text-xs sm:text-sm text-muted-foreground line-clamp-1">{release.artist_name}</p>
                            </div>
                            <BlockchainCertificationBadge
                              musicReleaseId={release.id}
                              title={release.title}
                              artist={release.artist_name}
                              className="ml-2 shrink-0"
                            />
                          </div>
                          
                          {release.album_name && (
                            <p className="text-xs text-muted-foreground line-clamp-1">{release.album_name}</p>
                          )}
                        </div>

                        {/* Stats */}
                        <div className="flex items-center gap-2 sm:gap-3 text-xs text-muted-foreground">
                          {release.release_date && (
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              <span className="hidden sm:inline">
                                {formatDistanceToNow(new Date(release.release_date), { 
                                  addSuffix: true, 
                                  locale: fr 
                                })}
                              </span>
                              <span className="sm:hidden">
                                {new Date(release.release_date).getFullYear()}
                              </span>
                            </div>
                          )}
                          
                          {release.duration_seconds && (
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {formatDuration(release.duration_seconds)}
                            </div>
                          )}
                        </div>

                        {/* Badges */}
                        <div className="flex items-center gap-1 flex-wrap">
                          {release.genre && (
                            <Badge variant="secondary" className="text-xs">
                              {release.genre}
                            </Badge>
                          )}
                          
                          {release.is_original_composition && (
                            <Badge variant="outline" className="text-xs">
                              <Award className="h-2 w-2 mr-1" />
                              <span className="hidden sm:inline">Original</span>
                              <span className="sm:hidden">Orig</span>
                            </Badge>
                          )}
                          
                          {submissionStatus && (
                            <Badge 
                              variant={submissionStatus.status === 'approved' ? 'default' : 'secondary'}
                              className={cn(
                                "text-xs",
                                submissionStatus.status === 'approved' 
                                  ? 'bg-green-100 text-green-800 border-green-300'
                                  : 'bg-orange-100 text-orange-800 border-orange-300'
                              )}
                            >
                              <Radio className="h-2 w-2 mr-1" />
                              {submissionStatus.status === 'approved' ? 'Radio' : 'Attente'}
                            </Badge>
                          )}
                        </div>

                        {/* External Links */}
                        {(release.spotify_url || release.apple_music_url || release.soundcloud_url) && (
                          <div className="flex gap-1 pt-2">
                            {release.spotify_url && (
                              <Button variant="outline" size="sm" asChild className="h-6 sm:h-7 px-2 text-xs">
                                <a href={release.spotify_url} target="_blank" rel="noopener noreferrer">
                                  <ExternalLink className="h-3 w-3 mr-1" />
                                  <span className="hidden sm:inline">Spotify</span>
                                  <span className="sm:hidden">S</span>
                                </a>
                              </Button>
                            )}
                            {release.soundcloud_url && (
                              <Button variant="outline" size="sm" asChild className="h-6 sm:h-7 px-2 text-xs">
                                <a href={release.soundcloud_url} target="_blank" rel="noopener noreferrer">
                                  <ExternalLink className="h-3 w-3 mr-1" />
                                  <span className="hidden sm:inline">SoundCloud</span>
                                  <span className="sm:hidden">SC</span>
                                </a>
                              </Button>
                            )}
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </CarouselItem>
              );
            })}
          </CarouselContent>
          <CarouselPrevious />
          <CarouselNext />
        </Carousel>
      </CardContent>
    </Card>
  );
};