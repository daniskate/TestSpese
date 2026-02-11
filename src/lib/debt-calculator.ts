import type { Debt, Expense, Member, Settlement } from "@/types";

interface BalanceEntry {
  memberId: string;
  balance: number;
}

export function calculateDebts(
  expenses: Expense[],
  settlements: Settlement[],
  members: Member[]
): Debt[] {
  const balances = new Map<string, number>();
  members.forEach((m) => balances.set(m.id, 0));

  for (const expense of expenses) {
    if (expense.isSettlement || expense.type === "personal") continue;

    const payerId = expense.paidByMemberId;
    balances.set(payerId, (balances.get(payerId) ?? 0) + expense.amount);

    for (const split of expense.splits) {
      balances.set(
        split.memberId,
        (balances.get(split.memberId) ?? 0) - split.amount
      );
    }
  }

  for (const settlement of settlements) {
    balances.set(
      settlement.fromMemberId,
      (balances.get(settlement.fromMemberId) ?? 0) + settlement.amount
    );
    balances.set(
      settlement.toMemberId,
      (balances.get(settlement.toMemberId) ?? 0) - settlement.amount
    );
  }

  const creditors: BalanceEntry[] = [];
  const debtors: BalanceEntry[] = [];

  balances.forEach((balance, memberId) => {
    const rounded = Math.round(balance * 100) / 100;
    if (rounded > 0.01) {
      creditors.push({ memberId, balance: rounded });
    } else if (rounded < -0.01) {
      debtors.push({ memberId, balance: rounded });
    }
  });

  creditors.sort((a, b) => b.balance - a.balance);
  debtors.sort((a, b) => a.balance - b.balance);

  const debts: Debt[] = [];
  let i = 0;
  let j = 0;

  while (i < creditors.length && j < debtors.length) {
    const creditor = creditors[i]!;
    const debtor = debtors[j]!;
    const amount = Math.min(creditor.balance, Math.abs(debtor.balance));
    const roundedAmount = Math.round(amount * 100) / 100;

    if (roundedAmount > 0.01) {
      debts.push({
        fromMemberId: debtor.memberId,
        toMemberId: creditor.memberId,
        amount: roundedAmount,
      });
    }

    creditor.balance -= amount;
    debtor.balance += amount;

    if (Math.abs(creditor.balance) < 0.01) i++;
    if (Math.abs(debtor.balance) < 0.01) j++;
  }

  return debts;
}

export function getMemberBalance(
  memberId: string,
  expenses: Expense[],
  settlements: Settlement[]
): number {
  let balance = 0;

  for (const expense of expenses) {
    if (expense.isSettlement || expense.type === "personal") continue;

    if (expense.paidByMemberId === memberId) {
      balance += expense.amount;
    }

    const split = expense.splits.find((s) => s.memberId === memberId);
    if (split) {
      balance -= split.amount;
    }
  }

  for (const settlement of settlements) {
    if (settlement.fromMemberId === memberId) balance += settlement.amount;
    if (settlement.toMemberId === memberId) balance -= settlement.amount;
  }

  return Math.round(balance * 100) / 100;
}

export function getMemberTotalSpending(
  memberId: string,
  expenses: Expense[]
): { personal: number; sharedQuota: number; total: number } {
  let personal = 0;
  let sharedQuota = 0;

  for (const expense of expenses) {
    if (expense.isSettlement) continue;

    if (expense.type === "personal" && expense.paidByMemberId === memberId) {
      // Income adds to balance, expenses subtract from it
      if (expense.isIncome) {
        personal += expense.amount;
      } else {
        personal -= expense.amount;
      }
    }

    if (expense.type === "shared") {
      const split = expense.splits.find((s) => s.memberId === memberId);
      if (split) {
        sharedQuota += split.amount;
      }
    }
  }

  return {
    personal: Math.round(personal * 100) / 100,
    sharedQuota: Math.round(sharedQuota * 100) / 100,
    total: Math.round((personal - sharedQuota) * 100) / 100,
  };
}
