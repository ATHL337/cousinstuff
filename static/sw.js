/* CousinStuff offline recipe reader: core pages and visited recipes. */
"use strict";
const VERSION = "2026-10-18-pwa-v1";
const APP_CACHE = "cs-app-" + VERSION;
const RUNTIME_CACHE = "cs-runtime-" + VERSION;
const MAX_RUNTIME = 80;
const PRECACHE = [
  "/", "/recipes/", "/recipes/index.json", "/registry/", "/offline.html",
  "/css/site.css", "/css/vault-tec-corp.css",
  "/js/search.js", "/js/registry.js", "/js/nav-compact.js",
  "/js/theme.js", "/js/skin.js", "/js/pwa.js",
  "/manifest.webmanifest", "/icons/icon-192.png", "/icons/icon-512.png",
  "/recipes/vault-88-brahmin-pho-crispy-egg-rolls/",
  "/img/recipes/vault-88-brahmin-pho-crispy-egg-rolls.jpg"
];
self.addEventListener("install", event => {
  event.waitUntil((async () => {
    const cache = await caches.open(APP_CACHE);
    await Promise.all(PRECACHE.map(async path => {
      try {
        const response = await fetch(path, { cache:"reload" });
        if (response.ok) await cache.put(path, response);
      } catch (_) { /* Network may be unavailable during install. */ }
    }));
    await self.skipWaiting();
  })());
});
self.addEventListener("activate", event => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(key => key.startsWith("cs-")
      && key !== APP_CACHE && key !== RUNTIME_CACHE).map(key => caches.delete(key)));
    await self.clients.claim();
  })());
});
async function saveRuntime(request, response) {
  if (!response || !response.ok || response.type === "opaque") return;
  const cache = await caches.open(RUNTIME_CACHE);
  await cache.put(request, response.clone());
  const keys = await cache.keys();
  if (keys.length > MAX_RUNTIME) await cache.delete(keys[0]);
}
async function networkFirst(request, navigation) {
  try {
    const response = await fetch(request);
    if (response.ok) await saveRuntime(request, response);
    return response;
  } catch (_) {
    const cached = await caches.match(request);
    if (cached) return cached;
    if (navigation) return await caches.match("/offline.html") ||
      new Response("Offline. Reconnect to load this recipe.", {
        status:503, headers:{ "Content-Type":"text/plain; charset=utf-8" }
      });
    return Response.error();
  }
}
async function staleWhileRevalidate(request, event) {
  const cached = await caches.match(request);
  const refreshed = fetch(request).then(async response => {
    if (response.ok) await saveRuntime(request, response);
    return response;
  }).catch(() => null);
  if (cached) {
    event.waitUntil(refreshed);
    return cached;
  }
  return (await refreshed) || Response.error();
}
self.addEventListener("fetch", event => {
  const request = event.request;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  if (request.mode === "navigate") {
    event.respondWith(networkFirst(request, true));
    return;
  }
  if (url.pathname.endsWith("/index.json")) {
    event.respondWith(networkFirst(request, false));
    return;
  }
  if (/^\/(css|js|icons|img)\//.test(url.pathname)) {
    event.respondWith(staleWhileRevalidate(request, event));
    return;
  }
  event.respondWith(networkFirst(request, false));
});
