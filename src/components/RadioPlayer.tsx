import { Play, Pause, Volume2, SkipForward, SkipBack, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useRadioPlayer } from "@/hooks/useRadioPlayer";
import { Link, useLocation } from "react-router-dom";
import { YouTubeRadioPlayer, YouTubeRadioPlayerRef } from "@/components/YouTubeRadioPlayer";
import { extractYouTubeVideoId } from "@/components/YouTubePlayer";
import { useState, useEffect, useRef } from "react";

export function RadioPlayer() {
  const location = useLocation();
  const {
    currentTrack,
    isPlaying,
    progress,
    duration,
    volume,
    play,
    pause,
    nextTrack,
    previousTrack,
    seek,
    setVolume,
  } = useRadioPlayer();

  // YouTube player state
  const [youtubeProgress, setYoutubeProgress] = useState(0);
  const [youtubeDuration, setYoutubeDuration] = useState(0);
  const [isYoutubePlaying, setIsYoutubePlaying] = useState(false);
  const youtubePlayerRef = useRef<any>(null);

  if (!currentTrack) return null;

  // Detect track type
  const isYouTubeTrack = currentTrack.type === 'youtube';
  const youtubeVideoId = isYouTubeTrack ? extractYouTubeVideoId(currentTrack.url) : null;

  // Use YouTube state if YouTube track, otherwise use audio state
  const trackProgress = isYouTubeTrack ? youtubeProgress : progress;
  const trackDuration = isYouTubeTrack ? youtubeDuration : duration;
  const trackIsPlaying = isYouTubeTrack ? isYoutubePlaying : isPlaying;

  const handlePlay = () => {
    if (isYouTubeTrack && youtubePlayerRef.current) {
      // Trigger YouTube play via a custom event
      const event = new CustomEvent('youtube-play');
      window.dispatchEvent(event);
    } else {
      play();
    }
  };

  const handlePause = () => {
    if (isYouTubeTrack && youtubePlayerRef.current) {
      // Trigger YouTube pause via a custom event
      const event = new CustomEvent('youtube-pause');
      window.dispatchEvent(event);
    } else {
      pause();
    }
  };

  const handleSeek = (time: number) => {
    if (isYouTubeTrack) {
      // Trigger YouTube seek via a custom event
      const event = new CustomEvent('youtube-seek', { detail: { time } });
      window.dispatchEvent(event);
    } else {
      seek(time);
    }
  };

  const formatTime = (seconds: number) => {
    const total = Math.max(0, Math.floor(seconds || 0));
    const mins = Math.floor(total / 60);
    const secs = total % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const progressVal = Math.min(Math.floor(trackProgress || 0), Math.floor(trackDuration || 0));
  const durationVal = Math.floor(trackDuration || 0);

  return (
    <div 
      className="fixed left-0 right-0 z-[60] animate-slide-up bottom-0 md:bottom-0"
      aria-label="Lecteur Radio Vybbi"
    >
      {/* Hidden YouTube Player for audio-only playback */}
      {isYouTubeTrack && youtubeVideoId && (
        <div className="hidden">
          <YouTubePlayer
            videoId={youtubeVideoId}
            onReady={() => console.log('YouTube player ready')}
            onPlay={() => setIsYoutubePlaying(true)}
            onPause={() => setIsYoutubePlaying(false)}
            onEnded={() => {
              setIsYoutubePlaying(false);
              nextTrack();
            }}
            onTimeUpdate={(time) => setYoutubeProgress(time)}
            autoplay={trackIsPlaying}
          />
        </div>
      )}
      
      <div className="bg-gradient-to-r from-card via-card/95 to-card backdrop-blur-lg border-t border-border/50 shadow-2xl pb-safe-bottom">
        <div className="container mx-auto px-2 py-1.5 sm:px-4 sm:py-3">
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Pochette / Avatar artiste */}
            <div className="flex-shrink-0">
              <Avatar className="w-8 h-8 sm:w-12 sm:h-12 ring-1 sm:ring-2 ring-primary/20">
                <AvatarImage
                  src={currentTrack.artist.avatar_url || ''}
                  alt={`Avatar ${currentTrack.artist.display_name}`}
                />
                <AvatarFallback className="bg-gradient-primary text-primary-foreground font-semibold">
                  {currentTrack.artist.display_name.charAt(0)}
                </AvatarFallback>
              </Avatar>
            </div>

            {/* Infos piste + progression */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1 sm:gap-2">
                    <p className="text-xs sm:text-sm font-medium text-foreground truncate">
                      {currentTrack.title}
                    </p>
                    <Link
                      to={`/artistes/${currentTrack.artist.id}`}
                      className="hidden sm:flex flex-shrink-0 opacity-60 hover:opacity-100 transition-opacity"
                      aria-label={`Voir le profil de ${currentTrack.artist.display_name}`}
                    >
                      <ExternalLink className="w-3 h-3" />
                    </Link>
                  </div>
                  <p className="text-xs text-muted-foreground truncate">
                    {currentTrack.artist.display_name}
                  </p>
                </div>
                <div className="hidden sm:block text-xs text-muted-foreground ml-2">
                  {formatTime(progressVal)} / {formatTime(durationVal)}
                </div>
              </div>

              {/* Barre de progression */}
              <div className="w-full">
                <Slider
                  value={[progressVal]}
                  max={Math.max(1, durationVal)}
                  step={1}
                  onValueChange={([v]) => handleSeek(v)}
                  className="w-full h-1 cursor-pointer"
                />
              </div>
            </div>

            {/* Contrôles */}
            <div className="flex items-center gap-1 sm:gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={previousTrack}
                className="hidden sm:inline-flex w-8 h-8 p-0 hover:bg-primary/10"
                aria-label="Piste précédente"
              >
                <SkipBack className="w-4 h-4" />
              </Button>

              <Button
                onClick={trackIsPlaying ? handlePause : handlePlay}
                size="sm"
                className="w-8 h-8 sm:w-10 sm:h-10 p-0 bg-gradient-primary hover:opacity-90 transition-all duration-200 hover-glow"
                aria-label={trackIsPlaying ? 'Pause' : 'Lecture'}
              >
                {trackIsPlaying ? (
                  <Pause className="w-5 h-5" />
                ) : (
                  <Play className="w-5 h-5 ml-0.5" />
                )}
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={nextTrack}
                className="hidden sm:inline-flex w-8 h-8 p-0 hover:bg-primary/10"
                aria-label="Piste suivante"
              >
                <SkipForward className="w-4 h-4" />
              </Button>

              {/* Volume (masqué sur mobile) */}
              <div className="hidden sm:flex items-center gap-2 ml-2">
                <Volume2 className="w-4 h-4 text-muted-foreground" />
                <div className="w-16">
                  <Slider
                    value={[volume]}
                    max={100}
                    step={1}
                    onValueChange={([v]) => setVolume(v)}
                    className="w-full h-1"
                  />
                </div>
              </div>

              {/* Marque Vybbi */}
              <div className="hidden lg:flex items-center ml-4 pl-4 border-l border-border/50">
                <div className="text-xs">
                  <div className="font-bold text-primary">RADIO</div>
                  <div className="font-bold text-foreground">VYBBI</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}