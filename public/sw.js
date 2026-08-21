// Version erhöhen, wenn sich die vorgehaltenen Dateien ändern – sonst
// behalten bestehende Installationen den alten Cache.
const CACHE_NAME = 'igel-suedtirol-v2';
const BASE_PATH = new URL(self.registration.scope).pathname.replace(/\/$/, '');
const OFFLINE_ROUTES = [
  `${BASE_PATH}/de/offline/`,
  `${BASE_PATH}/it/offline/`,
  `${BASE_PATH}/logo-igelprojekt.png`,
];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(OFFLINE_ROUTES)));
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))),
      ),
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.pathname.startsWith(`${BASE_PATH}/api/`)) return;

  event.respondWith(
    fetch(request)
      .then((response) => {
        const copy = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
        return response;
      })
      .catch(async () => {
        const cached = await caches.match(request);
        if (cached) return cached;
        if (request.mode === 'navigate') {
          return caches.match(
            url.pathname.startsWith(`${BASE_PATH}/it`)
              ? `${BASE_PATH}/it/offline/`
              : `${BASE_PATH}/de/offline/`,
          );
        }
        return Response.error();
      }),
  );
});
