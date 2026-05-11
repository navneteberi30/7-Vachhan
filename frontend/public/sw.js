/**
 * Minimal service worker so browsers treat the site as installable (manifest + active SW).
 * Pass-through fetch; no offline cache (keeps behavior identical to a normal SPA).
 */
self.addEventListener('install', (event) => {
  event.waitUntil(self.skipWaiting())
})

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim())
})

self.addEventListener('fetch', (event) => {
  event.respondWith(fetch(event.request))
})
