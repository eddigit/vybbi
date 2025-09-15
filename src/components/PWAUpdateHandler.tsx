import { usePWAUpdate } from '@/hooks/usePWAUpdate';
import { PWAUpdateNotification } from './PWAUpdateNotification';

export function PWAUpdateHandler() {
  const { needRefresh, updateSW, dismissUpdate } = usePWAUpdate();
  
  return (
    <PWAUpdateNotification 
      needRefresh={needRefresh}
      updateSW={updateSW}
      onDismiss={dismissUpdate}
    />
  );
}