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

    // Demander la permission pour les notifications
    requestNotificationPermission().then(granted => {
      console.log('Notification permission granted:', granted);
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

    console.log('Setting up real-time subscription for notifications:', user.id);

    // Debouncing to avoid duplicate notifications
    let timeoutId: NodeJS.Timeout;
    const debouncedFetch = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(fetchNotifications, 300);
    };

    const channel = supabase
      .channel(`notifications-${user.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`
        },
        async (payload) => {
          console.log('New notification received:', payload);
          
          const newNotification = payload.new as Notification;
          
          // Avoid duplicates
          setNotifications(prev => {
            const exists = prev.some(n => n.id === newNotification.id);
            if (exists) return prev;
            
            console.log('Adding new notification:', newNotification);
            return [newNotification, ...prev.slice(0, 19)];
          });
          
          // Show browser notification
          showNotification(newNotification.title, {
            body: newNotification.message,
            icon: '/favicon.ico',
            tag: 'notification-' + newNotification.id,
            data: {
              notificationId: newNotification.id,
              type: newNotification.type,
              ...newNotification.data
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
        debouncedFetch
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`
        },
        debouncedFetch
      )
      .subscribe((status) => {
        console.log('Notification subscription status:', status);
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