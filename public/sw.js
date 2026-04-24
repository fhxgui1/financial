const CACHE_NAME = 'financial-cache-v1';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
  // Minimal fetch handler to pass PWA installation criteria
  event.respondWith(
    fetch(event.request).catch(() => {
      return new Response('Offline mode not fully implemented yet.', {
        status: 503,
        statusText: 'Service Unavailable',
      });
    })
  );
});
