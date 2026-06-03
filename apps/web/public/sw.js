self.addEventListener('push', function (event) {
  if (!event.data) return;
  var payload = event.data.json();
  event.waitUntil(
    self.registration.showNotification(payload.title || 'KalpX', {
      body: payload.body || '',
      icon: payload.icon || '/kalpx-logo.png',
      badge: payload.badge || '/lotus_icon.png',
      tag: payload.tag || 'kalpx',
      data: { url: payload.url || '/' },
      requireInteraction: false,
    })
  );
});

self.addEventListener('notificationclick', function (event) {
  event.notification.close();
  var targetUrl = (event.notification.data && event.notification.data.url) || '/';
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function (windowClients) {
      for (var i = 0; i < windowClients.length; i++) {
        var client = windowClients[i];
        if (client.url.indexOf(self.location.origin) === 0 && 'focus' in client) {
          client.navigate(targetUrl);
          return client.focus();
        }
      }
      if (clients.openWindow) return clients.openWindow(targetUrl);
    })
  );
});
