/* Keeps the app openable without reception.
   Network first (so updates arrive as soon as there is a connection), cached copy when offline.
   Live data (Firestore) and the version check never go through the cache.

   Each file of the site is kept once, under its address without the "?v=…" stamp, so the copy
   used offline is always the newest one that was downloaded. (Keeping one copy per version let
   an old app.js be served with a new index.html, which showed an old, half-working screen.) */
const CACHE = "trip-split-v2";
const CORE = ["./", "app.js", "fx.js", "theme.js", "config.js", "manifest.json", "icon-192.png", "apple-touch-icon.png"];

const keyOf = req => {
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return req;
  /* every page of the app is the same index.html */
  if (req.mode === "navigate" || url.pathname.endsWith("/") || url.pathname.endsWith("/index.html")) return new URL("./", self.location).href;
  return url.origin + url.pathname;
};

self.addEventListener("install", e => {
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE).then(c => Promise.all(CORE.map(p =>
    fetch(new Request(p, { cache: "reload" })).then(r => r.ok ? c.put(new URL(p, self.location).href, r) : null).catch(() => null)
  ))));
});
self.addEventListener("activate", e => e.waitUntil((async () => {
  for (const k of await caches.keys()) if (k !== CACHE) await caches.delete(k);
  await self.clients.claim();
})()));

self.addEventListener("fetch", e => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.pathname.endsWith("/version.json") || url.pathname.endsWith("/sw.js")) return;
  if (/firestore\.googleapis\.com|googleapis\.com\/google\.firestore|ntfy\.sh/.test(url.href)) return;

  const key = keyOf(req);
  e.respondWith(
    fetch(req)
      .then(res => {
        if (res && (res.ok || res.type === "opaque")) {
          const copy = res.clone();
          caches.open(CACHE).then(c => c.put(key, copy)).catch(() => {});
        }
        return res;
      })
      .catch(async () => (await caches.match(key)) || Response.error())
  );
});
