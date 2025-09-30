import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Auto-récupération en cas d'erreur de chunks/dynamic import due au cache SW
if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
  const selfHeal = () => {
    navigator.serviceWorker
      .getRegistrations()
      .then((regs) => Promise.all(regs.map((r) => r.unregister())))
      .catch(() => {})
      .finally(() => {
        const doReload = () => window.location.reload();
        try {
          if ('caches' in globalThis) {
            (caches as CacheStorage)
              .keys()
              .then((keys) => Promise.all(keys.map((k) => caches.delete(k))))
              .catch(() => {})
              .finally(doReload);
          } else {
            doReload();
          }
        } catch {
          doReload();
        }
      });
  };
  window.addEventListener('error', (e: ErrorEvent) => {
    const msg = String(e?.message || '').toLowerCase();
    // Handle chunk loading errors and React hook errors (indicates stale cache)
    if (msg.includes('failed to fetch dynamically imported module') || 
        (msg.includes('chunk') && msg.includes('loading')) ||
        msg.includes('cannot read properties of null') ||
        msg.includes('invalid hook call')) {
      selfHeal();
    }
  });

  window.addEventListener('unhandledrejection', (e: PromiseRejectionEvent) => {
    const reason = String((e?.reason && (e.reason.message || e.reason)) || '').toLowerCase();
    if (reason.includes('failed to fetch dynamically imported module') || 
        (reason.includes('chunk') && reason.includes('loading')) ||
        reason.includes('cannot read properties of null') ||
        reason.includes('invalid hook call')) {
      selfHeal();
    }
  });
}

createRoot(document.getElementById("root")!).render(<App />);
