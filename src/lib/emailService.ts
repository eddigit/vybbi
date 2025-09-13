import { supabase } from '@/integrations/supabase/client';

export type EmailNotificationType = 
  | 'user_registration' 
  | 'admin_notification' 
  | 'review_notification' 
  | 'contact_message'
  | 'booking_proposed'
  | 'booking_status_changed'
  | 'message_received'
  | 'prospect_follow_up';

interface EmailNotificationData {
  userName?: string;
  userEmail?: string;
  profileType?: string;
  artistName?: string;
  artistId?: string;
  reviewerName?: string;
  rating?: number;
  message?: string;
  senderName?: string;
  senderEmail?: string;
  venueName?: string;
  eventTitle?: string;
  eventDate?: string;
  proposedFee?: string;
  status?: string;
  [key: string]: any;
}

interface NotificationEmailRequest {
  type: EmailNotificationType;
  to: string;
  data: EmailNotificationData;
}

export const sendNotificationEmail = async (
  type: EmailNotificationType, 
  to: string, 
  data: EmailNotificationData
): Promise<{ success: boolean; error?: string }> => {
  try {
    const { data: response, error } = await supabase.functions.invoke('send-notification', {
      body: {
        type,
        to,
        data
      }
    });

    if (error) {
      console.error('Error calling send-notification function:', error);
      return { success: false, error: error.message };
    }

    if (response.error) {
      console.error('Error from send-notification function:', response.error);
      return { success: false, error: response.error };
    }

    console.log('Email sent successfully:', response);
    return { success: true };

  } catch (error: any) {
    console.error('Error sending notification email:', error);
    return { success: false, error: error.message };
  }
};

// Fonction utilitaire pour envoyer un email de bienvenue
export const sendWelcomeEmail = async (userEmail: string, userName: string, profileType: string) => {
  return await sendNotificationEmail('user_registration', userEmail, {
    userName,
    userEmail,
    profileType
  });
};

// Fonction utilitaire pour notifier l'admin d'une nouvelle inscription
export const sendAdminNotification = async (adminEmail: string, userName: string, userEmail: string, profileType: string) => {
  return await sendNotificationEmail('admin_notification', adminEmail, {
    userName,
    userEmail,
    profileType
  });
};

// Fonction utilitaire pour notifier un artiste d'un nouvel avis
export const sendReviewNotification = async (
  artistEmail: string, 
  artistName: string, 
  artistId: string,
  reviewerName: string, 
  rating: number, 
  message?: string
) => {
  return await sendNotificationEmail('review_notification', artistEmail, {
    artistName,
    artistId,
    reviewerName,
    rating,
    message
  });
};

// Fonction utilitaire pour envoyer un message de contact
export const sendContactMessage = async (
  to: string,
  senderName: string,
  senderEmail: string,
  message: string
) => {
  return await sendNotificationEmail('contact_message', to, {
    senderName,
    senderEmail,
    message
  });
};

// Fonction utilitaire pour notifier une venue d'une demande de booking
export const sendBookingProposedNotification = async (
  venueEmail: string,
  venueName: string,
  eventTitle: string,
  eventDate: string,
  artistName: string,
  proposedFee: string,
  message?: string
) => {
  return await sendNotificationEmail('booking_proposed', venueEmail, {
    venueName,
    eventTitle,
    eventDate,
    artistName,
    proposedFee,
    message,
    dashboardUrl: `${window.location.origin}/venue-dashboard`,
    unsubscribeUrl: `${window.location.origin}/unsubscribe`
  });
};

// Fonction utilitaire pour notifier un artiste du changement de statut de booking
export const sendBookingStatusChangedNotification = async (
  artistEmail: string,
  artistName: string,
  eventTitle: string,
  eventDate: string,
  venueName: string,
  status: string,
  statusColor: string,
  message?: string
) => {
  return await sendNotificationEmail('booking_status_changed', artistEmail, {
    artistName,
    eventTitle,
    eventDate,
    venueName,
    status,
    statusColor,
    message,
    dashboardUrl: `${window.location.origin}/artist-dashboard`,
    unsubscribeUrl: `${window.location.origin}/unsubscribe`
  });
};

// Fonction utilitaire pour notifier un utilisateur d'un nouveau message
export const sendMessageReceivedNotification = async (
  recipientEmail: string,
  recipientName: string,
  senderName: string,
  message: string,
  conversationId: string
) => {
  return await sendNotificationEmail('message_received', recipientEmail, {
    recipientName,
    senderName,
    message,
    messageUrl: `${window.location.origin}/messages?conversation=${conversationId}`,
    unsubscribeUrl: `${window.location.origin}/unsubscribe`
  });
};

// Fonction utilitaire pour le suivi de prospection
export const sendProspectFollowUpEmail = async (
  userEmail: string,
  userName: string,
  profileId: string
) => {
  return await sendNotificationEmail('prospect_follow_up', userEmail, {
    userName,
    profileUrl: `${window.location.origin}/profile/${profileId}/edit`,
    unsubscribeUrl: `${window.location.origin}/unsubscribe`
  });
};