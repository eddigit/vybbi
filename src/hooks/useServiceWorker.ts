import { useEffect, useState } from 'react';

export function useServiceWorker() {
  const [isSupported, setIsSupported] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null);

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      setIsSupported(true);
      registerServiceWorker();
    }
  }, []);

  const registerServiceWorker = async () => {
    try {
      const reg = await navigator.serviceWorker.register('/sw.js');
      console.log('[SW] Service worker registered:', reg);
      setRegistration(reg);
      setIsRegistered(true);

      // Check for updates
      reg.addEventListener('updatefound', () => {
        const newWorker = reg.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              console.log('[SW] New service worker available');
              setUpdateAvailable(true);
            }
          });
        }
      });

      // Listen for messages from service worker
      navigator.serviceWorker.addEventListener('message', (event) => {
        console.log('[SW] Message from service worker:', event.data);
        
        if (event.data && event.data.type === 'NOTIFICATION_CLICK') {
          // Handle navigation from notification click
          window.location.href = event.data.url;
        }
      });

    } catch (error) {
      console.error('[SW] Service worker registration failed:', error);
    }
  };

  const updateServiceWorker = () => {
    if (registration && registration.waiting) {
      registration.waiting.postMessage({ type: 'SKIP_WAITING' });
      window.location.reload();
    }
  };

  const requestNotificationPermission = async (): Promise<boolean> => {
    if (!('Notification' in window)) {
      console.warn('[SW] This browser does not support notifications');
      return false;
    }

    if (Notification.permission === 'granted') {
      return true;
    }

    if (Notification.permission === 'denied') {
      console.warn('[SW] Notification permission denied');
      return false;
    }

    try {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    } catch (error) {
      console.error('[SW] Error requesting notification permission:', error);
      return false;
    }
  };

  const subscribeToPushNotifications = async (): Promise<PushSubscription | null> => {
    if (!registration) {
      console.warn('[SW] Service worker not registered');
      return null;
    }

    try {
      const permission = await requestNotificationPermission();
      if (!permission) {
        return null;
      }

      // Generate VAPID key for push notifications (in production, this should be from your server)
      const vapidPublicKey = 'your-vapid-public-key'; // Replace with actual VAPID key
      
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: vapidPublicKey
      });

      console.log('[SW] Push subscription created:', subscription);
      return subscription;
    } catch (error) {
      console.error('[SW] Error subscribing to push notifications:', error);
      return null;
    }
  };

  const showNotification = (title: string, options?: NotificationOptions) => {
    if (!registration) {
      console.warn('[SW] Service worker not registered');
      return;
    }

    if (Notification.permission !== 'granted') {
      console.warn('[SW] Notification permission not granted');
      return;
    }

    registration.showNotification(title, {
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      requireInteraction: false,
      ...options
    });
  };

  return {
    isSupported,
    isRegistered,
    updateAvailable,
    registration,
    updateServiceWorker,
    requestNotificationPermission,
    subscribeToPushNotifications,
    showNotification
  };
}