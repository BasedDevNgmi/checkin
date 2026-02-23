const VERSION = "v7";
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
    (async () => {
      const keys = await caches.keys();
      await Promise.all(
        keys
          .filter((key) => ![APP_SHELL_CACHE, ASSET_CACHE].includes(key))
          .map((key) => caches.delete(key))
      );
      if (self.registration.navigationPreload) {
        await self.registration.navigationPreload.enable();
      }
    })()
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

async function staleWhileRevalidate(request, event) {
  const cache = await caches.open(ASSET_CACHE);
  const cached = await cache.match(request);

  const refreshPromise = fetch(request)
    .then(async (response) => {
      if (response.ok) {
        await cache.put(request, response.clone());
        await trimCache(ASSET_CACHE, ASSET_MAX_ENTRIES);
      }
      return response;
    })
    .catch(() => null);

  if (cached) {
    event.waitUntil(refreshPromise);
    return cached;
  }

  const fresh = await refreshPromise;
  return fresh ?? Response.error();
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
          const preload = await event.preloadResponse;
          if (preload) return preload;
          return await fetch(event.request);
        } catch {
          const cachedPage = await caches.match(event.request);
          if (cachedPage) return cachedPage;
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

  event.respondWith(staleWhileRevalidate(event.request, event));
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
