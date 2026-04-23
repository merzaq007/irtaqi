// Service Worker - Irtaqi Push Notifications
self.addEventListener('push', (event) => {
  const data = event.data?.json() || {};
  const title = data.title || 'منصة ارتقي';
  const options = {
    body: data.body || 'تم نشر درس جديد',
    icon: '/favicon.svg',
    badge: '/favicon.svg',
    dir: 'rtl',
    lang: 'ar',
    data: { url: data.url || '/' },
    actions: [
      { action: 'open', title: 'فتح المنصة' },
      { action: 'close', title: 'إغلاق' }
    ]
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  if (event.action === 'close') return;
  const url = event.notification.data?.url || '/';
  event.waitUntil(clients.openWindow(url));
});
