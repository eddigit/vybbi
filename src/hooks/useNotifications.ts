import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

interface Notification {
  id: string;
  title: string;
  description: string;
  time: string;
  unread: boolean;
  conversationId?: string;
  type: 'message' | 'application' | 'booking';
}

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      setNotifications([]);
      setLoading(false);
      return;
    }

    fetchNotifications();
    subscribeToNotifications();
  }, [user]);

  const fetchNotifications = async () => {
    if (!user) return;

    try {
      // Fetch recent messages from conversations where user participates
      const { data: messages, error } = await supabase
        .from('messages')
        .select(`
          id,
          content,
          created_at,
          sender_id,
          conversation_id,
          conversations!inner(
            id,
            title,
            conversation_participants!inner(user_id)
          )
        `)
        .neq('sender_id', user.id)
        .eq('conversations.conversation_participants.user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) {
        console.error('Error fetching messages:', error);
        return;
      }

      // Fetch sender profiles separately
      const senderIds = [...new Set((messages || []).map(m => m.sender_id))];
      const { data: senders } = await supabase
        .from('profiles')
        .select('id, user_id, display_name, avatar_url')
        .in('user_id', senderIds);

      const messageNotifications: Notification[] = (messages || []).map((message: any) => {
        const sender = senders?.find(s => s.user_id === message.sender_id);
        return {
          id: message.id,
          title: 'Nouveau message',
          description: `${sender?.display_name || 'Utilisateur'}: ${message.content.substring(0, 50)}${message.content.length > 50 ? '...' : ''}`,
          time: formatTime(message.created_at),
          unread: true,
          conversationId: message.conversation_id,
          type: 'message' as const
        };
      });

      setNotifications(messageNotifications);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const subscribeToNotifications = () => {
    if (!user) return;

    const channel = supabase
      .channel('notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `sender_id=neq.${user.id}`
        },
        async (payload) => {
          // Fetch additional data for the new message
          const { data: messageData } = await supabase
            .from('messages')
            .select(`
              id,
              content,
              created_at,
              sender_id,
              conversation_id,
              conversations!inner(
                conversation_participants!inner(user_id)
              )
            `)
            .eq('id', payload.new.id)
            .eq('conversations.conversation_participants.user_id', user.id)
            .single();

          if (messageData) {
            // Fetch sender profile
            const { data: sender } = await supabase
              .from('profiles')
              .select('display_name, avatar_url')
              .eq('user_id', messageData.sender_id)
              .single();

            const newNotification: Notification = {
              id: messageData.id,
              title: 'Nouveau message',
              description: `${sender?.display_name || 'Utilisateur'}: ${messageData.content.substring(0, 50)}${messageData.content.length > 50 ? '...' : ''}`,
              time: formatTime(messageData.created_at),
              unread: true,
              conversationId: messageData.conversation_id,
              type: 'message'
            };

            setNotifications(prev => [newNotification, ...prev.slice(0, 9)]);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return 'À l\'instant';
    if (diffInMinutes < 60) return `Il y a ${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''}`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `Il y a ${diffInHours} heure${diffInHours > 1 ? 's' : ''}`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    return `Il y a ${diffInDays} jour${diffInDays > 1 ? 's' : ''}`;
  };

  const markAsRead = (notificationId: string) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === notificationId 
          ? { ...notification, unread: false }
          : notification
      )
    );
  };

  const unreadCount = notifications.filter(n => n.unread).length;

  return {
    notifications,
    loading,
    unreadCount,
    markAsRead,
    refetch: fetchNotifications
  };
}