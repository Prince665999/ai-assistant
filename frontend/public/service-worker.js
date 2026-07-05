// Simple service worker for PWA
const CACHE_NAME = "ai-assistant-shell-v1";
const SHELL_ASSETS = [
  "/",
  "/index.html",
  "/manifest.json",
  "/favicon.ico",
];

// Install event - cache the shell
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(SHELL_ASSETS).catch((err) => {
        console.log("Cache addAll error:", err);
      });
    })
  );
  self.skipWaiting();
});

// Activate event - clean old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      );
    })
  );
  self.clients.claim();
});

// Fetch event - serve from cache if available
self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);
  
  // Skip API calls
  if (url.pathname.startsWith("/api/") || url.pathname.includes("auth")) {
    return;
  }
  
  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;
      return fetch(event.request)
        .then((response) => {
          if (response && response.status === 200) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, clone);
            });
          }
          return response;
        })
        .catch(() => {
          return caches.match("/index.html");
        });
    })
  );
});