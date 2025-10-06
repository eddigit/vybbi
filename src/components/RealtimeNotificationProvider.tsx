import React, { createContext, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRealtimeNotifications } from '@/hooks/useRealtimeNotifications';
import { useToast } from '@/hooks/use-toast';
import { requestNotificationPermission } from '@/utils/notificationPermissions';

interface RealtimeNotificationContextType {
  isConnected: boolean;
}

const RealtimeNotificationContext = createContext<RealtimeNotificationContextType>({
  isConnected: false
});

export const useRealtimeNotificationContext = () => useContext(RealtimeNotificationContext);

interface Props {
  children: React.ReactNode;
}

/**
 * Provider global pour les notifications en temps réel
 * Gère automatiquement les notifications pour toute l'application
 */
export function RealtimeNotificationProvider({ children }: Props) {
  const navigate = useNavigate();
  const { toast } = useToast();

  // Demander les permissions au chargement
  useEffect(() => {
    console.log('🚀 [RealtimeNotificationProvider] Requesting notification permissions...');
    requestNotificationPermission().then(granted => {
      if (granted) {
        console.log('✅ [RealtimeNotificationProvider] Notification permissions granted');
      } else {
        console.log('❌ [RealtimeNotificationProvider] Notification permissions denied');
      }
    });
  }, []);

  // Configuration des handlers pour chaque type de notification
  const { isConnected } = useRealtimeNotifications({
    enableInstantUpdates: true,
    enableSoundNotifications: false, // Désactivé par défaut pour éviter les sons intempestifs
    
    onNewMessage: (data) => {
      console.log('💬 [RealtimeNotificationProvider] New message handler triggered:', data);
      
      // Toast notification immédiate
      toast({
        title: `💬 Message de ${data.senderName}`,
        description: data.messagePreview,
        duration: 3000,
        action: (
          <button 
            onClick={() => {
              if (data.conversationId) {
                navigate('/messages', { 
                  state: { selectedConversationId: data.conversationId } 
                });
              }
            }}
            className="text-primary underline"
          >
            Voir
          </button>
        )
      });
    },

    onBookingRequest: (data) => {
      console.log('📅 [RealtimeNotificationProvider] Booking request handler triggered:', data);
      
      toast({
        title: '📅 Nouvelle demande de booking',
        description: `${data.venueName} souhaite vous booker pour ${data.eventTitle || 'un événement'}`,
        duration: 3000,
        action: (
          <button 
            onClick={() => navigate('/dashboard')}
            className="text-primary underline"
          >
            Voir
          </button>
        )
      });
    },

    onAgentRequest: (data) => {
      console.log('🎯 [RealtimeNotificationProvider] Agent request handler triggered:', data);
      
      toast({
        title: '🎯 Demande de représentation',
        description: `${data.agentName} souhaite devenir votre agent`,
        duration: 3000,
        action: (
          <button 
            onClick={() => navigate('/dashboard')}
            className="text-primary underline"
          >
            Voir
          </button>
        )
      });
    },

    onManagerRequest: (data) => {
      console.log('👔 [RealtimeNotificationProvider] Manager request handler triggered:', data);
      
      toast({
        title: '👔 Demande de management',
        description: `${data.managerName} souhaite devenir votre manager`,
        duration: 3000,
        action: (
          <button 
            onClick={() => navigate('/dashboard')}
            className="text-primary underline"
          >
            Voir
          </button>
        )
      });
    },

    onReviewReceived: (data) => {
      console.log('⭐ [RealtimeNotificationProvider] Review received handler triggered:', data);
      
      toast({
        title: '⭐ Nouvelle review',
        description: `Vous avez reçu une review de ${data.reviewerName}`,
        duration: 3000,
        action: (
          <button 
            onClick={() => navigate('/dashboard')}
            className="text-primary underline"
          >
            Voir
          </button>
        )
      });
    },

    onApplicationReceived: (data) => {
      console.log('📝 [RealtimeNotificationProvider] Application received handler triggered:', data);
      
      toast({
        title: '📝 Nouvelle candidature',
        description: `${data.applicantName} a postulé à votre annonce "${data.annonceTitle}"`,
        duration: 3000,
        action: (
          <button 
            onClick={() => navigate('/annonces-manager')}
            className="text-primary underline"
          >
            Voir
          </button>
        )
      });
    }
  });

  // Gérer les clics sur les notifications browser
  useEffect(() => {
    const handleNotificationClick = (event: Event) => {
      const notificationEvent = event as any;
      const data = notificationEvent.notification?.data;
      
      if (data) {
        console.log('🔔 [RealtimeNotificationProvider] Notification clicked:', data);
        
        switch (data.type) {
          case 'new_message':
            if (data.conversationId) {
              navigate('/messages', { 
                state: { selectedConversationId: data.conversationId } 
              });
            }
            break;
          case 'booking_request':
            navigate('/dashboard');
            break;
          case 'agent_request':
          case 'manager_request':
          case 'review_received':
            navigate('/dashboard');
            break;
          case 'application_received':
            navigate('/annonces-manager');
            break;
        }
      }
    };

    navigator.serviceWorker?.addEventListener('notificationclick', handleNotificationClick);
    
    return () => {
      navigator.serviceWorker?.removeEventListener('notificationclick', handleNotificationClick);
    };
  }, [navigate]);

  return (
    <RealtimeNotificationContext.Provider value={{ isConnected }}>
      {children}
    </RealtimeNotificationContext.Provider>
  );
}