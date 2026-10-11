// Makes the site installable and opens it fast. The page and its settings come from the network
// first (so updates show straight away) and from the saved copy when offline; icons come from the
// saved copy and are refreshed in the background.
const CACHE = 'finance-site-v5';
const SHELL = ['./', 'index.html', 'config.js', 'manifest.webmanifest', 'icon-192.png', 'icon-512.png', 'favicon.png'];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
    .then(() => self.clients.claim()));
});
const save = (req, res) => { if (res.ok) { const copy = res.clone(); caches.open(CACHE).then((c) => c.put(req, copy)); } return res; };
self.addEventListener('fetch', (e) => {
  const req = e.request, url = new URL(req.url);
  if (req.method !== 'GET' || url.origin !== location.origin) return; // the apps themselves always go to Google
  const net = fetch(req).then((res) => save(req, res));
  if (/\.(png|ico|svg|webp)$/.test(url.pathname)) {
    e.respondWith(caches.match(req).then((hit) => { if (hit) { e.waitUntil(net.catch(() => {})); return hit; } return net; }));
    return;
  }
  e.respondWith(net.catch(() => caches.match(req).then((r) => r || caches.match('index.html'))));
});
