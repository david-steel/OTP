// OTP service worker -- web push only (no fetch interception, no caching).
// Served at /sw.js via a dedicated route with Cache-Control: no-cache so
// updates propagate immediately (the /public/* static path is
// immutable-cached for a year, which would strand old workers).
'use strict';

self.addEventListener('install', function () {
  self.skipWaiting();
});

self.addEventListener('activate', function (event) {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('push', function (event) {
  var data = {};
  try { data = event.data ? event.data.json() : {}; } catch (e) {}
  var title = data.title || 'OTP';
  event.waitUntil(self.registration.showNotification(title, {
    body: data.body || '',
    icon: '/public/favicon-192x192.png',
    badge: '/public/favicon-192x192.png',
    data: { href: data.href || '/dashboard' },
  }));
});

self.addEventListener('notificationclick', function (event) {
  event.notification.close();
  var href = (event.notification.data && event.notification.data.href) || '/dashboard';
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function (list) {
      for (var i = 0; i < list.length; i++) {
        var c = list[i];
        if ('focus' in c) {
          if ('navigate' in c) c.navigate(href);
          return c.focus();
        }
      }
      return self.clients.openWindow(href);
    })
  );
});
