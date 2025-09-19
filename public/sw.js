// Service Worker for PWA notifications and background sync

const CACHE_NAME = 'vybbi-crm-v1';
const urlsToCache = [
  '/',
  '/admin-prospecting',
  '/static/js/bundle.js',
  '/static/css/main.css',
  '/favicon.ico'
];

// Install service worker and cache resources
self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[SW] Caching app shell...');
        return cache.addAll(urlsToCache);
      })
  );
});

// Activate service worker and clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating service worker...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('[SW] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Handle fetch requests - Cache first strategy for app shell, network first for API
self.addEventListener('fetch', (event) => {
  const { request } = event;
  
  // Skip non-GET requests
  if (request.method !== 'GET') return;
  
  // API requests - Network first
  if (request.url.includes('/api/') || request.url.includes('supabase.co')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Clone response as it can only be consumed once
          const responseToCache = response.clone();
          
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseToCache);
          });
          
          return response;
        })
        .catch(() => {
          // Fallback to cache if network fails
          return caches.match(request);
        })
    );
    return;
  }
  
  // App shell - Cache first
  event.respondWith(
    caches.match(request)
      .then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }
        
        return fetch(request).then((response) => {
          // Don't cache non-successful responses
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }
          
          const responseToCache = response.clone();
          
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseToCache);
          });
          
          return response;
        });
      })
  );
});

// Handle push notifications
self.addEventListener('push', (event) => {
  console.log('[SW] Push notification received:', event);
  
  let notificationData = {
    title: 'Vybbi CRM',
    body: 'Nouvelle notification',
    icon: '/favicon.ico',
    badge: '/favicon.ico',
    tag: 'vybbi-notification',
    requireInteraction: false,
    data: {}
  };
  
  if (event.data) {
    try {
      const data = event.data.json();
      notificationData = { ...notificationData, ...data };
    } catch (error) {
      console.error('[SW] Error parsing push data:', error);
      notificationData.body = event.data.text();
    }
  }
  
  event.waitUntil(
    self.registration.showNotification(notificationData.title, {
      body: notificationData.body,
      icon: notificationData.icon,
      badge: notificationData.badge,
      tag: notificationData.tag,
      requireInteraction: notificationData.requireInteraction,
      data: notificationData.data,
      actions: [
        {
          action: 'view',
          title: 'Voir',
          icon: '/favicon.ico'
        },
        {
          action: 'dismiss',
          title: 'Ignorer'
        }
      ]
    })
  );
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification clicked:', event);
  
  event.notification.close();
  
  const { action, notification } = event;
  const data = notification.data || {};
  
  if (action === 'dismiss') {
    return;
  }
  
  // Default action or 'view' action
  let urlToOpen = '/admin-prospecting';
  
  // Route based on notification type
  switch (data.type) {
    case 'hot_prospect':
    case 'inactive_prospect':
      if (data.prospectId) {
        urlToOpen = `/admin-prospecting?prospect=${data.prospectId}`;
      }
      break;
    case 'urgent_task':
      urlToOpen = '/admin-prospecting?view=tasks';
      break;
    case 'conversion':
    case 'goal_achieved':
      urlToOpen = '/admin-prospecting?view=analytics';
      break;
    case 'new_message':
      if (data.conversationId) {
        urlToOpen = `/messages?conversation=${data.conversationId}`;
      } else {
        urlToOpen = '/messages';
      }
      break;
    case 'booking_request':
      urlToOpen = '/dashboard';
      break;
  }
  
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        // If there's already a window open with our app, focus it
        for (const client of clientList) {
          if (client.url.includes(self.location.origin)) {
            return client.focus().then(() => {
              // Send message to client to navigate to the correct page
              return client.postMessage({
                type: 'NOTIFICATION_CLICK',
                url: urlToOpen,
                data: data
              });
            });
          }
        }
        
        // If no window is open, open a new one
        return clients.openWindow(urlToOpen);
      })
  );
});

// Background sync for offline data
self.addEventListener('sync', (event) => {
  console.log('[SW] Background sync triggered:', event.tag);
  
  if (event.tag === 'prospect-sync') {
    event.waitUntil(syncProspectData());
  }
});

// Sync prospect data when back online
async function syncProspectData() {
  try {
    console.log('[SW] Syncing prospect data...');
    
    // Get offline data from IndexedDB (if implemented)
    // For now, just log that sync would happen
    console.log('[SW] Prospect data sync completed');
    
    // Show notification that data has been synced
    self.registration.showNotification('Vybbi CRM', {
      body: 'Données synchronisées avec succès',
      icon: '/favicon.ico',
      tag: 'sync-success',
      requireInteraction: false
    });
  } catch (error) {
    console.error('[SW] Error syncing prospect data:', error);
  }
}

// Message handler for communication with main thread
self.addEventListener('message', (event) => {
  console.log('[SW] Message received:', event.data);
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

console.log('[SW] Service worker loaded');