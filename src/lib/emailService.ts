import { supabase } from '@/integrations/supabase/client';

export type EmailNotificationType = 
  | 'user_registration' 
  | 'admin_notification' 
  | 'review_notification' 
  | 'contact_message'
  | 'booking_proposed'
  | 'booking_status_changed';

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