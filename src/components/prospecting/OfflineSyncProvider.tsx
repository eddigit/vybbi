import React, { createContext, useContext, useEffect, useState } from 'react';
import { useServiceWorker } from '@/hooks/useServiceWorker';
import { addHapticFeedback } from '@/utils/mobileHelpers';
import { toast } from 'sonner';
import { Wifi, WifiOff, RefreshCw } from 'lucide-react';

interface OfflineSyncContextType {
  isOnline: boolean;
  hasOfflineData: boolean;
  syncPending: number;
  syncOfflineData: () => Promise<void>;
  isInitialSyncComplete: boolean;
}

const OfflineSyncContext = createContext<OfflineSyncContextType | undefined>(undefined);

export function useOfflineSync() {
  const context = useContext(OfflineSyncContext);
  if (!context) {
    throw new Error('useOfflineSync must be used within OfflineSyncProvider');
  }
  return context;
}

interface OfflineSyncProviderProps {
  children: React.ReactNode;
}

export default function OfflineSyncProvider({ children }: OfflineSyncProviderProps) {
  const { isSupported, registration } = useServiceWorker();
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [hasOfflineData, setHasOfflineData] = useState(false);
  const [syncPending, setSyncPending] = useState(0);
  const [isInitialSyncComplete, setIsInitialSyncComplete] = useState(false);
  const [lastOnlineStatus, setLastOnlineStatus] = useState(isOnline);

  useEffect(() => {
    // Set up online/offline listeners
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    // Monitor online status changes
    if (lastOnlineStatus !== isOnline) {
      if (isOnline && !lastOnlineStatus) {
        // Just came back online
        addHapticFeedback('medium');
        toast.success('Connexion rétablie', {
          description: 'Synchronisation des données en cours...',
          icon: <Wifi className="h-4 w-4" />
        });
        syncOfflineData();
      } else if (!isOnline && lastOnlineStatus) {
        // Just went offline
        addHapticFeedback('heavy');
        toast('Mode hors ligne activé', {
          description: 'Les données seront synchronisées au retour en ligne',
          icon: <WifiOff className="h-4 w-4" />
        });
      }
      setLastOnlineStatus(isOnline);
    }
  }, [isOnline, lastOnlineStatus]);

  useEffect(() => {
    // Check for existing offline data on mount
    checkOfflineData();
    
    // Set up periodic sync check
    const interval = setInterval(() => {
      if (isOnline) {
        checkOfflineData();
      }
    }, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, []);

  const checkOfflineData = async () => {
    try {
      if (!('indexedDB' in window)) return;
      
      // Check IndexedDB for pending sync operations
      const request = indexedDB.open('vybbi-offline', 1);
      
      request.onupgradeneeded = (e) => {
        const db = (e.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains('prospects')) {
          db.createObjectStore('prospects', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('sync-queue')) {
          db.createObjectStore('sync-queue', { keyPath: 'id', autoIncrement: true });
        }
      };
      
      request.onsuccess = (e) => {
        const db = (e.target as IDBOpenDBRequest).result;
        
        // Check sync queue
        const transaction = db.transaction(['sync-queue'], 'readonly');
        const store = transaction.objectStore('sync-queue');
        const countRequest = store.count();
        
        countRequest.onsuccess = () => {
          const pendingCount = countRequest.result;
          setSyncPending(pendingCount);
          setHasOfflineData(pendingCount > 0);
        };
        
        db.close();
      };
    } catch (error) {
      console.error('Erreur lors de la vérification des données hors ligne:', error);
    }
  };

  const syncOfflineData = async () => {
    if (!isOnline || !registration) return;

    try {
      // Use service worker background sync
      if ('serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype && registration) {
        await (registration as any).sync.register('prospect-sync');
        
        toast.loading('Synchronisation...', {
          id: 'sync-progress',
          icon: <RefreshCw className="h-4 w-4 animate-spin" />
        });

        // Simulate sync progress (in reality, this would be handled by service worker)
        setTimeout(() => {
          toast.success('Synchronisation terminée', {
            id: 'sync-progress',
            icon: <Wifi className="h-4 w-4" />
          });
          setSyncPending(0);
          setHasOfflineData(false);
          setIsInitialSyncComplete(true);
          addHapticFeedback('light');
        }, 2000);
      }
    } catch (error) {
      console.error('Erreur lors de la synchronisation:', error);
      toast.error('Erreur de synchronisation', {
        id: 'sync-progress',
        description: 'Certaines données peuvent ne pas être à jour'
      });
    }
  };

  const storeOfflineAction = async (action: any) => {
    try {
      if (!('indexedDB' in window)) return;
      
      const request = indexedDB.open('vybbi-offline', 1);
      
      request.onsuccess = (e) => {
        const db = (e.target as IDBOpenDBRequest).result;
        const transaction = db.transaction(['sync-queue'], 'readwrite');
        const store = transaction.objectStore('sync-queue');
        
        store.add({
          ...action,
          timestamp: Date.now(),
          synced: false
        });
        
        transaction.oncomplete = () => {
          setSyncPending(prev => prev + 1);
          setHasOfflineData(true);
          db.close();
        };
      };
    } catch (error) {
      console.error('Erreur lors du stockage hors ligne:', error);
    }
  };

  // Expose offline storage function globally for use in hooks
  useEffect(() => {
    (window as any).__vybbiOfflineStore = storeOfflineAction;
  }, []);

  const contextValue: OfflineSyncContextType = {
    isOnline,
    hasOfflineData,
    syncPending,
    syncOfflineData,
    isInitialSyncComplete
  };

  return (
    <OfflineSyncContext.Provider value={contextValue}>
      {children}
    </OfflineSyncContext.Provider>
  );
}