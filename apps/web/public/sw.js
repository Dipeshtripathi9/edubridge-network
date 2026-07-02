/* EduBridge service worker — lets the app open and run on a poor or absent
   connection by serving the app shell from the device.

   Safe-by-design to avoid the stale-chunk bug the old SW had:
   - HTML / navigations → NETWORK-FIRST. When online you always get the freshest
     page (so it never points at chunks that no longer exist); the cache is only a
     fallback when the network fails.
   - /_next/static/ build assets → CACHE-FIRST. These filenames are content-hashed,
     so a cached copy is never stale.
   - Images → stale-while-revalidate.
   - Cross-origin (the API) and everything else → passthrough (the app's persisted
     React Query cache handles API data offline). */

const VERSION = 'v3';
const STATIC_CACHE = `ebd-static-${VERSION}`;
const PAGE_CACHE = `ebd-pages-${VERSION}`;
const IMG_CACHE = `ebd-img-${VERSION}`;
const CURRENT = [STATIC_CACHE, PAGE_CACHE, IMG_CACHE];

self.addEventListener('install', () => self.skipWaiting());

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      // Drop caches from previous versions.
      const keys = await caches.keys();
      await Promise.all(keys.filter((k) => !CURRENT.includes(k)).map((k) => caches.delete(k)));
      await self.clients.claim();
    })(),
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;

  let url;
  try {
    url = new URL(req.url);
  } catch {
    return;
  }

  // Only ever handle same-origin requests. The API lives on another origin and is
  // covered by the app's persisted query cache — never touch it here.
  if (url.origin !== self.location.origin) return;

  // Content-hashed build assets: cache-first (immutable, can't go stale).
  if (url.pathname.startsWith('/_next/static/')) {
    event.respondWith(cacheFirst(req, STATIC_CACHE));
    return;
  }

  // Images: serve cached instantly, refresh in the background.
  if (req.destination === 'image') {
    event.respondWith(staleWhileRevalidate(req, IMG_CACHE));
    return;
  }

  // Page navigations: network-first with a cached fallback for offline.
  if (req.mode === 'navigate') {
    event.respondWith(networkFirst(req, PAGE_CACHE));
    return;
  }
});

async function cacheFirst(req, cacheName) {
  const cache = await caches.open(cacheName);
  const hit = await cache.match(req);
  if (hit) return hit;
  const res = await fetch(req);
  if (res.ok) cache.put(req, res.clone());
  return res;
}

async function staleWhileRevalidate(req, cacheName) {
  const cache = await caches.open(cacheName);
  const hit = await cache.match(req);
  const network = fetch(req)
    .then((res) => {
      if (res.ok) cache.put(req, res.clone());
      return res;
    })
    .catch(() => hit);
  return hit || network;
}

async function networkFirst(req, cacheName) {
  const cache = await caches.open(cacheName);
  try {
    const res = await fetch(req);
    if (res.ok) cache.put(req, res.clone());
    return res;
  } catch {
    const hit = await cache.match(req);
    if (hit) return hit;
    // Last resort: the dashboard shell, which the app hydrates from cached data.
    const home = await cache.match('/home');
    if (home) return home;
    throw new Error('offline: no cached page');
  }
}
