const CACHE_NAME = "slavikus-sport-v10010";

const APP_SHELL = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./src/main.js",
  "./src/styles.css",
  "./src/assets/auth-background.png",
  "./src/assets/auth-logo.png",
  "./src/assets/crown-icon.png",
  "./src/assets/main-hero-bg.png",
  "./src/assets/pwa-icon-192.png",
  "./src/assets/pwa-icon-512.png"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(
      keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
    ))
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  event.respondWith(
    fetch(event.request).then((response) => {
      const copy = response.clone();
      caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
      return response;
    }).catch(() => (
      caches.match(event.request).then((cached) => {
        if (cached) return cached;
        return caches.match("./index.html");
      })
    ))
  );
});

self.addEventListener("message", (event) => {
  if (event.data?.type === "SKIP_WAITING") self.skipWaiting();
});
