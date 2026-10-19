// Service Worker: hält alle App-Dateien offline vor.
// Bei jeder neuen Version VERSION hochzählen — dann lädt die App beim
// nächsten Öffnen die neuen Dateien und räumt den alten Zwischenspeicher weg.
const VERSION = "v9";
const CACHE = `cn-karten-${VERSION}`;
const FILES = [
  "./",
  "./index.html",
  "./decks.js",
  "./decks-en.js",
  "./decks-a2.js",
  "./curriculum.js",
  "./curriculum-a2.js",
  "./trad2simp.js",
  "./hanzi-data.js",
  "./hanzi-meta.js",
  "./dict.js",
  "./lib/hanzi-writer.min.js",
  "./manifest.json",
  "./icons/icon-180.png",
  "./icons/icon-192.png",
  "./icons/icon-512.png"
];

self.addEventListener("install", event => {
  event.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k.startsWith("cn-karten-") && k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// Erst aus dem Zwischenspeicher, sonst aus dem Netz (und dann merken).
self.addEventListener("fetch", event => {
  const req = event.request;
  if (req.method !== "GET" || new URL(req.url).origin !== location.origin) return;
  event.respondWith(
    caches.match(req, { ignoreSearch: true }).then(hit => hit || fetch(req).then(res => {
      if (res.ok) {
        const copy = res.clone();
        caches.open(CACHE).then(c => c.put(req, copy));
      }
      return res;
    }))
  );
});
