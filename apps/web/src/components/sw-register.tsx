'use client';

import { useEffect } from 'react';

// The service worker is disabled: it cached the app shell and caused stale chunks /
// ChunkLoadError. This component now actively removes any registered service worker
// and clears its caches (both dev and prod), self-healing existing users. Low-bandwidth
// support is handled by the persisted React Query cache (localStorage), not a SW.
export function ServiceWorkerRegister() {
  useEffect(() => {
    if (typeof navigator === 'undefined' || !('serviceWorker' in navigator)) return;
    navigator.serviceWorker
      .getRegistrations()
      .then((regs) => regs.forEach((r) => r.unregister()))
      .catch(() => {});
    if (typeof caches !== 'undefined') {
      caches.keys().then((keys) => keys.forEach((k) => caches.delete(k))).catch(() => {});
    }
  }, []);
  return null;
}
