import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Trash2, RefreshCw, Shield, Database, WifiOff } from 'lucide-react';

export function AdminCacheTools() {
  const queryClient = useQueryClient();
  const [clearReactQuery, setClearReactQuery] = useState(true);
  const [clearLocalStorage, setClearLocalStorage] = useState(true);
  const [clearIndexedDB, setClearIndexedDB] = useState(true);
  const [clearPWACaches, setClearPWACaches] = useState(true);
  const [unregisterSW, setUnregisterSW] = useState(true);
  const [resetAuth, setResetAuth] = useState(false);
  const [reloadAfter, setReloadAfter] = useState(true);
  const [working, setWorking] = useState(false);

  const clearAll = async () => {
    if (working) return;
    setWorking(true);
    toast.info('Nettoyage en cours...');

    try {
      if (clearReactQuery) {
        queryClient.clear();
      }

      if (clearLocalStorage) {
        try {
          localStorage.clear();
          sessionStorage.clear();
        } catch {}
      }

      if (clearIndexedDB) {
        try {
          // Delete all known IndexedDB databases (best effort)
          // @ts-ignore - not supported in all browsers
          const dbs = globalThis.indexedDB?.databases ? await (globalThis.indexedDB as any).databases() : [];
          if (dbs && Array.isArray(dbs)) {
            for (const db of dbs) {
              if (db.name) {
                try { globalThis.indexedDB.deleteDatabase(db.name); } catch {}
              }
            }
          } else {
            // Fallback: try common names
            try { globalThis.indexedDB.deleteDatabase('keyval-store'); } catch {}
            try { globalThis.indexedDB.deleteDatabase('localforage'); } catch {}
          }
        } catch {}
      }

      if (clearPWACaches && 'caches' in globalThis) {
        try {
          const keys = await (caches as CacheStorage).keys();
          await Promise.all(keys.map((k) => (caches as CacheStorage).delete(k)));
        } catch {}
      }

      if (unregisterSW && 'serviceWorker' in navigator) {
        try {
          const regs = await navigator.serviceWorker.getRegistrations();
          await Promise.all(regs.map((r) => r.unregister()));
        } catch {}
      }

      if (resetAuth) {
        try {
          await supabase.auth.signOut();
        } catch {}
      }

      toast.success('Cache vidé avec succès');
    } catch (e) {
      console.error(e);
      toast.error("Erreur lors du nettoyage");
    } finally {
      setWorking(false);
      if (reloadAfter) {
        setTimeout(() => window.location.reload(), 400);
      }
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trash2 className="h-5 w-5" /> Outils de Cache
        </CardTitle>
        <CardDescription>
          Videz les caches applicatifs pour résoudre les problèmes de chargement et de sessions.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="flex items-center justify-between rounded-lg border p-3">
            <div className="flex items-center gap-2">
              <RefreshCw className="h-4 w-4" />
              <Label>Cache React Query</Label>
            </div>
            <Switch checked={clearReactQuery} onCheckedChange={setClearReactQuery} />
          </div>

          <div className="flex items-center justify-between rounded-lg border p-3">
            <div className="flex items-center gap-2">
              <Database className="h-4 w-4" />
              <Label>localStorage & sessionStorage</Label>
            </div>
            <Switch checked={clearLocalStorage} onCheckedChange={setClearLocalStorage} />
          </div>

          <div className="flex items-center justify-between rounded-lg border p-3">
            <div className="flex items-center gap-2">
              <Database className="h-4 w-4" />
              <Label>IndexedDB</Label>
            </div>
            <Switch checked={clearIndexedDB} onCheckedChange={setClearIndexedDB} />
          </div>

          <div className="flex items-center justify-between rounded-lg border p-3">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              <Label>Caches PWA</Label>
            </div>
            <Switch checked={clearPWACaches} onCheckedChange={setClearPWACaches} />
          </div>

          <div className="flex items-center justify-between rounded-lg border p-3">
            <div className="flex items-center gap-2">
              <WifiOff className="h-4 w-4" />
              <Label>Désenregistrer Service Workers</Label>
            </div>
            <Switch checked={unregisterSW} onCheckedChange={setUnregisterSW} />
          </div>

          <div className="flex items-center justify-between rounded-lg border p-3">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              <Label>Réinitialiser l'authentification</Label>
            </div>
            <Switch checked={resetAuth} onCheckedChange={setResetAuth} />
          </div>
        </div>

        <div className="flex items-center justify-between rounded-lg border p-3">
          <Label>Recharger l'application après nettoyage</Label>
          <Switch checked={reloadAfter} onCheckedChange={setReloadAfter} />
        </div>

        <Button onClick={clearAll} disabled={working} className="w-full">
          {working ? 'Nettoyage...' : 'Vider le cache maintenant'}
        </Button>
      </CardContent>
    </Card>
  );
}
