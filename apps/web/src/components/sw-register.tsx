'use client';

import { useEffect } from 'react';

// Registers the service worker in production so the app shell & static assets are
// cached on-device — fast repeat loads and basic offline support on low bandwidth.
// Disabled in dev (a cached SW would fight HMR).
export function ServiceWorkerRegister() {
  useEffect(() => {
    if (typeof navigator === 'undefined' || !('serviceWorker' in navigator)) return;

    // In development, actively remove any service worker (and its caches) — a SW
    // left over from a production build would serve stale JS chunks and "Empty
    // Cache and Hard Reload" doesn't clear SW caches. This self-heals dev sessions.
    if (process.env.NODE_ENV !== 'production') {
      navigator.serviceWorker.getRegistrations().then((regs) => regs.forEach((r) => r.unregister()));
      if (typeof caches !== 'undefined') {
        caches.keys().then((keys) => keys.forEach((k) => caches.delete(k)));
      }
      return;
    }

    const onLoad = () => navigator.serviceWorker.register('/sw.js').catch(() => {});
    window.addEventListener('load', onLoad);
    return () => window.removeEventListener('load', onLoad);
  }, []);
  return null;
}
