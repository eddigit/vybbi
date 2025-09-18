import { Play, Pause, Volume2, SkipForward, SkipBack, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useRadioPlayer } from "@/hooks/useRadioPlayer";
import { Link, useLocation } from "react-router-dom";
import { getProfileUrl } from '@/hooks/useProfileResolver';

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

  if (!currentTrack) return null;

  // Determine if MobileTabBar is present based on current route
  const isLanding = location.pathname === '/';
  const isAuth = location.pathname === '/auth';
  const isArtistProfile = location.pathname.match(/^\/artists\/[^\/]+$/) && !location.pathname.includes('/edit');
  const isVenueProfile = location.pathname.match(/^\/lieux\/[^\/]+$/) && !location.pathname.includes('/edit');
  const isPartnerProfile = location.pathname.match(/^\/partners\/[^\/]+$/) && !location.pathname.includes('/edit');
  const hasMobileTabBar = !(isLanding || isAuth || isArtistProfile || isVenueProfile || isPartnerProfile);

  const formatTime = (seconds: number) => {
    const total = Math.max(0, Math.floor(seconds || 0));
    const mins = Math.floor(total / 60);
    const secs = total % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const progressVal = Math.min(Math.floor(progress || 0), Math.floor(duration || 0));
  const durationVal = Math.floor(duration || 0);

  return (
    <div 
      className="fixed left-0 right-0 z-[60] animate-slide-up bottom-0 md:bottom-0"

      aria-label="Lecteur Radio Vybbi"
    >
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
                  onValueChange={([v]) => seek(v)}
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
                onClick={isPlaying ? pause : play}
                size="sm"
                className="w-8 h-8 sm:w-10 sm:h-10 p-0 bg-gradient-primary hover:opacity-90 transition-all duration-200 hover-glow"
                aria-label={isPlaying ? 'Pause' : 'Lecture'}
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