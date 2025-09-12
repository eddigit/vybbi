import { useState, useEffect, useRef, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

interface Artist {
  id: string;
  display_name: string;
  avatar_url?: string | null;
}

interface Track {
  id: string;
  title: string;
  url: string;
  artist: Artist;
  type: 'media';
}

export function useRadioPlayer() {
  const [playlist, setPlaylist] = useState<Track[]>([]);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volumePct, setVolumePct] = useState(80); // 0..100 UI scale

  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Build playlist from radio management system or fallback
  const buildPlaylist = useCallback(async () => {
    try {
      console.log("Fetching radio playlist...");
      
      // Try to use the new radio management function first
      const { data: radioTracks, error: radioError } = await supabase
        .rpc('get_radio_playlist');

      if (!radioError && radioTracks && radioTracks.length > 0) {
        console.log(`Found ${radioTracks.length} managed radio tracks`);
        
        // Convert radio tracks to Track format
        const tracks: Track[] = radioTracks.map((track: any) => ({
          id: track.media_asset_id,
          title: track.file_name?.replace(/\.[^/.]+$/, '') || 'Audio Track',
          url: track.file_url,
          artist: {
            id: track.artist_profile_id,
            display_name: track.artist_name || 'Artiste inconnu',
            avatar_url: track.artist_avatar
          },
          type: 'media' as const
        }));

        // Shuffle for radio experience
        const shuffled = [...tracks].sort(() => Math.random() - 0.5);
        setPlaylist(shuffled);
        return;
      }

      console.log("No managed radio tracks, using fallback method...");
      
      // Fallback to old method for backward compatibility
      // 1) Fetch public artists
      const { data: artists, error: artistsError } = await supabase
        .from('profiles')
        .select('id, display_name, avatar_url')
        .eq('profile_type', 'artist')
        .eq('is_public', true)
        .limit(100);

      if (artistsError) {
        console.error('Error fetching artists:', artistsError);
        return;
      }

      const artistIds = (artists || []).map(a => a.id);
      if (!artistIds.length) {
        setPlaylist([fallbackTrack()]);
        return;
      }

      // 2) Fetch audio media assets for these artists
      const { data: assets, error: assetsError } = await supabase
        .from('media_assets')
        .select('id, file_url, file_name, description, profile_id, media_type')
        .eq('media_type', 'audio')
        .in('profile_id', artistIds)
        .limit(200);

      if (assetsError) {
        console.error('Error fetching media assets:', assetsError);
        setPlaylist([fallbackTrack()]);
        return;
      }

      const artistMap = new Map<string, Artist>((artists || []).map(a => [a.id, {
        id: a.id,
        display_name: a.display_name,
        avatar_url: a.avatar_url || null,
      }]));

      const tracks: Track[] = (assets || [])
        .filter(a => !!a.file_url)
        .map(a => ({
          id: a.id,
          title: a.file_name || a.description || 'Audio',
          url: a.file_url!,
          artist: artistMap.get((a as any).profile_id) || {
            id: 'unknown',
            display_name: 'Artiste Vybbi',
            avatar_url: null,
          },
          type: 'media',
        }));

      if (!tracks.length) {
        setPlaylist([fallbackTrack()]);
        return;
      }

      // Shuffle playlist for radio feel
      const shuffled = [...tracks].sort(() => Math.random() - 0.5);
      setPlaylist(shuffled);
    } catch (e) {
      console.error('Error building radio playlist:', e);
      setPlaylist([fallbackTrack()]);
    }
  }, []);

  // Fallback sample track (local asset)
  const fallbackTrack = (): Track => ({
    id: 'vybbi-fallback',
    title: 'Vybbi Radio – Sample',
    url: '/radio/sample.mp3',
    artist: {
      id: 'vybbi-radio',
      display_name: 'Vybbi Radio',
      avatar_url: '/favicon.ico',
    },
    type: 'media',
  });

  useEffect(() => {
    buildPlaylist();
  }, [buildPlaylist]);

  // Create/refresh audio element on track change
  useEffect(() => {
    const track = playlist[currentTrackIndex];
    if (!track) return;

    const audio = new Audio(track.url);
    audio.volume = volumePct / 100;

    const onTime = () => {
      setProgress(audio.currentTime || 0);
      const d = isFinite(audio.duration) ? audio.duration : 0;
      setDuration(d || 0);
    };
    const onLoaded = () => {
      const d = isFinite(audio.duration) ? audio.duration : 0;
      setDuration(d || 0);
    };
    const onEnded = async () => {
      // Move to next track
      if (!playlist.length) return;
      
      // Log track completion analytics
      if (audioRef.current && track) {
        const completed = audio.currentTime / audio.duration > 0.8;
        try {
          await supabase
            .from('radio_play_history')
            .insert({
              media_asset_id: track.id,
              duration_seconds: Math.floor(audio.currentTime || 0),
              completed
            });
          console.log('Track completion logged');
        } catch (error) {
          console.error('Error logging track completion:', error);
        }
      }
      
      setCurrentTrackIndex((i) => (i + 1) % playlist.length);
      setProgress(0);
    };

    audio.addEventListener('timeupdate', onTime);
    audio.addEventListener('loadedmetadata', onLoaded);
    audio.addEventListener('ended', onEnded);

    // swap current audio
    if (audioRef.current) {
      // Stop previous
      audioRef.current.pause();
    }
    audioRef.current = audio;

    // Autoplay if was playing
    if (isPlaying) {
      audio.play().catch(() => {
        // Autoplay might be blocked until user interaction
      });
    }

    return () => {
      audio.pause();
      audio.removeEventListener('timeupdate', onTime);
      audio.removeEventListener('loadedmetadata', onLoaded);
      audio.removeEventListener('ended', onEnded);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentTrackIndex, playlist]);

  // Respect play/pause state
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) {
      audio.play().catch(() => {});
    } else {
      audio.pause();
    }
  }, [isPlaying]);

  // Apply volume changes
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volumePct / 100;
    }
  }, [volumePct]);

  const play = useCallback(() => {
    setIsPlaying(true);
    if (audioRef.current) audioRef.current.play().catch(() => {});
  }, []);

  const pause = useCallback(() => {
    setIsPlaying(false);
    if (audioRef.current) audioRef.current.pause();
  }, []);

  const currentTrack = playlist[currentTrackIndex] || null;

  const nextTrack = useCallback(() => {
    if (!playlist.length) return;
    setCurrentTrackIndex((i) => (i + 1) % playlist.length);
    setProgress(0);
  }, [playlist.length]);

  const previousTrack = useCallback(() => {
    if (!playlist.length) return;
    setCurrentTrackIndex((i) => (i - 1 + playlist.length) % playlist.length);
    setProgress(0);
  }, [playlist.length]);

  const seek = useCallback((time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setProgress(time);
    }
  }, []);

  const setVolume = useCallback((pct: number) => {
    const clamped = Math.max(0, Math.min(100, Math.round(pct)));
    setVolumePct(clamped);
    if (audioRef.current) audioRef.current.volume = clamped / 100;
  }, []);

  return {
    playlist,
    currentTrack,
    isPlaying,
    progress,
    duration,
    volume: volumePct,
    play,
    pause,
    nextTrack,
    previousTrack,
    seek,
    setVolume,
  };
}
