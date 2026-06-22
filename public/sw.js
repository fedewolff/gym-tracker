const CACHE_NAME = "gym-fede-v2026-06-22-1";
const appScope = new URL(self.registration.scope);
const APP_SHELL = [
  appScope.pathname,
  new URL("manifest.webmanifest", appScope).pathname,
  new URL("icon.svg", appScope).pathname,
];

const cacheResponse = async (cacheKey, response) => {
  const cacheUrl = new URL(typeof cacheKey === "string" ? cacheKey : cacheKey.url, self.location.origin);

  if (!response || !response.ok || cacheUrl.origin !== self.location.origin) {
    return response;
  }

  const cache = await caches.open(CACHE_NAME);
  await cache.put(cacheKey, response.clone());
  return response;
};

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL)).then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))))
      .then(() => self.clients.claim())
      .then(() => self.clients.matchAll({ type: "window" }))
      .then((clients) => {
        for (const client of clients) {
          const clientUrl = new URL(client.url);
          if (clientUrl.origin === self.location.origin && clientUrl.pathname.startsWith(appScope.pathname)) {
            client.navigate(client.url);
          }
        }
      }),
  );
});

self.addEventListener("message", (event) => {
  if (event.data?.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  const requestUrl = new URL(event.request.url);
  const isSameOrigin = requestUrl.origin === self.location.origin;
  const isNavigation =
    event.request.mode === "navigate" || event.request.headers.get("accept")?.includes("text/html");

  if (isNavigation) {
    event.respondWith(
      fetch(event.request)
        .then((response) => cacheResponse(appScope.pathname, response))
        .catch(() => caches.match(appScope.pathname)),
    );
    return;
  }

  if (!isSameOrigin || !requestUrl.pathname.startsWith(appScope.pathname)) {
    event.respondWith(fetch(event.request));
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;
      return fetch(event.request)
        .then((response) => cacheResponse(event.request, response))
        .catch(() => caches.match(appScope.pathname));
    }),
  );
});
