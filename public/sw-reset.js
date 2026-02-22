(function () {
  if (typeof window === "undefined" || !("serviceWorker" in navigator)) return;

  var meta = document.querySelector('meta[name="inchecken-sw-enabled"]');
  var swEnabled = meta && meta.getAttribute("content") === "true";
  if (swEnabled) return;

  var reloadKey = "inchecken-sw-reset-reload-once";

  Promise.all([
    navigator.serviceWorker.getRegistrations().then(function (registrations) {
      return Promise.all(
        registrations.map(function (registration) {
          return registration.unregister();
        })
      );
    }),
    "caches" in window
      ? caches.keys().then(function (keys) {
          return Promise.all(
            keys
              .filter(function (key) {
                return key.indexOf("inchecken-") === 0 || key.indexOf("workbox") === 0;
              })
              .map(function (key) {
                return caches.delete(key);
              })
          );
        })
      : Promise.resolve(),
  ]).finally(function () {
    if (!sessionStorage.getItem(reloadKey)) {
      sessionStorage.setItem(reloadKey, "1");
      window.location.reload();
    }
  });
})();
