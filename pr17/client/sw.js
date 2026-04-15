'use strict';

const CACHE_NAME = 'todo-app-v5';

const SHELL_ASSETS = [
  './',
  './index.html',
  './styles.css',
  './app.js',
  './manifest.json',
  './icons/icon-72.png',
  './icons/icon-192.png',
  './icons/icon-512.png',
];

const NETWORK_FIRST_URLS = [
  './about.html',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[SW] Кэширование App Shell');
      return cache.addAll(SHELL_ASSETS);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

function isNetworkFirst(url) {
  return NETWORK_FIRST_URLS.some((pattern) => url.pathname.endsWith(pattern.replace('.', '')));
}

function networkFirst(request) {
  return fetch(request)
    .then((response) => {
      if (response && response.status === 200) {
        const responseClone = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(request, responseClone));
      }
      return response;
    })
    .catch(() =>
      caches.match(request).then((cached) => cached || caches.match('./index.html'))
    );
}

function cacheFirst(request) {
  return caches.match(request).then((cached) => {
    if (cached) return cached;
    return fetch(request)
      .then((response) => {
        if (!response || response.status !== 200 || response.type === 'opaque') {
          return response;
        }
        const responseClone = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(request, responseClone));
        return response;
      })
      .catch(() => {
        if (request.destination === 'document') {
          return caches.match('./index.html');
        }
      });
  });
}

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);
  if (url.pathname.startsWith('/socket.io') || url.pathname.startsWith('/api') ||
      url.pathname === '/subscribe' || url.pathname === '/unsubscribe') {
    return;
  }

  if (isNetworkFirst(url)) {
    event.respondWith(networkFirst(event.request));
  } else {
    event.respondWith(cacheFirst(event.request));
  }
});

// Обработка push-уведомлений
self.addEventListener('push', (event) => {
  let data = {
    title: 'Напоминание',
    body: 'Пора выполнить задачу!',
    icon: '/icons/icon-192.png',
    actions: [],
    data: {},
  };

  if (event.data) {
    try {
      data = { ...data, ...event.data.json() };
    } catch {
      data.body = event.data.text();
    }
  }

  const options = {
    body: data.body,
    icon: data.icon,
    badge: '/icons/icon-72.png',
    vibrate: [100, 50, 100],
    tag: data.tag || 'default',
    renotify: true,
    data: data.data || {},
    actions: data.actions || [],
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// Обработка действий уведомлений
self.addEventListener('notificationclick', (event) => {
  const notification = event.notification;
  const action = event.action;
  const notifData = notification.data || {};

  notification.close();

  // Кнопка «Отложить на 5 минут»
  if (action === 'snooze' && notifData.taskId) {
    event.waitUntil(
      fetch('/api/reminders/snooze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          taskId: notifData.taskId,
          text: notifData.text || '',
        }),
      })
        .then((res) => res.json())
        .then((result) => {
          console.log('[SW] Напоминание отложено:', result);
          return self.registration.showNotification('Отложено', {
            body: `Напоминание перенесено на 5 минут`,
            icon: '/icons/icon-192.png',
            badge: '/icons/icon-72.png',
            tag: 'snooze-confirm',
          });
        })
        .catch((err) => {
          console.error('[SW] Ошибка откладывания:', err);
        })
    );
    return;
  }

  // Кнопка «Закрыть» — просто закрываем, ничего не делаем
  if (action === 'dismiss') {
    return;
  }

  // Клик по самому уведомлению — открываем / фокусируем приложение
  const targetUrl = '/';
  event.waitUntil(
    clients
      .matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        for (const client of clientList) {
          if (client.url.includes(targetUrl) && 'focus' in client) {
            return client.focus();
          }
        }
        if (clients.openWindow) {
          return clients.openWindow(targetUrl);
        }
      })
  );
});
