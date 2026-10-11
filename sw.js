// Makes the site installable and opens it instantly: every file comes from the saved copy straight away
// and is refreshed in the background, so an update shows the next time you open the site.
// (The apps themselves always come fresh from Google.)
const CACHE = 'finance-site-v6';
const SHELL = ['./', 'index.html', 'config.js', 'manifest.webmanifest', 'icon-192.png', 'icon-512.png', 'favicon.png'];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
    .then(() => self.clients.claim()));
});
self.addEventListener('fetch', (e) => {
  const req = e.request, url = new URL(req.url);
  if (req.method !== 'GET' || url.origin !== location.origin) return;
  const net = fetch(req).then((res) => {
    if (!res.ok) return res;
    const copy = res.clone();
    return caches.open(CACHE).then((c) => c.put(req, copy)).then(() => res);
  });
  e.waitUntil(net.then(() => {}, () => {}));   // keeps refreshing the saved copy after answering
  e.respondWith(caches.match(req, { ignoreSearch: true }).then((hit) => hit || net.catch(() => caches.match('index.html'))));
});
