const VERSION = "v6";
const APP_SHELL_CACHE = `inchecken-shell-${VERSION}`;
const ASSET_CACHE = `inchecken-assets-${VERSION}`;
const APP_SHELL_ROUTES = ["/offline", "/login"];
const ASSET_MAX_ENTRIES = 80;

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(APP_SHELL_CACHE).then(async (cache) => {
      await Promise.allSettled(APP_SHELL_ROUTES.map((route) => cache.add(route)));
    })
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => ![APP_SHELL_CACHE, ASSET_CACHE].includes(key))
          .map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});

async function trimCache(cacheName, maxEntries) {
  const cache = await caches.open(cacheName);
  const keys = await cache.keys();
  if (keys.length <= maxEntries) return;
  await Promise.all(keys.slice(0, keys.length - maxEntries).map((key) => cache.delete(key)));
}

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;
  if (url.pathname.startsWith("/api/") || url.pathname.startsWith("/auth/")) return;
  if (event.request.mode === "navigate") {
    event.respondWith(
      (async () => {
        try {
          return await fetch(event.request);
        } catch {
          const offlinePage = await caches.match("/offline");
          return offlinePage ?? new Response("Offline", { status: 503 });
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
          const cache = await caches.open(ASSET_CACHE);
          cache.put(event.request, response.clone());
          await trimCache(ASSET_CACHE, ASSET_MAX_ENTRIES);
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

self.addEventListener("push", (event) => {
  const fallbackPayload = {
    title: "Inchecken",
    body: "Tijd voor je dagelijkse check-in.",
    url: "/checkin",
  };

  let payload = fallbackPayload;
  if (event.data) {
    try {
      payload = event.data.json();
    } catch {
      payload = fallbackPayload;
    }
  }
  event.waitUntil(
    self.registration.showNotification(payload.title ?? fallbackPayload.title, {
      body: payload.body ?? fallbackPayload.body,
      icon: "/icon-192.svg",
      badge: "/icon-192.svg",
      data: { url: payload.url ?? fallbackPayload.url },
    })
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clients) => {
      const targetUrl = event.notification.data?.url || "/dashboard";
      for (const client of clients) {
        if ("focus" in client) {
          client.navigate(targetUrl);
          return client.focus();
        }
      }
      return self.clients.openWindow(targetUrl);
    })
  );
});

self.addEventListener("sync", (event) => {
  if (event.tag !== "checkin-sync") return;
  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clients) =>
      Promise.all(clients.map((client) => client.postMessage({ type: "FLUSH_CHECKIN_QUEUE" })))
    )
  );
});
