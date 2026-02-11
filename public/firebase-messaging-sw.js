// Firebase Messaging Service Worker
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

// Importa la configurazione generata automaticamente
importScripts('/firebase-sw-config.js');

// Initialize Firebase in the service worker
firebase.initializeApp(self.firebaseConfig);

const messaging = firebase.messaging();

// Helper function to determine notification icon based on type
function getNotificationIcon(type) {
  // All notifications use the app icon
  return '/pwa-192x192.png';
}

// Helper function to determine notification tag based on type
function getNotificationTag(type) {
  const timestamp = Date.now();
  switch (type) {
    case 'expense_added':
      return `splitease-expense-${timestamp}`;
    case 'income_added':
      return `splitease-income-${timestamp}`;
    case 'settlement_added':
      return `splitease-settlement-${timestamp}`;
    case 'member_added':
    case 'member_removed':
      return `splitease-member-${timestamp}`;
    case 'group_updated':
      return `splitease-group-${timestamp}`;
    default:
      return `splitease-notification-${timestamp}`;
  }
}

// Handle background messages
messaging.onBackgroundMessage((payload) => {
  console.log('Received background message:', payload);

  const notificationType = payload.data?.type || 'expense_added';
  const groupId = payload.data?.groupId;

  const notificationTitle = payload.notification?.title || 'Notifica SpeseDivise';
  const notificationOptions = {
    body: payload.notification?.body || 'Hai una nuova notifica',
    icon: getNotificationIcon(notificationType),
    badge: '/pwa-192x192.png',
    tag: getNotificationTag(notificationType),
    requireInteraction: false,
    data: {
      ...payload.data,
      groupId: groupId,
      type: notificationType,
      url: groupId ? `/g/${groupId}` : '/'
    },
    vibrate: [200, 100, 200],
    actions: [
      {
        action: 'open',
        title: 'Apri'
      },
      {
        action: 'close',
        title: 'Chiudi'
      }
    ]
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

// Handle notification click
self.addEventListener('notificationclick', (event) => {
  console.log('Notification clicked:', event);
  event.notification.close();

  const urlToOpen = event.notification.data?.url || '/';

  // Handle action buttons
  if (event.action === 'close') {
    return;
  }

  // Open or focus the app
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        // Check if there's already a window open
        for (let i = 0; i < clientList.length; i++) {
          const client = clientList[i];
          if (client.url.includes(urlToOpen) && 'focus' in client) {
            return client.focus();
          }
        }
        // If no window is open, open a new one
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen);
        }
      })
  );
});
