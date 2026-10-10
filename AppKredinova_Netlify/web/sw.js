// AppKredinova: permite abrir la app sin internet si ya se abrió antes.
// Estrategia "primero la red": siempre intenta la versión más nueva y, si no hay señal, usa la guardada.
const CACHE = 'appkredinova-v1';
self.addEventListener('install', e => { self.skipWaiting(); e.waitUntil(caches.open(CACHE).then(c => c.addAll(['./', './index.html']).catch(() => {}))); });
self.addEventListener('activate', e => { e.waitUntil(self.clients.claim()); });
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== self.location.origin) return; // la API de Google no se guarda
  e.respondWith(fetch(req).then(res => { const copia = res.clone(); caches.open(CACHE).then(c => c.put(req, copia)); return res; })
    .catch(() => caches.match(req).then(r => r || caches.match('./index.html'))));
});
