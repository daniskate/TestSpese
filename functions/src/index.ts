import * as admin from "firebase-admin";
import { onDocumentCreated, onDocumentUpdated } from "firebase-functions/v2/firestore";
import * as logger from "firebase-functions/logger";
import { sendNotificationToGroup, getMemberName } from "./notifications";
import type { Expense, Group, Settlement } from "./types";

// Initialize Firebase Admin
admin.initializeApp();

/**
 * Trigger when a new expense is created
 * Sends notification to all group members
 */
export const onExpenseCreated = onDocumentCreated(
  "groups/{groupId}/expenses/{expenseId}",
  async (event) => {
    const expenseData = event.data?.data() as Expense | undefined;
    const groupId = event.params.groupId;
    const expenseId = event.params.expenseId;

    if (!expenseData) {
      logger.warn(`No expense data found for ${expenseId}`);
      return;
    }

    try {
      // Get group data
      const groupDoc = await admin.firestore().collection("groups").doc(groupId).get();

      if (!groupDoc.exists) {
        logger.warn(`Group ${groupId} not found`);
        return;
      }

      const groupData = groupDoc.data() as Group;
      const fcmTokens = groupData.fcmTokens || [];

      if (fcmTokens.length === 0) {
        logger.info(`No FCM tokens for group ${groupId}`);
        return;
      }

      // Determine notification type and content
      const isIncome = expenseData.isIncome;
      const notificationType = isIncome ? "income_added" : "expense_added";
      const paidByName = getMemberName(groupData.members, expenseData.paidBy);

      const title = isIncome
        ? `💰 Nuova entrata in ${groupData.name}`
        : `📝 Nuova spesa in ${groupData.name}`;

      const body = isIncome
        ? `${paidByName}: ${expenseData.description} - +€${expenseData.amount.toFixed(2)}`
        : `${paidByName}: ${expenseData.description} - €${expenseData.amount.toFixed(2)}`;

      // Send notification
      await sendNotificationToGroup(groupId, fcmTokens, {
        title,
        body,
        type: notificationType,
        groupId,
        groupName: groupData.name,
      });

      logger.info(`Sent ${notificationType} notification for expense ${expenseId} in group ${groupId}`);
    } catch (error) {
      logger.error(`Error processing expense ${expenseId}:`, error);
    }
  }
);

/**
 * Trigger when group document is updated
 * Detects settlements, member changes, and group name changes
 */
export const onGroupUpdated = onDocumentUpdated(
  "groups/{groupId}",
  async (event) => {
    const beforeData = event.data?.before.data() as Group | undefined;
    const afterData = event.data?.after.data() as Group | undefined;
    const groupId = event.params.groupId;

    if (!beforeData || !afterData) {
      logger.warn(`Missing group data for ${groupId}`);
      return;
    }

    const fcmTokens = afterData.fcmTokens || [];

    if (fcmTokens.length === 0) {
      logger.info(`No FCM tokens for group ${groupId}`);
      return;
    }

    try {
      // Check for new settlements
      const beforeSettlements = beforeData.settlements || [];
      const afterSettlements = afterData.settlements || [];

      if (afterSettlements.length > beforeSettlements.length) {
        const newSettlement = afterSettlements[afterSettlements.length - 1] as Settlement;
        const fromName = getMemberName(afterData.members, newSettlement.fromMemberId);
        const toName = getMemberName(afterData.members, newSettlement.toMemberId);

        await sendNotificationToGroup(groupId, fcmTokens, {
          title: `💰 Debito saldato in ${afterData.name}`,
          body: `${fromName} ha pagato €${newSettlement.amount.toFixed(2)} a ${toName}`,
          type: "settlement_added",
          groupId,
          groupName: afterData.name,
        });

        logger.info(`Sent settlement notification for group ${groupId}`);
      }

      // Check for new members
      const beforeMembers = beforeData.members || [];
      const afterMembers = afterData.members || [];

      if (afterMembers.length > beforeMembers.length) {
        const newMembers = afterMembers.filter(
          (m) => !beforeMembers.some((bm) => bm.id === m.id)
        );

        for (const member of newMembers) {
          await sendNotificationToGroup(groupId, fcmTokens, {
            title: `👥 Nuovo membro in ${afterData.name}`,
            body: `${member.name} è entrato nel gruppo`,
            type: "member_added",
            groupId,
            groupName: afterData.name,
          });

          logger.info(`Sent member_added notification for ${member.name} in group ${groupId}`);
        }
      }

      // Check for removed members
      if (afterMembers.length < beforeMembers.length) {
        const removedMembers = beforeMembers.filter(
          (m) => !afterMembers.some((am) => am.id === m.id)
        );

        for (const member of removedMembers) {
          await sendNotificationToGroup(groupId, fcmTokens, {
            title: `👥 Membro rimosso da ${afterData.name}`,
            body: `${member.name} ha lasciato il gruppo`,
            type: "member_removed",
            groupId,
            groupName: afterData.name,
          });

          logger.info(`Sent member_removed notification for ${member.name} in group ${groupId}`);
        }
      }

      // Check for group name changes
      if (beforeData.name !== afterData.name) {
        await sendNotificationToGroup(groupId, fcmTokens, {
          title: "📝 Gruppo aggiornato",
          body: `Il nome del gruppo è stato cambiato da "${beforeData.name}" a "${afterData.name}"`,
          type: "group_updated",
          groupId,
          groupName: afterData.name,
        });

        logger.info(`Sent group_updated notification for group ${groupId}`);
      }
    } catch (error) {
      logger.error(`Error processing group update for ${groupId}:`, error);
    }
  }
);
