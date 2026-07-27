self.addEventListener('push', (event) => {
  let data = { title: 'WebGuard', body: 'New alert' };
  try {
    if (event.data) data = { ...data, ...event.data.json() };
  } catch {
    // ignore
  }
  event.waitUntil(
    self.registration.showNotification(data.title || 'WebGuard', {
      body: data.body || data.message || 'Alert',
      icon: '/favicon.svg',
    })
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(clients.openWindow('/app/alerts'));
});
