/**
 * Service Worker para o App de Gestão Financeira
 * Versão: 4
 */

const CACHE_NAME = 'gestao-financeira-cache-v5';

// Lista de todos os arquivos do seu app para guardar em cache.
const urlsToCache = [
  '/',
  '/index.html',
  '/login.html',
  '/css/styles.css',
  '/css/inteligencia_financeira.css',
  '/js/script.js',
  '/js/inteligencia_financeira.js',
  '/js/utils.js',
  '/js/navigation.js',
  '/js/pwa.js',
  '/icon-192x192.png',
  '/icon-512x512.png'
  // NOTA: Bibliotecas externas (Firebase, JQuery, etc.) não foram adicionadas
  // para garantir compatibilidade e evitar problemas com CORS.
  // Elas serão carregadas da rede quando houver conexão.
];

/**
 * Evento de Instalação:
 * É acionado quando o Service Worker é instalado pela primeira vez.
 * Ele abre o cache e adiciona todos os arquivos da lista 'urlsToCache'.
 */
self.addEventListener('install', event => {
  console.log('Service Worker: Instalando...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Service Worker: Cache aberto. Adicionando arquivos ao cache.');
        return cache.addAll(urlsToCache);
      })
      .catch(error => {
        console.error('Service Worker: Falha ao adicionar arquivos ao cache durante a instalação.', error);
      })
  );
});

/**
 * Evento de Ativação:
 * É acionado após a instalação. É usado para limpar caches antigos
 * que não são mais necessários, garantindo que o usuário sempre tenha a versão mais recente.
 */
self.addEventListener('activate', event => {
  console.log('Service Worker: Ativando...');
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            console.log('Service Worker: Deletando cache antigo:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

/**
 * Evento de Fetch (Busca):
 * Intercepta todas as requisições de rede feitas pela página.
 * Estratégia: Cache-First. Tenta responder com o arquivo do cache.
 * Se não encontrar no cache, busca na rede.
 */
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  const isAppShell =
    event.request.method === 'GET' &&
    url.origin === self.location.origin &&
    (
      url.pathname === '/' ||
      url.pathname.endsWith('.html') ||
      url.pathname.endsWith('.css') ||
      url.pathname.startsWith('/js/')
    );

  if (isAppShell) {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
          return response;
        })
        .catch(() => caches.match(event.request))
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then(response => response || fetch(event.request))
  );
});
