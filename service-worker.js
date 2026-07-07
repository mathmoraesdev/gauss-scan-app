const CACHE_NAME = 'gauss-scan-v2';
const ASSETS = [
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png'
];
// Nota: a biblioteca de geração de PDF (jsPDF) é carregada de um CDN externo.
// Ela é cacheada automaticamente pela estratégia de fetch abaixo após o primeiro uso
// com internet, mas não é pré-cacheada aqui para não travar a instalação caso o
// CDN esteja fora do ar no momento da instalação do app.

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((names) =>
      Promise.all(names.filter((n) => n !== CACHE_NAME).map((n) => caches.delete(n)))
    )
  );
  self.clients.claim();
});

// Estratégia "network-first": sempre tenta buscar a versão mais nova da internet
// primeiro. Só usa a cópia salva (cache) se estiver offline ou a rede falhar.
// Isso evita ficar preso numa versão antiga do app depois de uma atualização.
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        if (response && response.status === 200) {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
        }
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});
