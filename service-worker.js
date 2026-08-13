const CACHE_NAME = 'art-brother-v5.9.0-produtos-mobile';
const CORE_ASSETS = [
  './',
  './index.html',
  './404.html',
  './style.css',
  './script.js',
  './logo.png',
  './site.webmanifest',
  './favicon/favicon-16x16.png',
  './favicon/favicon-32x32.png',
  './favicon/apple-touch-icon.png',
  './favicon/favicon-192x192.png',
  './favicon/favicon-512x512.png',
  './favicon/favicon-48x48.png',
  './favicon/favicon-64x64.png',
  './favicon/favicon-180x180.png',
  './favicon/android-chrome-192x192.png',
  './favicon/android-chrome-512x512.png',
  './favicon/favicon.ico',
  './img/bobzinho.jpeg',
  './img/banner-desktop.png',
  './img/banner-mobile.png',
  './img/bobzinho-praia.jpeg',
  './img/bobzinho-aniversario.jpeg',
  './img/bobzinho-arte.jpeg',
  './img/cartoes-de-visita.png',
  './img/adesivos-cortados.png',
  './img/personalizados-festas-eventos.png',
  './img/impressao-fotografias.png',
  './img/impressao-polaroids.png',
  './img/cadernetas-pet.jpeg',
  './img/caderno-professora.jpeg',
  './img/cadernos-personalizados.jpeg',
  './img/chaveiros-personalizados.jpeg',
  './img/encadernacao-seguranca.jpeg',
  './img/placa-com-foto.jpeg',
  './img/placa-pix.jpeg',
  './img/topo-de-bolo.jpeg',
  './img/galeria/bobzinho.jpeg',
  './img/galeria/bobzinho-praia.jpeg',
  './img/galeria/bobzinho-aniversario.jpeg',
  './img/galeria/bobzinho-arte.jpeg',
  './img/galeria/adesivos-cortados.jpeg',
  './img/galeria/impressao-fotografias.png',
  './img/galeria/impressao-polaroids.png',
  './img/galeria/cadernetas-pet.jpeg',
  './img/galeria/caderno-professora.jpeg',
  './img/galeria/cadernos-personalizados.jpeg',
  './img/galeria/chaveiros-personalizados.jpeg',
  './img/galeria/encadernacao-seguranca.jpeg',
  './img/galeria/placa-com-foto.jpeg',
  './img/galeria/placa-pix.jpeg',
  './img/galeria/topo-de-bolo.jpeg'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => Promise.allSettled(CORE_ASSETS.map(asset => cache.add(asset))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.origin !== location.origin) return;

  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then(response => {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put('./index.html', clone));
          return response;
        })
        .catch(() => caches.match('./index.html').then(response => response || caches.match('./404.html')))
    );
    return;
  }

  if (request.destination === 'image') {
    event.respondWith(
      caches.match(request).then(cached => cached || fetch(request).then(response => {
        const clone = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(request, clone));
        return response;
      }).catch(() => caches.match('./logo.png')))
    );
    return;
  }

  event.respondWith(
    caches.match(request).then(cached => cached || fetch(request).then(response => {
      const clone = response.clone();
      caches.open(CACHE_NAME).then(cache => cache.put(request, clone));
      return response;
    }))
  );
});
