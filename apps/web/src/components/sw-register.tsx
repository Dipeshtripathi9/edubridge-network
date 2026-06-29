'use client';

import { useEffect } from 'react';

// Registers the service worker in production so the app shell & static assets are
// cached on-device — fast repeat loads and basic offline support on low bandwidth.
// Disabled in dev (a cached SW would fight HMR).
export function ServiceWorkerRegister() {
  useEffect(() => {
    if (process.env.NODE_ENV !== 'production') return;
    if (typeof navigator === 'undefined' || !('serviceWorker' in navigator)) return;
    const onLoad = () => navigator.serviceWorker.register('/sw.js').catch(() => {});
    window.addEventListener('load', onLoad);
    return () => window.removeEventListener('load', onLoad);
  }, []);
  return null;
}
