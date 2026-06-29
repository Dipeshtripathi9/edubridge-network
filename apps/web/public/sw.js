/* EduBridge Network service worker — low-bandwidth / offline support.
   - Static assets & hashed chunks: cache-first (immutable).
   - Page navigations: network-first, fall back to cache (and /home offline).
   - Other same-origin GETs (RSC/data): stale-while-revalidate.
   Cross-origin requests (the API) are left to the network + React Query's
   persisted cache. */
const CACHE = 'edubridge-v1';
const STATIC_RE = /\/_next\/static\//;
const ASSET_RE = /\.(?:js|css|woff2?|png|jpe?g|svg|webp|avif|ico|gif)$/;

self.addEventListener('install', () => self.skipWaiting());

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  // Only handle our own origin; let the API (cross-origin) go straight to network.
  if (url.origin !== self.location.origin) return;

  if (STATIC_RE.test(url.pathname) || ASSET_RE.test(url.pathname)) {
    event.respondWith(cacheFirst(request));
    return;
  }
  if (request.mode === 'navigate') {
    event.respondWith(networkFirst(request));
    return;
  }
  event.respondWith(staleWhileRevalidate(request));
});

async function cacheFirst(request) {
  const cache = await caches.open(CACHE);
  const cached = await cache.match(request);
  if (cached) return cached;
  try {
    const res = await fetch(request);
    if (res.ok) cache.put(request, res.clone());
    return res;
  } catch {
    return cached || Response.error();
  }
}

async function networkFirst(request) {
  const cache = await caches.open(CACHE);
  try {
    const res = await fetch(request);
    if (res.ok) cache.put(request, res.clone());
    return res;
  } catch {
    const cached = await cache.match(request);
    return cached || (await cache.match('/home')) || Response.error();
  }
}

async function staleWhileRevalidate(request) {
  const cache = await caches.open(CACHE);
  const cached = await cache.match(request);
  const network = fetch(request)
    .then((res) => {
      if (res.ok) cache.put(request, res.clone());
      return res;
    })
    .catch(() => cached);
  return cached || network;
}
