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
    const cleanup = subscribeToNotifications();
    
    return cleanup;
  }, [user]);

  const fetchNotifications = async () => {
    if (!user) return;

    try {
      console.log('Fetching notifications for user:', user.id);
      
      // Get user's conversations first
      const { data: userConversations, error: convError } = await supabase
        .from('conversation_participants')
        .select('conversation_id')
        .eq('user_id', user.id);

      if (convError) {
        console.error('Error fetching user conversations:', convError);
        return;
      }

      const conversationIds = userConversations?.map(c => c.conversation_id) || [];
      
      if (conversationIds.length === 0) {
        setNotifications([]);
        setLoading(false);
        return;
      }

      // Fetch recent messages from user's conversations
      const { data: messages, error } = await supabase
        .from('messages')
        .select(`
          id,
          content,
          created_at,
          sender_id,
          conversation_id
        `)
        .in('conversation_id', conversationIds)
        .neq('sender_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) {
        console.error('Error fetching messages:', error);
        return;
      }

      console.log('Found messages:', messages?.length || 0);

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
      console.log('Set notifications:', messageNotifications.length);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const subscribeToNotifications = () => {
    if (!user) return () => {};

    console.log('Setting up real-time subscription for user:', user.id);

    const channel = supabase
      .channel(`notifications-${user.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
        },
        async (payload) => {
          console.log('New message received:', payload);
          
          // Check if this message is for the current user
          const messageId = payload.new.id;
          const senderId = payload.new.sender_id;
          
          // Skip if the current user sent the message
          if (senderId === user.id) {
            console.log('Skipping own message');
            return;
          }

          try {
            // Check if user participates in this conversation
            const { data: participation, error: partError } = await supabase
              .from('conversation_participants')
              .select('user_id')
              .eq('conversation_id', payload.new.conversation_id)
              .eq('user_id', user.id)
              .single();

            if (partError || !participation) {
              console.log('User not part of this conversation');
              return;
            }

            // Fetch sender profile
            const { data: sender } = await supabase
              .from('profiles')
              .select('display_name, avatar_url')
              .eq('user_id', senderId)
              .single();

            const newNotification: Notification = {
              id: messageId,
              title: 'Nouveau message',
              description: `${sender?.display_name || 'Utilisateur'}: ${payload.new.content.substring(0, 50)}${payload.new.content.length > 50 ? '...' : ''}`,
              time: formatTime(payload.new.created_at),
              unread: true,
              conversationId: payload.new.conversation_id,
              type: 'message'
            };

            console.log('Adding new notification:', newNotification);
            setNotifications(prev => [newNotification, ...prev.slice(0, 9)]);
            
            // Optional: Show browser notification if supported
            if ('Notification' in window && Notification.permission === 'granted') {
              new Notification(newNotification.title, {
                body: newNotification.description,
                icon: sender?.avatar_url || '/favicon.ico'
              });
            }
          } catch (error) {
            console.error('Error processing new message notification:', error);
          }
        }
      )
      .subscribe((status) => {
        console.log('Subscription status:', status);
      });

    return () => {
      console.log('Cleaning up notification subscription');
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