import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { requestNotificationPermission, showNotification } from '@/utils/notificationPermissions';

interface Notification {
  id: string;
  user_id: string;
  type: string;
  title: string;
  message: string;
  data: any;
  read_at: string | null;
  email_sent: boolean;
  email_sent_at: string | null;
  related_id: string | null;
  created_at: string;
  updated_at: string;
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

    console.log('🔔 [useNotifications] Initializing for user:', user.id);

    // Demander la permission pour les notifications
    requestNotificationPermission().then(granted => {
      console.log('🔔 [useNotifications] Browser notification permission granted:', granted);
    });

    fetchNotifications();
    const cleanup = subscribeToNotifications();
    
    return cleanup;
  }, [user]);

  const fetchNotifications = async () => {
    if (!user) return;

    try {
      console.log('Fetching notifications for user:', user.id);
      
      // Fetch notifications from the notifications table
      const { data: notifications, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) {
        console.error('Error fetching notifications:', error);
        return;
      }

      console.log('Found notifications:', notifications?.length || 0);
      setNotifications(notifications || []);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const subscribeToNotifications = () => {
    if (!user) return () => {};

    console.log('🔔 [useNotifications] Setting up real-time subscription for user:', user.id);

    // Debouncing intelligent pour éviter les doublons tout en gardant la réactivité
    let timeoutId: NodeJS.Timeout;
    let lastFetchTime = 0;
    const debouncedFetch = () => {
      clearTimeout(timeoutId);
      const now = Date.now();
      // Si la dernière fetch était il y a moins de 100ms, on debounce
      const delay = (now - lastFetchTime) < 100 ? 200 : 0;
      timeoutId = setTimeout(() => {
        lastFetchTime = Date.now();
        fetchNotifications();
      }, delay);
    };

    const channel = supabase
      .channel(`notifications-realtime-${user.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`
        },
        async (payload) => {
          console.log('🔔 [REALTIME] New notification received:', payload);
          
          const newNotification = payload.new as Notification;
          
          // Optimistic update immédiat pour la réactivité
          setNotifications(prev => {
            const exists = prev.some(n => n.id === newNotification.id);
            if (exists) {
              console.log('🔔 [REALTIME] Notification already exists, skipping:', newNotification.id);
              return prev;
            }
            
            console.log('🔔 [REALTIME] Adding new notification instantly:', newNotification.title);
            return [newNotification, ...prev.slice(0, 19)];
          });
          
          // Notification browser immédiate avec métadonnées enrichies
          const notificationData = newNotification.data || {};
          showNotification(newNotification.title, {
            body: newNotification.message,
            icon: '/favicon.ico',
            tag: `notification-${newNotification.type}-${newNotification.id}`,
            requireInteraction: newNotification.type === 'new_message', // Messages nécessitent interaction
            data: {
              notificationId: newNotification.id,
              type: newNotification.type,
              conversationId: notificationData.conversation_id,
              senderId: notificationData.sender_id,
              senderName: notificationData.senderName,
              timestamp: newNotification.created_at,
              ...notificationData
            }
          });
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public', 
          table: 'notifications',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          console.log('🔔 [REALTIME] Notification updated:', payload);
          // Update immédiat en local
          setNotifications(prev => 
            prev.map(notification => 
              notification.id === payload.new.id 
                ? { ...notification, ...payload.new } as Notification
                : notification
            )
          );
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          console.log('🔔 [REALTIME] Notification deleted:', payload);
          // Suppression immédiate en local
          setNotifications(prev => prev.filter(n => n.id !== payload.old.id));
        }
      )
      .subscribe((status) => {
        console.log('🔔 [REALTIME] Notification subscription status:', status);
        if (status === 'SUBSCRIBED') {
          console.log('🔔 [REALTIME] ✅ Successfully subscribed to notifications');
        } else if (status === 'CLOSED') {
          console.log('🔔 [REALTIME] ❌ Notification subscription closed');
        }
      });

    return () => {
      console.log('Cleaning up notification subscription');
      clearTimeout(timeoutId);
      supabase.removeChannel(channel);
    };
  };

  const markAsRead = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read_at: new Date().toISOString() })
        .eq('id', notificationId);

      if (error) {
        console.error('Error marking notification as read:', error);
        return;
      }

      setNotifications(prev => 
        prev.map(notification => 
          notification.id === notificationId 
            ? { ...notification, read_at: new Date().toISOString() }
            : notification
        )
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const deleteNotification = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', notificationId);

      if (error) {
        console.error('Error deleting notification:', error);
        return;
      }

      setNotifications(prev => prev.filter(n => n.id !== notificationId));
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const unreadCount = notifications.filter(n => !n.read_at).length;

  return {
    notifications,
    loading,
    unreadCount,
    markAsRead,
    deleteNotification,
    refetch: fetchNotifications
  };
}