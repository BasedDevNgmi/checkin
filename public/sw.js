const CACHE = "inchecken-v3";

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => {
      return cache.addAll(["/", "/login"]);
    })
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
      fetch(event.request).catch(async () => {
        const cachedHome = await caches.match("/");
        return cachedHome ?? new Response("Offline", { status: 503 });
      })
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
    fetch(event.request)
      .then((res) => {
        if (!res.ok) {
          return res;
        }
        const clone = res.clone();
        caches.open(CACHE).then((cache) => cache.put(event.request, clone));
        return res;
      })
      .catch(async () => {
        const cached = await caches.match(event.request);
        if (cached) return cached;
        return caches.match("/");
      })
  );
});
