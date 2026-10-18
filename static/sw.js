/* CousinStuff PWA v2 — safe offline caching and network-first navigation. */
"use strict";
const VERSION = "2026-10-18-pwa-v3-approved-icons";
const SHELL = "cs-app-" + VERSION;
const RECENT = "cs-runtime-" + VERSION;
const MAX_RECENT = 80;
const PRECACHE = [
  "/", "/recipes/", "/recipes/index.json", "/registry/", "/tags/", "/tags/soup/",
  "/vault/rads-leaderboard/", "/offline.html",
  "/css/site.css", "/css/vault-tec-corp.css",
  "/js/search.js", "/js/registry.js", "/js/nav-compact.js",
  "/js/theme.js", "/js/skin.js", "/js/pwa.js",
  "/manifest.json", "/icons/icon-192.png", "/icons/icon-512.png",
  "/icons/recipes-shortcut-192.png", "/icons/recipes-shortcut-512.png",
  "/icons/registry-shortcut-192.png", "/icons/registry-shortcut-512.png",
  "/recipes/vault-88-brahmin-pho-crispy-egg-rolls/",
  "/img/recipes/vault-88-brahmin-pho-crispy-egg-rolls.jpg"
];
self.addEventListener("install", event => {
  event.waitUntil((async () => {
    const cache = await caches.open(SHELL);
    await Promise.all(PRECACHE.map(async path => {
      try {
        const response = await fetch(path, { cache: "reload" });
        if (response.ok) await cache.put(path, response);
      } catch (error) {
        // Optional resources are best-effort; a missed tag page must not
        // prevent the application shell from installing.
        console.warn("Precache skipped", path, error);
      }
    }));
    // An offline fallback is essential: fail installation if it could not
    // be cached instead of installing a silently broken offline worker.
    if (!(await cache.match("/offline.html"))) {
      throw new Error("Missing offline fallback during installation");
    }
    await self.skipWaiting();
  })());
});
self.addEventListener("activate", event => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(key => key.startsWith("cs-")
      && key !== SHELL && key !== RECENT).map(key => caches.delete(key)));
    await self.clients.claim();
  })());
});
// Cache errors (including storage quota) must never turn a successful
// network response into a misleading offline page.
async function saveRecent(request, response) {
  if (!response || !response.ok || response.type === "opaque") return;
  try {
    const cache = await caches.open(RECENT);
    await cache.put(request, response);
    const keys = await cache.keys();
    while (keys.length > MAX_RECENT) {
      await cache.delete(keys.shift());
    }
  } catch (error) {
    console.warn("Optional offline save failed", error);
  }
}
async function findCached(request) {
  try {
    const recent = await caches.open(RECENT);
    return await recent.match(request) || await caches.match(request);
  } catch (_) {
    return null;
  }
}
async function networkFirst(event, navigation) {
  const request = event.request;
  try {
    const response = await fetch(request);
    if (response.ok) {
      const saved = response.clone();
      event.waitUntil(saveRecent(request, saved));
    }
    return response;
  } catch (error) {
    const cached = await findCached(request);
    if (cached) return cached;
    if (navigation) {
      return await caches.match("/offline.html") ||
        new Response("Unable to load this page. Please reconnect and retry.", {
          status: 503, headers: { "Content-Type": "text/plain; charset=utf-8" }
        });
    }
    return Response.error();
  }
}
async function staleWhileRevalidate(event) {
  const request = event.request;
  const cached = await findCached(request);
  const refresh = fetch(request).then(response => {
    if (response.ok) {
      const saved = response.clone();
      event.waitUntil(saveRecent(request, saved));
    }
    return response;
  }).catch(() => null);
  if (cached) {
    event.waitUntil(refresh);
    return cached;
  }
  return (await refresh) || Response.error();
}
self.addEventListener("fetch", event => {
  const request = event.request;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  if (request.mode === "navigate") {
    event.respondWith(networkFirst(event, true));
  } else if (url.pathname.endsWith("/index.json")) {
    event.respondWith(networkFirst(event, false));
  } else if (/^\/(css|js|icons|img)\//.test(url.pathname)) {
    event.respondWith(staleWhileRevalidate(event));
  } else {
    event.respondWith(networkFirst(event, false));
  }
});
