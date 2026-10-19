// Service Worker: hält alle App-Dateien offline vor.
// Bei jeder neuen Version VERSION hochzählen (und APP_VERSION in index.html) —
// dann lädt die App die neuen Dateien und räumt den alten Zwischenspeicher weg.
const VERSION = "v11";
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
// Große, selten geänderte Dateien: aus dem Zwischenspeicher (neu geladen bei neuer VERSION)
const BIG = ["dict.js", "hanzi-data.js", "hanzi-meta.js", "hanzi-writer.min.js", "/icons/"];

self.addEventListener("install", event => {
  // cache: "reload" umgeht den HTTP-Cache, sonst landen evtl. alte Dateien im neuen Speicher
  event.waitUntil(caches.open(CACHE)
    .then(c => c.addAll(FILES.map(f => new Request(f, { cache: "reload" }))))
    .then(() => self.skipWaiting()));
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k.startsWith("cn-karten-") && k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// App-Dateien zuerst frisch aus dem Netz (offline oder nach 3 s aus dem Speicher),
// große Datendateien zuerst aus dem Speicher.
self.addEventListener("fetch", event => {
  const req = event.request;
  const url = new URL(req.url);
  if (req.method !== "GET" || url.origin !== location.origin || url.pathname.endsWith("/sw.js")) return;
  const fromCache = () => caches.match(req, { ignoreSearch: true });
  const fromNet = () => fetch(new Request(req.url, { cache: "no-cache", credentials: "same-origin" })).then(res => {
    if (res.ok) {
      const copy = res.clone();
      caches.open(CACHE).then(c => c.put(req, copy));
    }
    return res;
  });
  if (BIG.some(b => url.pathname.includes(b))) {
    event.respondWith(fromCache().then(hit => hit || fromNet()));
    return;
  }
  event.respondWith(new Promise(resolve => {
    let done = false;
    const finish = res => { if (!done && res) { done = true; resolve(res); } };
    const timer = setTimeout(() => fromCache().then(finish), 3000);
    fromNet()
      .then(res => { clearTimeout(timer); finish(res); })
      .catch(() => { clearTimeout(timer); fromCache().then(hit => { finish(hit); if (!done) { done = true; resolve(Response.error()); } }); });
  }));
});
