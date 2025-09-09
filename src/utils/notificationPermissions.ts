import { playNotificationSound } from './notificationSound';

export const requestNotificationPermission = async (): Promise<boolean> => {
  if (!('Notification' in window)) {
    console.warn('Ce navigateur ne supporte pas les notifications');
    return false;
  }

  if (Notification.permission === 'granted') {
    return true;
  }

  if (Notification.permission === 'denied') {
    console.warn('Les notifications ont été refusées par l\'utilisateur');
    return false;
  }

  try {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  } catch (error) {
    console.error('Erreur lors de la demande de permission:', error);
    return false;
  }
};

export const showNotification = (title: string, options?: NotificationOptions): boolean => {
  if (!('Notification' in window) || Notification.permission !== 'granted') {
    return false;
  }

  try {
    new Notification(title, {
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      tag: 'message-notification',
      ...options
    });
    
    // Jouer le son de notification
    playNotificationSound();
    
    return true;
  } catch (error) {
    console.error('Erreur lors de l\'affichage de la notification:', error);
    return false;
  }
};