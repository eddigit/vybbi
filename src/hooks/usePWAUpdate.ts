import { useEffect, useState } from 'react';

export function usePWAUpdate() {
  const [needRefresh, setNeedRefresh] = useState(false);
  const [updateSW, setUpdateSW] = useState<() => void>(() => {});

  useEffect(() => {
    // Check if browser supports service workers
    if (!('serviceWorker' in navigator)) return;

    const handleSWUpdate = (registration: ServiceWorkerRegistration) => {
      if (registration?.waiting) {
        setNeedRefresh(true);
        setUpdateSW(() => () => {
          registration.waiting?.postMessage({ type: 'SKIP_WAITING' });
          // Don't reload immediately, let the component handle it
        });
      }
    };

    // Listen for controller changes (when new SW takes control)
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      window.location.reload();
    });

    // Register service worker update handler
    navigator.serviceWorker.ready.then((registration) => {
      // Check for waiting service worker
      if (registration.waiting) {
        handleSWUpdate(registration);
      }

      // Listen for new service worker installations
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              handleSWUpdate(registration);
            }
          });
        }
      });
      
      // Check for updates periodically (every 60 seconds when app is active)
      const interval = setInterval(() => {
        registration.update();
      }, 60000);

      return () => {
        clearInterval(interval);
      };
    });

    // Check for updates when app becomes visible
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        navigator.serviceWorker.ready.then((registration) => {
          registration.update();
        });
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  const dismissUpdate = () => {
    setNeedRefresh(false);
  };

  return {
    needRefresh,
    updateSW,
    dismissUpdate
  };
}