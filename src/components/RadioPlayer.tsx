import { useState } from "react";
import { Play, Pause, Volume2, SkipForward, SkipBack, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useRadioPlayer } from "@/hooks/useRadioPlayer";
import { Link } from "react-router-dom";

export function RadioPlayer() {
  const [volume, setVolume] = useState([80]);
  const { 
    currentTrack, 
    isPlaying, 
    progress, 
    duration,
    play, 
    pause, 
    nextTrack, 
    previousTrack,
    seek 
  } = useRadioPlayer();

  if (!currentTrack) return null;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 animate-slide-up">
      <div className="bg-gradient-to-r from-card via-card/95 to-card backdrop-blur-lg border-t border-border/50 shadow-2xl">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center gap-4">
            {/* Album Art / Artist Avatar */}
            <div className="flex-shrink-0">
              <Avatar className="w-12 h-12 sm:w-14 sm:h-14 ring-2 ring-primary/20">
                <AvatarImage 
                  src={currentTrack.artist.avatar_url || ''} 
                  alt={currentTrack.artist.display_name}
                />
                <AvatarFallback className="bg-gradient-primary text-primary-foreground font-semibold">
                  {currentTrack.artist.display_name.charAt(0)}
                </AvatarFallback>
              </Avatar>
            </div>

            {/* Track Info & Progress */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-foreground truncate">
                      {currentTrack.title}
                    </p>
                    <Link 
                      to={`/artists/${currentTrack.artist.id}`}
                      className="flex-shrink-0 opacity-60 hover:opacity-100 transition-opacity"
                    >
                      <ExternalLink className="w-3 h-3" />
                    </Link>
                  </div>
                  <p className="text-xs text-muted-foreground truncate">
                    {currentTrack.artist.display_name}
                  </p>
                </div>
                <div className="text-xs text-muted-foreground ml-2">
                  {formatTime(progress)} / {formatTime(duration)}
                </div>
              </div>
              
              {/* Progress Bar */}
              <div className="w-full">
                <Slider
                  value={[progress]}
                  max={duration}
                  step={1}
                  onValueChange={([value]) => seek(value)}
                  className="w-full h-1 cursor-pointer"
                />
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-2 sm:gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={previousTrack}
                className="w-8 h-8 p-0 hover:bg-primary/10"
              >
                <SkipBack className="w-4 h-4" />
              </Button>
              
              <Button
                onClick={isPlaying ? pause : play}
                size="sm"
                className="w-10 h-10 p-0 bg-gradient-primary hover:opacity-90 transition-all duration-200 hover-glow"
              >
                {isPlaying ? (
                  <Pause className="w-5 h-5" />
                ) : (
                  <Play className="w-5 h-5 ml-0.5" />
                )}
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={nextTrack}
                className="w-8 h-8 p-0 hover:bg-primary/10"
              >
                <SkipForward className="w-4 h-4" />
              </Button>

              {/* Volume Control - Hidden on mobile */}
              <div className="hidden sm:flex items-center gap-2 ml-2">
                <Volume2 className="w-4 h-4 text-muted-foreground" />
                <div className="w-16">
                  <Slider
                    value={volume}
                    max={100}
                    step={1}
                    onValueChange={setVolume}
                    className="w-full h-1"
                  />
                </div>
              </div>

              {/* Vybbi Logo/Brand */}
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