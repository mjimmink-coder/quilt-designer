// Quilt Designer service worker.
//
// This app updates frequently, so the usual "cache everything aggressively"
// PWA pattern would be a bad fit here — it risks installed users getting
// stuck on a stale version after a real update ships. Instead this uses a
// network-first strategy: always try to fetch the latest version first, and
// only fall back to a cached copy if the network request genuinely fails
// (offline). skipWaiting() and clients.claim() make sure a new service
// worker (and therefore a new deployment) takes over as fast as possible,
// rather than waiting for every open tab to be closed first.

const CACHE_NAME = 'quilt-designer-v1';
const OFFLINE_FALLBACK_URL = '/';

self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        const responseClone = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, responseClone));
        return response;
      })
      .catch(() =>
        caches.match(event.request).then((cached) => cached || caches.match(OFFLINE_FALLBACK_URL))
      )
  );
});
