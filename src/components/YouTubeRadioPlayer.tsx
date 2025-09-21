import React, { useRef, useEffect, forwardRef, useImperativeHandle } from 'react';

interface YouTubeRadioPlayerProps {
  videoId: string;
  onReady?: (duration: number) => void;
  onPlay?: () => void;
  onPause?: () => void;
  onEnded?: () => void;
  onTimeUpdate?: (currentTime: number) => void;
}

export interface YouTubeRadioPlayerRef {
  play: () => void;
  pause: () => void;
  seekTo: (time: number) => void;
  getCurrentTime: () => number;
  getDuration: () => number;
}

declare global {
  interface Window {
    onYouTubeIframeAPIReady: () => void;
    YT: any;
  }
}

export const YouTubeRadioPlayer = forwardRef<YouTubeRadioPlayerRef, YouTubeRadioPlayerProps>(({
  videoId,
  onReady,
  onPlay,
  onPause,
  onEnded,
  onTimeUpdate,
}, ref) => {
  const playerRef = useRef<HTMLDivElement>(null);
  const ytPlayerRef = useRef<any>(null);
  const intervalRef = useRef<NodeJS.Timeout>();

  // Expose player methods via ref
  useImperativeHandle(ref, () => ({
    play: () => {
      if (ytPlayerRef.current && ytPlayerRef.current.playVideo) {
        ytPlayerRef.current.playVideo();
      }
    },
    pause: () => {
      if (ytPlayerRef.current && ytPlayerRef.current.pauseVideo) {
        ytPlayerRef.current.pauseVideo();
      }
    },
    seekTo: (time: number) => {
      if (ytPlayerRef.current && ytPlayerRef.current.seekTo) {
        ytPlayerRef.current.seekTo(time);
      }
    },
    getCurrentTime: () => {
      return ytPlayerRef.current?.getCurrentTime?.() || 0;
    },
    getDuration: () => {
      return ytPlayerRef.current?.getDuration?.() || 0;
    },
  }));

  // Load YouTube API
  useEffect(() => {
    const loadYouTubeAPI = () => {
      if (window.YT && window.YT.Player) {
        initializePlayer();
        return;
      }

      if (!document.getElementById('youtube-api-script')) {
        const script = document.createElement('script');
        script.id = 'youtube-api-script';
        script.src = 'https://www.youtube.com/iframe_api';
        document.head.appendChild(script);
      }

      window.onYouTubeIframeAPIReady = initializePlayer;
    };

    const initializePlayer = () => {
      if (!playerRef.current || !videoId) return;

      ytPlayerRef.current = new window.YT.Player(playerRef.current, {
        height: '1',
        width: '1',
        videoId: videoId,
        playerVars: {
          autoplay: 0,
          controls: 0,
          rel: 0,
          showinfo: 0,
          modestbranding: 1,
          fs: 0,
          playsinline: 1
        },
        events: {
          onReady: (event: any) => {
            const duration = event.target.getDuration();
            onReady?.(duration);
            startTimeTracking();
          },
          onStateChange: (event: any) => {
            const state = event.data;
            if (state === window.YT.PlayerState.PLAYING) {
              onPlay?.();
            } else if (state === window.YT.PlayerState.PAUSED) {
              onPause?.();
            } else if (state === window.YT.PlayerState.ENDED) {
              stopTimeTracking();
              onEnded?.();
            }
          }
        }
      });
    };

    const startTimeTracking = () => {
      stopTimeTracking();
      intervalRef.current = setInterval(() => {
        if (ytPlayerRef.current && ytPlayerRef.current.getCurrentTime) {
          const current = ytPlayerRef.current.getCurrentTime();
          onTimeUpdate?.(current);
        }
      }, 1000);
    };

    const stopTimeTracking = () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = undefined;
      }
    };

    loadYouTubeAPI();

    return () => {
      stopTimeTracking();
      if (ytPlayerRef.current && ytPlayerRef.current.destroy) {
        ytPlayerRef.current.destroy();
      }
    };
  }, [videoId]);

  return (
    <div className="hidden">
      <div ref={playerRef} style={{ width: '1px', height: '1px' }} />
    </div>
  );
});

YouTubeRadioPlayer.displayName = 'YouTubeRadioPlayer';