import { getMessaging, getToken, onMessage } from "firebase/messaging";
import { initializeApp, getApp } from "firebase/app";
import type { NotificationPreferences, NotificationType } from "@/types/notification";
import { DEFAULT_NOTIFICATION_PREFERENCES } from "@/types/notification";

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
    const token = await getToken(messagingInstance, {
      vapidKey: "BG6O61UX_PWbv6SD40W4I2QV-65DTlHqYeb4tae26gNigGMlstESXOIgFTX18c2aIl1K3lgIXh0yjLUcZG_jqB8"
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
export function showNotification(title: string, body: string, icon?: string, tag?: string) {
  if ("Notification" in window && Notification.permission === "granted") {
    new Notification(title, {
      body,
      icon: icon || "/pwa-192x192.png",
      badge: "/pwa-192x192.png",
      tag: tag || "splitease-notification",
      requireInteraction: false,
    });
  }
}

// Notification preferences management
const PREFERENCES_KEY = "notification_preferences";

export function getNotificationPreferences(groupId: string): NotificationPreferences {
  try {
    const stored = localStorage.getItem(`${PREFERENCES_KEY}_${groupId}`);
    if (stored) {
      return { ...DEFAULT_NOTIFICATION_PREFERENCES, ...JSON.parse(stored) };
    }
  } catch (error) {
    console.error("Error reading notification preferences:", error);
  }
  return DEFAULT_NOTIFICATION_PREFERENCES;
}

export function setNotificationPreferences(groupId: string, preferences: NotificationPreferences): void {
  try {
    localStorage.setItem(`${PREFERENCES_KEY}_${groupId}`, JSON.stringify(preferences));
  } catch (error) {
    console.error("Error saving notification preferences:", error);
  }
}

export function shouldShowNotification(groupId: string, type: NotificationType): boolean {
  const prefs = getNotificationPreferences(groupId);

  switch (type) {
    case "expense_added":
      return prefs.expenses;
    case "income_added":
      return prefs.incomes;
    case "settlement_added":
      return prefs.settlements;
    case "member_added":
    case "member_removed":
      return prefs.members;
    case "group_updated":
      return prefs.groupChanges;
    default:
      return true;
  }
}

// Enhanced notification function with type checking
export function showTypedNotification(
  groupId: string,
  type: NotificationType,
  title: string,
  body: string,
  icon?: string
): void {
  if (!shouldShowNotification(groupId, type)) {
    return;
  }

  const tag = `splitease-${type}-${Date.now()}`;
  showNotification(title, body, icon, tag);
}
