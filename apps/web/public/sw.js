/* Kill switch — the previous EduBridge service worker cached the app shell and
   caused stale chunks / ChunkLoadError. Any browser that still has a SW registered
   will fetch this on update; it clears all caches, unregisters itself, and reloads
   open tabs so they get fresh assets from the network. */
self.addEventListener('install', () => self.skipWaiting());

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      try {
        const keys = await caches.keys();
        await Promise.all(keys.map((k) => caches.delete(k)));
        await self.registration.unregister();
        const clients = await self.clients.matchAll({ type: 'window' });
        clients.forEach((c) => c.navigate(c.url));
      } catch {
        /* best-effort */
      }
    })(),
  );
});

// Never intercept fetches — always go to the network.
