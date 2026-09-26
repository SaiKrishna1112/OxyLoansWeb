importScripts('https://www.gstatic.com/firebasejs/10.7.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: 'AIzaSyBlUH7WWkfkTC-b9awVhf97kPHMdIhtdmc',
  authDomain: 'oxyloans-293d0.firebaseapp.com',
  projectId: 'oxyloans-293d0',
  storageBucket: 'oxyloans-293d0.appspot.com',
  messagingSenderId: '876676602395',
  appId: '1:876676602395:web:71a77d0faf4729278d76be',
});

self.addEventListener('install', function () {
  self.skipWaiting();
});

self.addEventListener('activate', function (event) {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('message', function (event) {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

function parsePayload(raw) {
  if (!raw) return { title: 'OxyLoans', body: '', url: '/dashboard' };
  const data = raw.data || raw;
  return {
    title: raw.notification?.title || data.title || 'OxyLoans',
    body: raw.notification?.body || data.body || '',
    url: data.redirectUrl || raw.fcmOptions?.link || '/dashboard',
  };
}

function showPushNotification(raw) {
  const { title, body, url } = parsePayload(raw);
  console.log('[OxyLoans SW] showNotification', title, body);
  return self.registration.showNotification(title, {
    body,
    icon: '/favicon.ico',
    badge: '/favicon.ico',
    tag: 'oxyloans-' + Date.now(),
    renotify: true,
    data: { url },
  });
}

// Primary handler for FCM data messages in Chrome
self.addEventListener('push', function (event) {
  console.log('[OxyLoans SW] push event received');
  if (!event.data) {
    event.waitUntil(showPushNotification(null));
    return;
  }
  try {
    event.waitUntil(showPushNotification(event.data.json()));
  } catch (e) {
    console.warn('[OxyLoans SW] push parse failed', e);
    event.waitUntil(showPushNotification(null));
  }
});

self.addEventListener('notificationclick', function (event) {
  event.notification.close();
  const url = event.notification.data?.url || '/dashboard';
  event.waitUntil(clients.openWindow(url));
});
