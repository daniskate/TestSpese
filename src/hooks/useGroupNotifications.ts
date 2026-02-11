import { useEffect, useRef } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/config/firebase";
import { showTypedNotification } from "@/lib/notifications";
import type { Group } from "@/types/group";

/**
 * Hook to listen for all group changes and show appropriate notifications
 * Monitors: expenses, incomes, settlements, members, and group updates
 */
export function useGroupNotifications(groupId: string | undefined, currentMemberId: string | null) {
  const previousGroup = useRef<Group | null>(null);
  const isFirstLoad = useRef(true);

  useEffect(() => {
    if (!groupId || !currentMemberId) return;

    // Check if notifications are enabled
    if (!("Notification" in window) || Notification.permission !== "granted") {
      return;
    }

    const groupRef = doc(db, "groups", groupId);

    const unsubscribe = onSnapshot(groupRef, (snapshot) => {
      if (!snapshot.exists()) return;

      const currentGroup = snapshot.data() as Group;

      // Skip first load to avoid showing notifications for existing data
      if (isFirstLoad.current) {
        previousGroup.current = currentGroup;
        isFirstLoad.current = false;
        return;
      }

      const prevGroup = previousGroup.current;
      if (!prevGroup) {
        previousGroup.current = currentGroup;
        return;
      }

      // Check for new settlements
      if (currentGroup.settlements.length > prevGroup.settlements.length) {
        const newSettlement = currentGroup.settlements[currentGroup.settlements.length - 1];
        if (newSettlement) {
          const fromMember = currentGroup.members.find((m) => m.id === newSettlement.fromMemberId);
          const toMember = currentGroup.members.find((m) => m.id === newSettlement.toMemberId);

          showTypedNotification(
            groupId,
            "settlement_added",
            `💰 Debito saldato in ${currentGroup.name}`,
            `${fromMember?.name || "Qualcuno"} ha pagato €${newSettlement.amount.toFixed(2)} a ${toMember?.name || "qualcuno"}`
          );
        }
      }

      // Check for new members
      if (currentGroup.members.length > prevGroup.members.length) {
        const newMembers = currentGroup.members.filter(
          (m) => !prevGroup.members.some((pm) => pm.id === m.id)
        );

        newMembers.forEach((member) => {
          showTypedNotification(
            groupId,
            "member_added",
            `👥 Nuovo membro in ${currentGroup.name}`,
            `${member.name} è entrato nel gruppo`
          );
        });
      }

      // Check for removed members
      if (currentGroup.members.length < prevGroup.members.length) {
        const removedMembers = prevGroup.members.filter(
          (m) => !currentGroup.members.some((cm) => cm.id === m.id)
        );

        removedMembers.forEach((member) => {
          showTypedNotification(
            groupId,
            "member_removed",
            `👥 Membro rimosso da ${currentGroup.name}`,
            `${member.name} ha lasciato il gruppo`
          );
        });
      }

      // Check for group name changes
      if (currentGroup.name !== prevGroup.name) {
        showTypedNotification(
          groupId,
          "group_updated",
          "📝 Gruppo aggiornato",
          `Il nome del gruppo è stato cambiato in "${currentGroup.name}"`
        );
      }

      // Update the previous group reference
      previousGroup.current = currentGroup;
    });

    return () => unsubscribe();
  }, [groupId, currentMemberId]);
}
