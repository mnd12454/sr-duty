// SR Duty — Service Worker
// Обрабатывает входящие Web Push уведомления и показывает их пользователю.

const CACHE_NAME = 'sr-duty-v1';
const FORM_URL = 'https://script.google.com/macros/s/AKfycbwYgCcREJqLMySth04799JI3txyOyNE57nNUXnrmneWEvt7N0bT6IwOsUr3ImoPrfo5/exec';

// Кэшируем основные файлы при установке
self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function(cache) {
      return cache.addAll([
        '/sr-duty/',
        '/sr-duty/index.html',
        '/sr-duty/manifest.json'
      ]);
    })
  );
  self.skipWaiting();
});

// Активация — очищаем старые кэши
self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.filter(name => name !== CACHE_NAME)
                  .map(name => caches.delete(name))
      );
    })
  );
  self.clients.claim();
});

// Обработка входящих Push уведомлений
self.addEventListener('push', function(event) {
  let data = { title: 'SR Duty', body: 'Новое уведомление' };
  try {
    if (event.data) {
      data = event.data.json();
    }
  } catch(e) {
    if (event.data) data.body = event.data.text();
  }

  const options = {
    body: data.body,
    icon: '/sr-duty/icon-192.png',
    badge: '/sr-duty/icon-72.png',
    vibrate: [200, 100, 200],
    data: { url: data.url || FORM_URL },
    actions: [
      { action: 'open', title: '📅 Открыть форму' }
    ]
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// Клик по уведомлению — открываем форму
self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  const targetUrl = event.notification.data?.url || FORM_URL;
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function(clientList) {
      for (const client of clientList) {
        if (client.url === targetUrl && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});
