const CACHE_NAME = 'hoylo-v4'
const PRECACHE_URLS = ['/', '/manifest.json', '/icon-192.png', '/icon-512.png']

self.addEventListener('install', (e) => {
  self.skipWaiting()
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(PRECACHE_URLS))
  )
})

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  )
  self.clients.claim()
})

self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return

  e.respondWith(
    fetch(e.request)
      .then(respuesta => {
        const copia = respuesta.clone()
        caches.open(CACHE_NAME).then(cache => cache.put(e.request, copia))
        return respuesta
      })
      .catch(() => caches.match(e.request).then(cacheada => cacheada || caches.match('/')))
  )
})

self.addEventListener('push', (e) => {
  const data = e.data?.json() || {}
  e.waitUntil(
    self.registration.showNotification(data.title || 'Hoylo 🌞', {
      body: data.body || '¡No olvides completar tus retos de hoy!',
      icon: '/icon-192.png'
    })
  )
})

self.addEventListener('notificationclick', (e) => {
  e.notification.close()
  e.waitUntil(clients.openWindow('/'))
})