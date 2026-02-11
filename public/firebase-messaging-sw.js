// Firebase Messaging Service Worker
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

// Initialize Firebase in the service worker
firebase.initializeApp({
  apiKey: "AIzaSyC6jh3-HNhFz5thX515UZTGUjbCek_9NRQ",
  authDomain: "studio-6659628549-fb7cd.firebaseapp.com",
  projectId: "studio-6659628549-fb7cd",
  storageBucket: "studio-6659628549-fb7cd.firebasestorage.app",
  messagingSenderId: "421879343253",
  appId: "1:421879343253:web:92483a4f2400b92b8e139c"
});

const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage((payload) => {
  console.log('Received background message:', payload);

  const notificationTitle = payload.notification?.title || 'Nuova spesa';
  const notificationOptions = {
    body: payload.notification?.body || 'È stata aggiunta una nuova spesa',
    icon: '/pwa-192x192.png',
    badge: '/pwa-192x192.png',
    tag: 'splitease-expense',
    requireInteraction: false,
    data: payload.data,
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

// Handle notification click
self.addEventListener('notificationclick', (event) => {
  console.log('Notification clicked:', event);
  event.notification.close();

  // Open the app when notification is clicked
  event.waitUntil(
    clients.openWindow('/')
  );
});
