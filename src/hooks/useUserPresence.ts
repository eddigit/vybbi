import { useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export function useUserPresence() {
  const { user, profile } = useAuth();
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const updatePresence = async (isOnline: boolean) => {
    if (!user || !profile) return;

    try {
      await supabase
        .from('user_presence')
        .upsert({
          user_id: user.id,
          profile_id: profile.id,
          is_online: isOnline,
          last_seen_at: new Date().toISOString()
        });
    } catch (error) {
      console.error('Error updating user presence:', error);
    }
  };

  const setOnline = () => updatePresence(true);
  const setOffline = () => updatePresence(false);

  useEffect(() => {
    if (!user || !profile) return;

    // Set user as online when component mounts
    setOnline();

    // Update presence every 30 seconds while user is active
    intervalRef.current = setInterval(setOnline, 30000);

    // Handle browser events
    const handleFocus = () => setOnline();
    const handleBlur = () => setOffline();
    const handleBeforeUnload = () => setOffline();

    // Add event listeners
    window.addEventListener('focus', handleFocus);
    window.addEventListener('blur', handleBlur);
    window.addEventListener('beforeunload', handleBeforeUnload);

    // Handle visibility change (when tab becomes hidden/visible)
    const handleVisibilityChange = () => {
      if (document.hidden) {
        setOffline();
      } else {
        setOnline();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Cleanup function
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('blur', handleBlur);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      
      // Set user as offline when component unmounts
      setOffline();
    };
  }, [user, profile]);

  return {
    setOnline,
    setOffline
  };
}