export type NotificationType =
  | "expense_added"
  | "income_added"
  | "settlement_added"
  | "member_added"
  | "member_removed"
  | "group_updated";

export interface Member {
  id: string;
  name: string;
  color: string;
}

export interface Settlement {
  id: string;
  fromMemberId: string;
  toMemberId: string;
  amount: number;
  date: FirebaseFirestore.Timestamp;
  createdAt: FirebaseFirestore.Timestamp;
  note: string;
}

export interface Expense {
  id: string;
  description: string;
  amount: number;
  paidBy: string;
  splitBetween: string[];
  date: FirebaseFirestore.Timestamp;
  createdAt: FirebaseFirestore.Timestamp;
  category?: string;
  isIncome: boolean;
  splitMethod: "equal" | "custom";
  customSplits?: Record<string, number>;
}

export interface Group {
  id: string;
  name: string;
  members: Member[];
  fcmTokens?: string[];
  settlements: Settlement[];
}

export interface NotificationPayload {
  title: string;
  body: string;
  type: NotificationType;
  groupId: string;
  groupName: string;
}
