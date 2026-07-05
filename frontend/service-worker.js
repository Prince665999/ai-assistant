// service-worker.js
// Simple "cache-first for shell, network-first for everything else" strategy.

const CACHE_NAME = "ai-assistant-shell-v1"; // bump this version to force-refresh caches on new deploys

// Only the app shell — NOT api calls, NOT chat data
const SHELL_ASSETS = [
  "/",
  "/index.html",
  "/manifest.json",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
];

// 1. On install: pre-cache the shell
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(SHELL_ASSETS))
  );
  self.skipWaiting(); // activate new SW immediately instead of waiting for old tabs to close
});

// 2. On activate: clean up old cache versions
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

// 3. On fetch: decide caching strategy per request type
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Never cache API calls — chat/data must always be fresh, or fail loudly
  if (url.pathname.startsWith("/api/")) {
    return; // let it hit the network normally, no interception
  }

  // For the app shell: cache-first, falling back to network
  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;

      return fetch(request)
        .then((response) => {
          // Cache successful shell responses for next time
          if (response.ok) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          }
          return response;
        })
        .catch(() => {
          // Offline and not cached — fall back to the cached index page
          // so the user at least sees the app shell, not a browser error page
          return caches.match("/index.html");
        });
    })
  );
});