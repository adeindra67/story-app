importScripts('https://storage.googleapis.com/workbox-cdn/releases/7.1.0/workbox-sw.js');

if (workbox) {
  // 1. PRECACHING: Ini akan disuntik oleh Vite/Workbox
  workbox.precaching.precacheAndRoute(self.__WB_MANIFEST || []);
  workbox.precaching.cleanupOutdatedCaches();

  // 2. NAVIGATION FALLBACK untuk SPA
  const handler = workbox.precaching.createHandlerBoundToURL('/index.html');
  const navigationRoute = new workbox.routing.NavigationRoute(handler);
  workbox.routing.registerRoute(navigationRoute);

  // 3. RUNTIME CACHING (untuk Google Fonts, API, Gambar, Peta, dll.)
  workbox.routing.registerRoute(
    ({url}) => url.origin === 'https://fonts.googleapis.com' || url.origin === 'https://fonts.gstatic.com',
    new workbox.strategies.StaleWhileRevalidate({ cacheName: 'google-fonts-cache', plugins: [new workbox.expiration.ExpirationPlugin({ maxEntries: 50 })] })
  );
  workbox.routing.registerRoute(
    ({url}) => url.href.startsWith('https://cdnjs.cloudflare.com/ajax/libs/font-awesome'),
    new workbox.strategies.StaleWhileRevalidate({ cacheName: 'font-awesome-cache' })
  );
  workbox.routing.registerRoute(
    ({url}) => url.href.startsWith('https://unpkg.com/leaflet'),
    new workbox.strategies.StaleWhileRevalidate({ cacheName: 'leaflet-cache' })
  );
  workbox.routing.registerRoute(
    ({url}) => url.href.startsWith('https://story-api.dicoding.dev/v1/stories'),
    new workbox.strategies.StaleWhileRevalidate({ cacheName: 'story-api-cache', plugins: [ new workbox.expiration.ExpirationPlugin({ maxEntries: 50, maxAgeSeconds: 30 * 24 * 60 * 60 }) ] })
  );
  workbox.routing.registerRoute(
    ({request}) => request.destination === 'image',
    new workbox.strategies.StaleWhileRevalidate({ cacheName: 'images-cache', plugins: [ new workbox.expiration.ExpirationPlugin({ maxEntries: 60, maxAgeSeconds: 30 * 24 * 60 * 60 }) ] })
  );
  workbox.routing.registerRoute(
    new RegExp('^https://[abc]\\.tile\\.openstreetmap\\.org/'),
    new workbox.strategies.CacheFirst({ cacheName: 'osm-tiles-cache', plugins: [ new workbox.cacheableResponse.CacheableResponsePlugin({ statuses: [0, 200] }), new workbox.expiration.ExpirationPlugin({ maxEntries: 200, maxAgeSeconds: 30 * 24 * 60 * 60 }) ] })
  );

  // 4. PUSH EVENT LISTENER
  self.addEventListener('push', (event) => {
    const data = event.data.json();
    const title = data.title || 'Pesan Baru';
    const options = {
      body: data.options.body || 'Anda memiliki pesan baru.',
      icon: '/images/icons/icon-192x192.png',
      badge: '/images/icons/icon-96x96.png',
    };
    event.waitUntil(self.registration.showNotification(title, options));
  });

}