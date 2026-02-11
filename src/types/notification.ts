export type NotificationType =
  | "expense_added"
  | "income_added"
  | "settlement_added"
  | "member_added"
  | "member_removed"
  | "group_updated";

export interface NotificationPreferences {
  expenses: boolean;
  incomes: boolean;
  settlements: boolean;
  members: boolean;
  groupChanges: boolean;
}

export interface NotificationData {
  type: NotificationType;
  groupId: string;
  groupName: string;
  title: string;
  body: string;
  data?: Record<string, unknown>;
}

export const DEFAULT_NOTIFICATION_PREFERENCES: NotificationPreferences = {
  expenses: true,
  incomes: true,
  settlements: true,
  members: true,
  groupChanges: true,
};
