import { getMessaging, getToken, onMessage } from "firebase/messaging";
import { initializeApp, getApp } from "firebase/app";

// Get existing Firebase app
let messaging: ReturnType<typeof getMessaging> | null = null;

const firebaseConfig = {
  apiKey: "AIzaSyC6jh3-HNhFz5thX515UZTGUjbCek_9NRQ",
  authDomain: "studio-6659628549-fb7cd.firebaseapp.com",
  projectId: "studio-6659628549-fb7cd",
  storageBucket: "studio-6659628549-fb7cd.firebasestorage.app",
  messagingSenderId: "421879343253",
  appId: "1:421879343253:web:92483a4f2400b92b8e139c"
};

// Initialize messaging only in browser (not in SSR)
export function initializeMessaging() {
  if (typeof window === "undefined") return null;

  try {
    const app = getApp();
    messaging = getMessaging(app);
    return messaging;
  } catch {
    const app = initializeApp(firebaseConfig);
    messaging = getMessaging(app);
    return messaging;
  }
}

// Request notification permission and get FCM token
export async function requestNotificationPermission(): Promise<string | null> {
  try {
    // Check if notifications are supported
    if (!("Notification" in window)) {
      console.log("Browser doesn't support notifications");
      return null;
    }

    // Request permission
    const permission = await Notification.requestPermission();
    if (permission !== "granted") {
      console.log("Notification permission denied");
      return null;
    }

    // Initialize messaging
    const messagingInstance = initializeMessaging();
    if (!messagingInstance) return null;

    // Get FCM token
    // You need to add your VAPID key from Firebase Console
    // Go to: Firebase Console > Project Settings > Cloud Messaging > Web Push certificates
    const token = await getToken(messagingInstance, {
      vapidKey: "YOUR_VAPID_KEY_HERE" // TODO: Replace with actual VAPID key
    });

    console.log("FCM Token:", token);
    return token;
  } catch (error) {
    console.error("Error getting notification permission:", error);
    return null;
  }
}

// Listen for foreground messages
export function onMessageListener() {
  return new Promise((resolve) => {
    const messagingInstance = initializeMessaging();
    if (!messagingInstance) return;

    onMessage(messagingInstance, (payload) => {
      console.log("Message received:", payload);
      resolve(payload);
    });
  });
}

// Show notification
export function showNotification(title: string, body: string, icon?: string) {
  if ("Notification" in window && Notification.permission === "granted") {
    new Notification(title, {
      body,
      icon: icon || "/pwa-192x192.png",
      badge: "/pwa-192x192.png",
      tag: "splitease-notification",
      requireInteraction: false,
    });
  }
}
