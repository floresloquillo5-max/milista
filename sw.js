const CACHE = 'mi-mercado-v4';
const STATIC_URLS = [
  '/',
  '/index.html',
  '/style.css',
  '/dist/app.js',
  '/manifest.json',
];

self.addEventListener('install', function(event) {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE);
      const results = await Promise.allSettled(
        STATIC_URLS.map(url =>
          cache.add(url).catch(() => {
            // If one asset fails, try with a plain fetch + put
            return fetch(url).then(r => {
              if (r.ok) cache.put(url, r);
            }).catch(() => {});
          })
        )
      );
      self.skipWaiting();
    })()
  );
});

self.addEventListener('activate', function(event) {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(
        keys.filter(k => k !== CACHE).map(k => caches.delete(k))
      );
      await self.clients.claim();
    })()
  );
});

// Network-first for same-origin, with offline fallback to cache
async function networkFirstWithCacheFallback(request) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(CACHE);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    const cached = await caches.match(request);
    if (cached) return cached;
    // Final fallback: serve the cached index.html for any navigation
    if (request.mode === 'navigate') {
      return caches.match('/index.html');
    }
    throw new Error('offline');
  }
}

self.addEventListener('fetch', function(event) {
  const request = event.request;
  const url = new URL(request.url);

  // API/external calls: network-first with cache fallback
  if (url.hostname !== self.location.hostname) {
    event.respondWith(
      fetch(request).then(function(response) {
        var clone = response.clone();
        caches.open(CACHE).then(function(cache) { cache.put(request, clone); });
        return response;
      }).catch(function() {
        return caches.match(request);
      })
    );
    return;
  }

  // For same-origin: use network-first with cache fallback
  // This ensures fresh content when online, and cached content when offline
  event.respondWith(networkFirstWithCacheFallback(request));
});
