import * as admin from "firebase-admin";
import * as logger from "firebase-functions/logger";
import type { NotificationPayload } from "./types";

/**
 * Send FCM notification to all tokens in the group
 */
export async function sendNotificationToGroup(
  groupId: string,
  tokens: string[],
  payload: NotificationPayload
): Promise<void> {
  if (!tokens || tokens.length === 0) {
    logger.info(`No FCM tokens for group ${groupId}, skipping notification`);
    return;
  }

  try {
    // Create FCM message
    const message: admin.messaging.MulticastMessage = {
      tokens: tokens,
      notification: {
        title: payload.title,
        body: payload.body,
      },
      data: {
        type: payload.type,
        groupId: payload.groupId,
        groupName: payload.groupName,
        click_action: "FLUTTER_NOTIFICATION_CLICK",
      },
      webpush: {
        fcmOptions: {
          link: `https://studio-6659628549-fb7cd.web.app/g/${groupId}`,
        },
        notification: {
          icon: "/pwa-192x192.png",
          badge: "/pwa-192x192.png",
          vibrate: [200, 100, 200],
          tag: `${payload.type}-${Date.now()}`,
        },
      },
      android: {
        priority: "high",
        notification: {
          sound: "default",
          priority: "high",
          channelId: "splitease-notifications",
        },
      },
      apns: {
        payload: {
          aps: {
            sound: "default",
            badge: 1,
          },
        },
      },
    };

    // Send notification
    const response = await admin.messaging().sendEachForMulticast(message);

    logger.info(
      `Sent notification to group ${groupId}:`,
      `${response.successCount} successful,`,
      `${response.failureCount} failed`
    );

    // Clean up invalid tokens
    if (response.failureCount > 0) {
      const failedTokens: string[] = [];
      response.responses.forEach((resp, idx) => {
        if (!resp.success) {
          logger.warn(`Failed to send to token ${tokens[idx]}:`, resp.error);
          // Collect tokens that should be removed (invalid tokens)
          if (
            resp.error?.code === "messaging/invalid-registration-token" ||
            resp.error?.code === "messaging/registration-token-not-registered"
          ) {
            failedTokens.push(tokens[idx]!);
          }
        }
      });

      // Remove invalid tokens from Firestore
      if (failedTokens.length > 0) {
        await admin
          .firestore()
          .collection("groups")
          .doc(groupId)
          .update({
            fcmTokens: admin.firestore.FieldValue.arrayRemove(...failedTokens),
          });
        logger.info(`Removed ${failedTokens.length} invalid tokens from group ${groupId}`);
      }
    }
  } catch (error) {
    logger.error(`Error sending notification to group ${groupId}:`, error);
    throw error;
  }
}

/**
 * Get member name by ID
 */
export function getMemberName(members: Array<{ id: string; name: string }>, memberId: string): string {
  return members.find((m) => m.id === memberId)?.name || "Qualcuno";
}
