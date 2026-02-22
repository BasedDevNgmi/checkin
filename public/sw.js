const CACHE = "inchecken-v4";
const APP_SHELL_ROUTES = ["/", "/login"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE)
      .then((cache) => cache.addAll(APP_SHELL_ROUTES))
      .catch(() => {})
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))
      )
  ));
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;
  if (url.pathname.startsWith("/api/") || url.pathname.startsWith("/auth/")) return;
  if (event.request.mode === "navigate") {
    event.respondWith(
      (async () => {
        try {
          const response = await fetch(event.request);
          if (response.ok) {
            const cache = await caches.open(CACHE);
            cache.put(event.request, response.clone());
          }
          return response;
        } catch {
          const cachedPage = await caches.match(event.request);
          if (cachedPage) return cachedPage;
          const cachedHome = await caches.match("/");
          return (
            cachedHome ??
            new Response("Offline", {
              status: 503,
              headers: { "Content-Type": "text/plain; charset=utf-8" },
            })
          );
        }
      })()
    );
    return;
  }

  const destination = event.request.destination;
  const isStaticAsset =
    destination === "style" ||
    destination === "script" ||
    destination === "font" ||
    destination === "image";
  if (!isStaticAsset) return;

  event.respondWith(
    (async () => {
      const cached = await caches.match(event.request);
      if (cached) return cached;

      try {
        const response = await fetch(event.request);
        if (response.ok) {
          const cache = await caches.open(CACHE);
          cache.put(event.request, response.clone());
        }
        return response;
      } catch {
        // Never return HTML fallback for JS/CSS/image/font requests.
        // Doing so can break hydration and leave the app on a skeleton.
        return Response.error();
      }
    })()
  );
});
