import { useState, useEffect, useRef, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

interface Artist {
  id: string;
  display_name: string;
  avatar_url?: string;
  spotify_url?: string;
  soundcloud_url?: string;
  youtube_url?: string;
}

interface Track {
  id: string;
  title: string;
  url: string;
  artist: Artist;
  type: 'spotify' | 'soundcloud' | 'youtube' | 'media';
}

export function useRadioPlayer() {
  const [playlist, setPlaylist] = useState<Track[]>([]);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.8);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Create and extract track info from artist URLs
  const createTracksFromArtist = useCallback((artist: Artist): Track[] => {
    const tracks: Track[] = [];
    
    // For now, we'll create placeholder tracks from social URLs
    // In a real implementation, you'd use APIs to get actual track data
    if (artist.spotify_url) {
      tracks.push({
        id: `${artist.id}-spotify`,
        title: `${artist.display_name} - Mix Spotify`,
        url: artist.spotify_url,
        artist,
        type: 'spotify'
      });
    }
    
    if (artist.soundcloud_url) {
      tracks.push({
        id: `${artist.id}-soundcloud`,
        title: `${artist.display_name} - Mix SoundCloud`,
        url: artist.soundcloud_url,
        artist,
        type: 'soundcloud'
      });
    }
    
    if (artist.youtube_url) {
      tracks.push({
        id: `${artist.id}-youtube`,
        title: `${artist.display_name} - Mix YouTube`,
        url: artist.youtube_url,
        artist,
        type: 'youtube'
      });
    }

    return tracks;
  }, []);

  // Fetch artists and build playlist
  const buildPlaylist = useCallback(async () => {
    try {
      const { data: artists, error } = await supabase
        .from('profiles')
        .select('id, display_name, avatar_url, spotify_url, soundcloud_url, youtube_url')
        .eq('profile_type', 'artist')
        .eq('is_public', true)
        .not('spotify_url', 'is', null)
        .or('soundcloud_url.not.is.null,youtube_url.not.is.null')
        .limit(20);

      if (error) {
        console.error('Error fetching artists:', error);
        return;
      }

      if (artists && artists.length > 0) {
        const allTracks: Track[] = [];
        
        artists.forEach(artist => {
          const tracks = createTracksFromArtist(artist as Artist);
          allTracks.push(...tracks);
        });

        // Shuffle the playlist
        const shuffledTracks = allTracks.sort(() => Math.random() - 0.5);
        setPlaylist(shuffledTracks);
      }
    } catch (error) {
      console.error('Error building playlist:', error);
    }
  }, [createTracksFromArtist]);

  // Initialize playlist on mount
  useEffect(() => {
    buildPlaylist();
  }, [buildPlaylist]);

  // Update progress
  const updateProgress = useCallback(() => {
    if (audioRef.current) {
      setProgress(audioRef.current.currentTime);
      setDuration(audioRef.current.duration || 0);
    }
  }, []);

  // Setup audio event listeners
  useEffect(() => {
    if (audioRef.current) {
      const audio = audioRef.current;
      
      audio.addEventListener('timeupdate', updateProgress);
      audio.addEventListener('ended', nextTrack);
      audio.addEventListener('loadedmetadata', updateProgress);
      
      return () => {
        audio.removeEventListener('timeupdate', updateProgress);
        audio.removeEventListener('ended', nextTrack);
        audio.removeEventListener('loadedmetadata', updateProgress);
      };
    }
  }, [updateProgress]);

  // Progress interval
  useEffect(() => {
    if (isPlaying) {
      intervalRef.current = setInterval(updateProgress, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isPlaying, updateProgress]);

  const play = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.play();
      setIsPlaying(true);
    }
  }, []);

  const pause = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  }, []);

  const nextTrack = useCallback(() => {
    if (playlist.length === 0) return;
    
    const nextIndex = (currentTrackIndex + 1) % playlist.length;
    setCurrentTrackIndex(nextIndex);
    setProgress(0);
    
    // Auto-play next track if currently playing
    if (isPlaying) {
      setTimeout(() => play(), 100);
    }
  }, [playlist.length, currentTrackIndex, isPlaying, play]);

  const previousTrack = useCallback(() => {
    if (playlist.length === 0) return;
    
    const prevIndex = currentTrackIndex === 0 ? playlist.length - 1 : currentTrackIndex - 1;
    setCurrentTrackIndex(prevIndex);
    setProgress(0);
    
    // Auto-play previous track if currently playing
    if (isPlaying) {
      setTimeout(() => play(), 100);
    }
  }, [playlist.length, currentTrackIndex, isPlaying, play]);

  const seek = useCallback((time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setProgress(time);
    }
  }, []);

  const setVolumeLevel = useCallback((level: number) => {
    const normalizedLevel = Math.max(0, Math.min(1, level / 100));
    setVolume(normalizedLevel);
    if (audioRef.current) {
      audioRef.current.volume = normalizedLevel;
    }
  }, []);

  // Update audio volume
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  const currentTrack = playlist[currentTrackIndex] || null;

  // Create audio element for current track
  useEffect(() => {
    if (currentTrack) {
      // For now, we'll use a placeholder audio element
      // In a real implementation, you'd handle different URL types (Spotify, SoundCloud, etc.)
      // This is a simplified version for demonstration
      audioRef.current = new Audio();
      audioRef.current.volume = volume;
      
      // Note: Direct playback from Spotify/SoundCloud URLs requires their respective APIs
      // This is a placeholder implementation
    }
  }, [currentTrack, volume]);

  return {
    playlist,
    currentTrack,
    isPlaying,
    progress,
    duration,
    volume: volume * 100,
    play,
    pause,
    nextTrack,
    previousTrack,
    seek,
    setVolume: setVolumeLevel,
  };
}