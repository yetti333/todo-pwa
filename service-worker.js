const CACHE_NAME = "todo-cache-v1";
const urlsToCache = [
  "/",
  "/index.html",
  "/app.js",
  "/style.css",
  "/manifest.json",
  "/icon-100.png",
  "/icon-375.png"
];

// Instalace: uložení souborů do cache
self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(urlsToCache);
    })
  );
});

// Aktivace: odstranění starých verzí cache
self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
      )
    )
  );
});

// Fetch: obsluha požadavků – nejdřív cache, pak síť
self.addEventListener("fetch", event => {
  console.log("Fetching:", event.request.url);
  event.respondWith(
    caches.match(event.request).then(response => {
      if (response) {
        console.log("Serving from cache:", event.request.url);
        return response;
      }
      console.log("Fetching from network:", event.request.url);
      return fetch(event.request);
    })
  );
});