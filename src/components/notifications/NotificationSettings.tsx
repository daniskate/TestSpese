import { useState, useEffect } from "react";
import { Bell, BellOff } from "lucide-react";
import { requestNotificationPermission } from "@/lib/notifications";
import { doc, updateDoc, arrayUnion, arrayRemove } from "firebase/firestore";
import { db } from "@/config/firebase";
import { toast } from "sonner";

interface NotificationSettingsProps {
  groupId: string;
}

export function NotificationSettings({ groupId }: NotificationSettingsProps) {
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Check if notifications are already enabled
    if ("Notification" in window) {
      setNotificationsEnabled(Notification.permission === "granted");
    }
  }, []);

  const handleToggleNotifications = async () => {
    if (notificationsEnabled) {
      // Disable notifications
      setNotificationsEnabled(false);
      toast.info("Notifiche disabilitate");

      // Remove FCM token from group
      const fcmToken = localStorage.getItem(`fcm_token_${groupId}`);
      if (fcmToken) {
        try {
          await updateDoc(doc(db, "groups", groupId), {
            fcmTokens: arrayRemove(fcmToken)
          });
          localStorage.removeItem(`fcm_token_${groupId}`);
        } catch (error) {
          console.error("Error removing FCM token:", error);
        }
      }
    } else {
      // Enable notifications
      setLoading(true);
      try {
        const token = await requestNotificationPermission();

        if (token) {
          // Save token to group in Firestore
          await updateDoc(doc(db, "groups", groupId), {
            fcmTokens: arrayUnion(token)
          });

          // Save token locally
          localStorage.setItem(`fcm_token_${groupId}`, token);

          setNotificationsEnabled(true);
          toast.success("Notifiche abilitate!");
        } else {
          toast.error("Permesso notifiche negato");
        }
      } catch (error) {
        console.error("Error enabling notifications:", error);
        toast.error("Errore nell'abilitazione delle notifiche");
      } finally {
        setLoading(false);
      }
    }
  };

  // Don't show on browsers that don't support notifications
  if (!("Notification" in window)) {
    return null;
  }

  return (
    <div className="flex items-center justify-between rounded-lg border border-border bg-card p-3">
      <div className="flex items-center gap-3">
        {notificationsEnabled ? (
          <Bell className="h-4 w-4 text-primary" />
        ) : (
          <BellOff className="h-4 w-4 text-muted-foreground" />
        )}
        <div>
          <p className="text-sm font-medium">
            {notificationsEnabled ? "Notifiche attive" : "Notifiche disattivate"}
          </p>
          <p className="text-xs text-muted-foreground">
            Ricevi notifiche per nuove spese
          </p>
        </div>
      </div>
      <button
        onClick={handleToggleNotifications}
        disabled={loading}
        className={`relative h-7 w-14 flex-shrink-0 overflow-hidden rounded-full transition-colors ${
          notificationsEnabled ? "bg-primary" : "bg-muted"
        } ${loading ? "opacity-50" : ""}`}
      >
        <span
          className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow-md transition-all duration-300 ${
            notificationsEnabled ? "left-8" : "left-1"
          }`}
        />
      </button>
    </div>
  );
}
