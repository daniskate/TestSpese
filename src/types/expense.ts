import type { Timestamp } from "firebase/firestore";

export interface ExpenseSplit {
  memberId: string;
  amount: number;
  percentage?: number;
}

export interface Expense {
  id: string;
  description: string;
  amount: number;
  date: Timestamp;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  paidByMemberId: string;
  categoryId: string;
  type: "shared" | "personal";
  splitMethod: "equal" | "custom" | "percentage";
  splits: ExpenseSplit[];
  createdByMemberId: string;
  isSettlement: boolean;
}
