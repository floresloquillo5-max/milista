const CACHE = 'finova-v1';
const API_CACHE = 'finova-api-v1';
const BASE = self.location.pathname.replace(/\/sw\.js$/, '');

const STATIC_URLS = [
  BASE + '/index.html',
  BASE + '/style.css',
  BASE + '/dist/app.js',
  BASE + '/manifest.json',
  BASE + '/favicon.png',
  BASE + '/icon.svg',
  BASE + '/icon-192.png',
  BASE + '/icon-512.png',
];

const RATE_API_HOSTS = [
  'pydolarve.org',
  've.dolarapi.com',
  'pydolarvenezuela-api.vercel.app',
];

self.addEventListener('install', function(event) {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE);
      await Promise.allSettled(
        STATIC_URLS.map(url =>
          cache.add(url).catch(() => {})
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
        keys.filter(k => k !== CACHE && k !== API_CACHE).map(k => caches.delete(k))
      );
      await self.clients.claim();
    })()
  );
});

async function staleWhileRevalidate(request) {
  const cache = await caches.open(API_CACHE);
  const cached = await cache.match(request);

  if (cached) {
    fetch(request).then(response => {
      if (response.ok) cache.put(request, response.clone());
    }).catch(() => {});
    return cached;
  }

  try {
    const response = await fetch(request);
    if (response.ok) cache.put(request, response.clone());
    return response;
  } catch {
    return new Response(
      JSON.stringify({ error: 'offline', message: 'No hay conexión para obtener la tasa de cambio' }),
      { status: 503, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

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
    if (request.mode === 'navigate') {
      return caches.match(BASE + '/index.html');
    }
    return new Response('Offline', { status: 503 });
  }
}

self.addEventListener('fetch', function(event) {
  const request = event.request;
  const url = new URL(request.url);

  if (url.hostname !== self.location.hostname) {
    if (RATE_API_HOSTS.includes(url.hostname)) {
      event.respondWith(staleWhileRevalidate(request));
    } else {
      event.respondWith(
        fetch(request).then(function(response) {
          var clone = response.clone();
          caches.open(CACHE).then(function(cache) { cache.put(request, clone); });
          return response;
        }).catch(function() {
          return caches.match(request);
        })
      );
    }
    return;
  }

  event.respondWith(networkFirstWithCacheFallback(request));
});
