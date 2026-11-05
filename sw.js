/* Keeps the app openable without reception.
   Network first (so updates arrive as soon as there is a connection), cached copy when offline.
   Live data (Firestore) and the version check never go through the cache. */
const CACHE = "trip-split-v1";

self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", e => e.waitUntil(self.clients.claim()));

self.addEventListener("fetch", e => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.pathname.endsWith("/version.json")) return;
  if (/firestore\.googleapis\.com|googleapis\.com\/google\.firestore|ntfy\.sh/.test(url.href)) return;

  const sameOrigin = url.origin === self.location.origin;
  e.respondWith(
    fetch(req)
      .then(res => {
        if (res && (res.ok || res.type === "opaque")) {
          const copy = res.clone();
          caches.open(CACHE).then(c => c.put(req, copy)).catch(() => {});
        }
        return res;
      })
      .catch(async () => {
        const hit = await caches.match(req, { ignoreSearch: sameOrigin });
        if (hit) return hit;
        if (req.mode === "navigate") return (await caches.match("./index.html", { ignoreSearch: true })) || (await caches.match("./", { ignoreSearch: true }));
        return Response.error();
      })
  );
});
