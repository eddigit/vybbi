import { useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { showNotification } from '@/utils/notificationPermissions';

export interface RealtimeNotificationOptions {
  onNewMessage?: (data: any) => void;
  onBookingRequest?: (data: any) => void;
  onAgentRequest?: (data: any) => void;
  onManagerRequest?: (data: any) => void;
  onReviewReceived?: (data: any) => void;
  onApplicationReceived?: (data: any) => void;
  enableInstantUpdates?: boolean;
  enableSoundNotifications?: boolean;
}

/**
 * Hook spécialisé pour les notifications en temps réel avec gestion avancée
 * Optimisé pour les performances et la réactivité instantanée
 */
export function useRealtimeNotifications(options: RealtimeNotificationOptions = {}) {
  const { user } = useAuth();
  const channelRef = useRef<any>(null);
  const {
    onNewMessage,
    onBookingRequest,
    onAgentRequest,
    onManagerRequest,
    onReviewReceived,
    onApplicationReceived,
    enableInstantUpdates = true,
    enableSoundNotifications = false
  } = options;

  useEffect(() => {
    if (!user || !enableInstantUpdates) return;

    console.log('🚀 [RealtimeNotifications] Initializing advanced real-time system for user:', user.id);

    // Nettoyer l'ancien channel s'il existe
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
    }

    // Créer un channel optimisé avec un nom unique
    const channelName = `realtime-notifications-${user.id}-${Date.now()}`;
    const channel = supabase.channel(channelName);

    // Écouter les nouvelles notifications avec gestion par type
    channel.on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${user.id}`
      },
      async (payload) => {
        console.log('🔥 [RealtimeNotifications] New notification:', payload);
        
        const notification = payload.new as any;
        const notificationData = notification.data || {};

        // Gestion spécialisée par type de notification
        switch (notification.type) {
          case 'new_message':
            console.log('💬 [RealtimeNotifications] New message notification');
            onNewMessage?.(notificationData);
            
            // Notification browser enrichie pour les messages
            showNotification(
              `💬 ${notificationData.senderName || 'Nouveau message'}`,
              {
                body: notificationData.messagePreview || notification.message,
                icon: notificationData.senderAvatarUrl || '/favicon.ico',
                tag: `message-${notificationData.conversation_id}`,
                requireInteraction: true,
                data: {
                  type: 'new_message',
                  conversationId: notificationData.conversation_id,
                  senderId: notificationData.sender_id,
                  notificationId: notification.id
                }
              }
            );
            break;

          case 'booking_request':
            console.log('📅 [RealtimeNotifications] Booking request notification');
            onBookingRequest?.(notificationData);
            
            showNotification(
              `📅 Demande de booking`,
              {
                body: `${notificationData.venueName} souhaite vous booker`,
                icon: '/favicon.ico',
                tag: `booking-${notificationData.booking_id}`,
                data: {
                  type: 'booking_request',
                  bookingId: notificationData.booking_id,
                  notificationId: notification.id
                }
              }
            );
            break;

          case 'agent_request':
            console.log('🎯 [RealtimeNotifications] Agent request notification');
            onAgentRequest?.(notificationData);
            
            showNotification(
              `🎯 Demande d'agent`,
              {
                body: `${notificationData.agentName} souhaite vous représenter`,
                icon: '/favicon.ico',
                tag: `agent-${notificationData.agent_profile_id}`,
                data: {
                  type: 'agent_request',
                  agentProfileId: notificationData.agent_profile_id,
                  notificationId: notification.id
                }
              }
            );
            break;

          case 'manager_request':
            console.log('👔 [RealtimeNotifications] Manager request notification');
            onManagerRequest?.(notificationData);
            
            showNotification(
              `👔 Demande de management`,
              {
                body: `${notificationData.managerName} souhaite vous manager`,
                icon: '/favicon.ico',
                tag: `manager-${notificationData.manager_profile_id}`,
                data: {
                  type: 'manager_request',
                  managerProfileId: notificationData.manager_profile_id,
                  notificationId: notification.id
                }
              }
            );
            break;

          case 'review_received':
            console.log('⭐ [RealtimeNotifications] Review received notification');
            onReviewReceived?.(notificationData);
            
            showNotification(
              `⭐ Nouvelle review`,
              {
                body: `Vous avez reçu une nouvelle review de ${notificationData.reviewerName}`,
                icon: '/favicon.ico',
                tag: `review-${notificationData.review_id}`,
                data: {
                  type: 'review_received',
                  reviewId: notificationData.review_id,
                  notificationId: notification.id
                }
              }
            );
            break;

          case 'application_received':
            console.log('📝 [RealtimeNotifications] Application received notification');
            onApplicationReceived?.(notificationData);
            
            showNotification(
              `📝 Nouvelle candidature`,
              {
                body: `${notificationData.applicantName} a postulé à votre annonce`,
                icon: '/favicon.ico',
                tag: `application-${notificationData.application_id}`,
                data: {
                  type: 'application_received',
                  applicationId: notificationData.application_id,
                  notificationId: notification.id
                }
              }
            );
            break;

          default:
            console.log('🔔 [RealtimeNotifications] Generic notification');
            showNotification(notification.title, {
              body: notification.message,
              icon: '/favicon.ico',
              tag: `generic-${notification.id}`,
              data: {
                type: notification.type,
                notificationId: notification.id
              }
            });
        }

        // Son de notification si activé
        if (enableSoundNotifications) {
          try {
            const audio = new Audio('/notification.mp3');
            audio.volume = 0.3;
            audio.play().catch(e => console.log('Could not play notification sound:', e));
          } catch (error) {
            console.log('Notification sound error:', error);
          }
        }
      }
    );

    // S'abonner au channel
    channel.subscribe((status) => {
      console.log('🔗 [RealtimeNotifications] Subscription status:', status);
      if (status === 'SUBSCRIBED') {
        console.log('✅ [RealtimeNotifications] Successfully connected to real-time notifications');
      } else if (status === 'CLOSED') {
        console.log('❌ [RealtimeNotifications] Real-time connection closed');
      }
    });

    channelRef.current = channel;

    return () => {
      console.log('🧹 [RealtimeNotifications] Cleaning up real-time subscription');
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [user, enableInstantUpdates, onNewMessage, onBookingRequest, onAgentRequest, onManagerRequest, onReviewReceived, onApplicationReceived, enableSoundNotifications]);

  return {
    isConnected: channelRef.current !== null
  };
}