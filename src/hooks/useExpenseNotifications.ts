import { useEffect, useRef } from "react";
import { collection, query, orderBy, limit, onSnapshot } from "firebase/firestore";
import { db } from "@/config/firebase";
import { showTypedNotification } from "@/lib/notifications";
import type { Expense } from "@/types";

/**
 * Hook to listen for new expenses and show notifications
 * Only shows notifications for expenses created by other members
 */
export function useExpenseNotifications(groupId: string | undefined, groupName: string) {
  const lastExpenseId = useRef<string | null>(null);
  const isFirstLoad = useRef(true);

  useEffect(() => {
    if (!groupId) return;

    // Check if notifications are enabled
    if (!("Notification" in window) || Notification.permission !== "granted") {
      return;
    }

    const expensesRef = collection(db, "groups", groupId, "expenses");
    const q = query(expensesRef, orderBy("createdAt", "desc"), limit(1));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      // Skip first load to avoid showing notifications for existing expenses
      if (isFirstLoad.current) {
        if (!snapshot.empty) {
          lastExpenseId.current = snapshot.docs[0]!.id;
        }
        isFirstLoad.current = false;
        return;
      }

      // Check if there's a new expense
      if (!snapshot.empty) {
        const doc = snapshot.docs[0]!;
        const expense = doc.data() as Expense;

        // Only show notification if it's a different expense
        if (doc.id !== lastExpenseId.current) {
          lastExpenseId.current = doc.id;

          // Show notification
          const notificationType = expense.isIncome ? "income_added" : "expense_added";
          const title = expense.isIncome
            ? `💰 Nuova entrata in ${groupName}`
            : `📝 Nuova spesa in ${groupName}`;

          const body = expense.isIncome
            ? `${expense.description}: +€${expense.amount.toFixed(2)}`
            : `${expense.description}: €${expense.amount.toFixed(2)}`;

          showTypedNotification(groupId, notificationType, title, body);
        }
      }
    });

    return () => unsubscribe();
  }, [groupId, groupName]);
}
