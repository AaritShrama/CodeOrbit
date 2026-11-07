/**
 * CODEORBIT — OFFLINE SUPPORT (service worker)
 * Lets CodeOrbit open without internet once it has been opened online, and lets
 * it be installed as an app (see docs/DECISIONS.md D-024).
 *
 * Strategy: NETWORK FIRST. Online, every request goes to the network as usual,
 * so a new deploy is used straight away; each good response also refreshes the
 * cache. Offline, the cached copy is used. Your data is in localStorage and is
 * never touched here.
 *
 * When you add a file the app needs, add it to APP_FILES (a test checks this),
 * and bump CACHE_VERSION when you remove or rename one.
 */

const CACHE_VERSION = 'codeorbit-v2';

const APP_FILES = [
  './',
  'index.html',
  'manifest.webmanifest',
  'assets/css/components.css',
  'assets/css/dashboard.css',
  'assets/css/orbital.css',
  'assets/css/responsive.css',
  'assets/css/style.css',
  'assets/js/achievements.js',
  'assets/js/analytics.js',
  'assets/js/app.js',
  'assets/js/charts.js',
  'assets/js/components.js',
  'assets/js/dashboard.js',
  'assets/js/goals.js',
  'assets/js/icons.js',
  'assets/js/navigation.js',
  'assets/js/progress.js',
  'assets/js/projects.js',
  'assets/js/recap.js',
  'assets/js/settings.js',
  'assets/js/skills.js',
  'assets/js/storage.js',
  'assets/js/utils.js',
  'assets/fonts/inter-latin-var.woff2',
  'assets/fonts/jetbrains-mono-latin-500.woff2',
  'assets/images/apple-touch-icon.png',
  'assets/images/favicon-32.png',
  'assets/images/icon-192.png',
  'assets/images/icon-512.png',
  'assets/images/icon-maskable-512.png',
  'assets/images/letscook-mark-dark.png'
];

// Pinned, SRI-checked libraries from index.html (D-011). Cached as CORS responses,
// so the browser still checks their integrity when they come from the cache.
const CDN_FILES = [
  'https://cdn.jsdelivr.net/npm/chart.js@4.4.7/dist/chart.umd.js',
  'https://cdn.jsdelivr.net/npm/lucide@1.70.0/dist/umd/lucide.min.js'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_VERSION).then(async cache => {
      await cache.addAll(APP_FILES);
      // The libraries are optional for installing: a CDN hiccup must not block offline support.
      await Promise.all(
        CDN_FILES.map(url =>
          cache.add(new Request(url, { mode: 'cors', credentials: 'omit' })).catch(() => {})
        )
      );
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches
      .keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE_VERSION).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  const sameOrigin = url.origin === self.location.origin;
  const isCdn = CDN_FILES.includes(request.url);
  if (!sameOrigin && !isCdn) return; // leave everything else to the browser

  event.respondWith(
    fetch(request)
      .then(response => {
        // Only keep complete, successful copies
        if (response.ok && (response.type === 'basic' || response.type === 'cors')) {
          const copy = response.clone();
          caches.open(CACHE_VERSION).then(cache => cache.put(request, copy));
        }
        return response;
      })
      .catch(async () => {
        const cached = await caches.match(request, { ignoreSearch: sameOrigin });
        if (cached) return cached;
        // Offline and opening a page address we have not cached: show the app.
        if (request.mode === 'navigate') return caches.match('./');
        return Response.error();
      })
  );
});
