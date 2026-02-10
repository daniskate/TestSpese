import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "@/config/firebase";
import type { ExpenseSplit } from "@/types";

interface CreateExpenseData {
  description: string;
  amount: number;
  date: Date;
  paidByMemberId: string;
  categoryId: string;
  type: "shared" | "personal";
  splitMethod: "equal" | "custom" | "percentage";
  splits: ExpenseSplit[];
  createdByMemberId: string;
}

export async function addExpense(
  groupId: string,
  data: CreateExpenseData
): Promise<string> {
  const expensesRef = collection(db, "groups", groupId, "expenses");
  const now = serverTimestamp();

  const docRef = await addDoc(expensesRef, {
    ...data,
    date: data.date,
    createdAt: now,
    updatedAt: now,
    isSettlement: false,
  });

  return docRef.id;
}

export async function updateExpense(
  groupId: string,
  expenseId: string,
  data: Partial<CreateExpenseData>
): Promise<void> {
  const expenseRef = doc(db, "groups", groupId, "expenses", expenseId);
  await updateDoc(expenseRef, {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteExpense(
  groupId: string,
  expenseId: string
): Promise<void> {
  await deleteDoc(doc(db, "groups", groupId, "expenses", expenseId));
}
