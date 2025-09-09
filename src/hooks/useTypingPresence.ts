import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface TypingUser {
  user_id: string;
  display_name: string;
  avatar_url?: string;
}

export function useTypingPresence(conversationId: string | null) {
  const { user, profile } = useAuth();
  const [typingUsers, setTypingUsers] = useState<TypingUser[]>([]);
  const [channel, setChannel] = useState<any>(null);

  const startTyping = useCallback(() => {
    if (!conversationId || !user || !profile || !channel) return;

    channel.track({
      typing: true,
      user_id: user.id,
      display_name: profile.display_name,
      avatar_url: profile.avatar_url
    });
  }, [conversationId, user, profile, channel]);

  const stopTyping = useCallback(() => {
    if (!conversationId || !user || !channel) return;

    channel.track({
      typing: false,
      user_id: user.id
    });
  }, [conversationId, user, channel]);

  useEffect(() => {
    if (!conversationId || !user) {
      setTypingUsers([]);
      if (channel) {
        supabase.removeChannel(channel);
        setChannel(null);
      }
      return;
    }

    const presenceChannel = supabase.channel(`typing:${conversationId}`, {
      config: {
        presence: {
          key: user.id,
        },
      },
    });

    presenceChannel
      .on('presence', { event: 'sync' }, () => {
        const state = presenceChannel.presenceState();
        const typing: TypingUser[] = [];
        
        Object.entries(state).forEach(([userId, presences]: [string, any[]]) => {
          if (userId !== user.id && presences.length > 0) {
            const presence = presences[0];
            if (presence.typing) {
              typing.push({
                user_id: userId,
                display_name: presence.display_name || 'Utilisateur',
                avatar_url: presence.avatar_url
              });
            }
          }
        });
        
        setTypingUsers(typing);
      })
      .on('presence', { event: 'join' }, ({ key, newPresences }) => {
        // Handle new user joining
      })
      .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
        // Handle user leaving
        setTypingUsers(prev => prev.filter(u => u.user_id !== key));
      })
      .subscribe();

    setChannel(presenceChannel);

    return () => {
      supabase.removeChannel(presenceChannel);
    };
  }, [conversationId, user]);

  return {
    typingUsers,
    startTyping,
    stopTyping
  };
}