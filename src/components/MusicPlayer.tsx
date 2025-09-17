import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { YouTubePlayer, extractYouTubeVideoId } from '@/components/YouTubePlayer';
import { 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  Volume2, 
  VolumeX,
  ExternalLink,
  Heart,
  Share2,
  Music,
  Video
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTrackMusicPlay } from '@/hooks/useMusicReleases';
import { MusicRelease } from '@/hooks/useMusicReleases';

interface MusicPlayerProps {
  track: MusicRelease & {
    media_assets?: Array<{
      id: string;
      file_url: string;
      file_name: string;
      preview_url?: string;
      duration_seconds?: number;
    }>;
  };
  playlist?: MusicRelease[];
  currentIndex?: number;
  onTrackChange?: (index: number) => void;
  className?: string;
  compact?: boolean;
}

export const MusicPlayer: React.FC<MusicPlayerProps> = ({
  track,
  playlist = [],
  currentIndex = 0,
  onTrackChange,
  className,
  compact = false
}) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [hasStartedPlaying, setHasStartedPlaying] = useState(false);
  const [playerMode, setPlayerMode] = useState<'audio' | 'video'>('audio');

  const trackPlayMutation = useTrackMusicPlay();

  const audioUrl = track.media_assets?.[0]?.preview_url || track.media_assets?.[0]?.file_url;
  const youtubeVideoId = track.youtube_url ? extractYouTubeVideoId(track.youtube_url) : null;
  const hasVideo = !!youtubeVideoId;
  const hasAudio = !!audioUrl;

  // Auto-select best available mode
  useEffect(() => {
    if (hasVideo && !hasAudio) {
      setPlayerMode('video');
    } else if (hasAudio && !hasVideo) {
      setPlayerMode('audio');
    }
  }, [hasVideo, hasAudio]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => setDuration(audio.duration);
    const handleEnded = () => {
      setIsPlaying(false);
      if (hasStartedPlaying) {
        trackPlayMutation.mutate({
          releaseId: track.id,
          durationPlayed: Math.floor(audio.currentTime),
          source: 'profile'
        });
      }
      // Auto-play next track
      if (playlist.length > 1 && currentIndex < playlist.length - 1) {
        onTrackChange?.(currentIndex + 1);
      }
    };

    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('loadedmetadata', updateDuration);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('loadedmetadata', updateDuration);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [track.id, hasStartedPlaying, playlist.length, currentIndex, onTrackChange]);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
      if (!hasStartedPlaying) {
        setHasStartedPlaying(true);
      }
    }
    setIsPlaying(!isPlaying);
  };

  const handleSeek = (value: number[]) => {
    const audio = audioRef.current;
    if (!audio) return;
    
    audio.currentTime = value[0];
    setCurrentTime(value[0]);
  };

  const handleVolumeChange = (value: number[]) => {
    const audio = audioRef.current;
    if (!audio) return;
    
    const newVolume = value[0];
    audio.volume = newVolume;
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
  };

  const toggleMute = () => {
    const audio = audioRef.current;
    if (!audio) return;
    
    if (isMuted) {
      audio.volume = volume;
      setIsMuted(false);
    } else {
      audio.volume = 0;
      setIsMuted(true);
    }
  };

  const previousTrack = () => {
    if (playlist.length > 1 && currentIndex > 0) {
      onTrackChange?.(currentIndex - 1);
    }
  };

  const nextTrack = () => {
    if (playlist.length > 1 && currentIndex < playlist.length - 1) {
      onTrackChange?.(currentIndex + 1);
    }
  };

  const formatTime = (seconds: number) => {
    if (!isFinite(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${track.title} - ${track.artist_name}`,
          text: `Écoutez "${track.title}" de ${track.artist_name} sur Vybbi`,
          url: window.location.href
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      // Fallback to clipboard
      navigator.clipboard.writeText(window.location.href);
    }
  };

  if (compact) {
    return (
      <div className={cn("flex items-center gap-2", className)}>
          <Button
            variant="outline"
            size="sm"
            onClick={togglePlay}
            disabled={!audioUrl && !youtubeVideoId}
          >
            {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          </Button>
          
          {hasVideo && (
            <Badge variant="outline" className="text-xs">
              <Video className="h-3 w-3 mr-1" />
              Vidéo
            </Badge>
          )}
        
        <div className="flex-1 text-sm">
          <div className="font-medium truncate">{track.title}</div>
          <div className="text-muted-foreground truncate">{track.artist_name}</div>
        </div>

        {audioUrl && (
          <audio
            ref={audioRef}
            src={audioUrl}
            preload="metadata"
          />
        )}
      </div>
    );
  }

  return (
    <Card className={cn("p-4", className)}>
      <div className="space-y-4">
        {/* Mode Toggle */}
        {hasVideo && hasAudio && (
          <Tabs value={playerMode} onValueChange={(value) => setPlayerMode(value as 'audio' | 'video')}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="audio">
                <Music className="h-4 w-4 mr-2" />
                Audio
              </TabsTrigger>
              <TabsTrigger value="video">
                <Video className="h-4 w-4 mr-2" />
                Vidéo
              </TabsTrigger>
            </TabsList>
          </Tabs>
        )}

        {/* Video Player */}
        {playerMode === 'video' && youtubeVideoId && (
          <YouTubePlayer
            videoId={youtubeVideoId}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            onEnded={() => {
              setIsPlaying(false);
              if (hasStartedPlaying) {
                trackPlayMutation.mutate({
                  releaseId: track.id,
                  durationPlayed: Math.floor(currentTime),
                  source: 'profile'
                });
              }
              // Auto-play next track
              if (playlist.length > 1 && currentIndex < playlist.length - 1) {
                onTrackChange?.(currentIndex + 1);
              }
            }}
            onTimeUpdate={(time) => setCurrentTime(time)}
            className="mb-4"
          />
        )}

        {/* Track Info */}
        <div className="flex items-center gap-4">
          <Avatar className="h-16 w-16 rounded-lg">
            <AvatarImage src={track.cover_image_url} alt={track.title} />
            <AvatarFallback className="rounded-lg">
              <Music className="h-6 w-6" />
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-lg truncate">{track.title}</h3>
            <p className="text-muted-foreground truncate">{track.artist_name}</p>
            {track.album_name && (
              <p className="text-sm text-muted-foreground truncate">{track.album_name}</p>
            )}
            
            <div className="flex items-center gap-2 mt-2">
              {track.genre && <Badge variant="secondary">{track.genre}</Badge>}
              {track.explicit_content && <Badge variant="destructive">Explicit</Badge>}
              <span className="text-xs text-muted-foreground">
                {track.plays_count} écoutes
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsLiked(!isLiked)}
            >
              <Heart className={cn("h-4 w-4", isLiked && "fill-current text-red-500")} />
            </Button>
            <Button variant="ghost" size="sm" onClick={handleShare}>
              <Share2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Progress Bar and Controls - Only show for audio mode */}
        {playerMode === 'audio' && (
          <>
            <div className="space-y-2">
              <Slider
                value={[currentTime]}
                max={duration || 100}
                step={1}
                onValueChange={handleSeek}
                className="w-full"
                disabled={!audioUrl}
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center justify-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={previousTrack}
                disabled={playlist.length <= 1 || currentIndex === 0}
              >
                <SkipBack className="h-4 w-4" />
              </Button>

              <Button
                onClick={togglePlay}
                disabled={!audioUrl && !youtubeVideoId}
                size="lg"
                className="rounded-full"
              >
                {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={nextTrack}
                disabled={playlist.length <= 1 || currentIndex === playlist.length - 1}
              >
                <SkipForward className="h-4 w-4" />
              </Button>
            </div>

            {/* Volume Control */}
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={toggleMute}>
                {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
              </Button>
              <Slider
                value={[isMuted ? 0 : volume]}
                max={1}
                step={0.1}
                onValueChange={handleVolumeChange}
                className="flex-1 max-w-24"
              />
            </div>
          </>
        )}

        {/* External Links */}
        {(track.spotify_url || track.apple_music_url || track.soundcloud_url || track.youtube_url) && (
          <div className="flex items-center justify-center gap-2 pt-2 border-t">
            {track.spotify_url && (
              <Button variant="outline" size="sm" asChild>
                <a href={track.spotify_url} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Spotify
                </a>
              </Button>
            )}
            {track.apple_music_url && (
              <Button variant="outline" size="sm" asChild>
                <a href={track.apple_music_url} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Apple Music
                </a>
              </Button>
            )}
            {track.soundcloud_url && (
              <Button variant="outline" size="sm" asChild>
                <a href={track.soundcloud_url} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  SoundCloud
                </a>
              </Button>
            )}
            {track.youtube_url && (
              <Button variant="outline" size="sm" asChild>
                <a href={track.youtube_url} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  YouTube
                </a>
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Audio Element - Only for audio mode */}
      {playerMode === 'audio' && audioUrl && (
        <audio
          ref={audioRef}
          src={audioUrl}
          preload="metadata"
        />
      )}
    </Card>
  );
};