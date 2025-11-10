const CACHE_NAME = "todo-pwa-v1";
const FILES_TO_CACHE = [
  "/",
  "/index.html",
  "/style.css",
  "/app.js",
  "/manifest.json",
  "/icons/icon-100.png", // pokud máš ikony
  "/icons/icon-375.png"
];

// Instalace: cache souborů
self.addEventListener("install", event => {
  self.skipWaiting(); // okamžitá aktivace
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(FILES_TO_CACHE);
    })
  );
});

// Aktivace: vyčištění starých cache
self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.map(key => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      )
    )
  );
  self.clients.claim(); // převezme kontrolu nad stránkou
});

// Fetch: obsluha požadavků
self.addEventListener("fetch", event => {
  if (event.request.method !== "GET") return;

  event.respondWith(
    caches.match(event.request).then(cached => {
      return (
        cached ||
        fetch(event.request).catch(() => {
          // fallback pro offline navigaci
          if (event.request.mode === "navigate") {
            return caches.match("/index.html");
          }
        })
      );
    })
  );
});