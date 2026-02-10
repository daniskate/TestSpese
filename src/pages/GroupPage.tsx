import { useNavigate, useParams } from "react-router";
import { useGroup } from "@/context/GroupContext";
import { MemberAvatar } from "@/components/members/MemberAvatar";
import { formatEUR } from "@/lib/currency";
import { formatDateShort } from "@/lib/format";
import { Plus, TrendingUp, TrendingDown } from "lucide-react";

export function GroupPage() {
  const { group, expenses, getMemberBalanceValue } = useGroup();
  const { groupId } = useParams();
  const navigate = useNavigate();

  if (!group) return null;

  const sharedExpenses = expenses.filter(
    (e) => e.type === "shared" && !e.isSettlement
  );
  const totalShared = sharedExpenses.reduce((sum, e) => sum + e.amount, 0);
  const recentExpenses = expenses.filter((e) => !e.isSettlement).slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Summary Card */}
      <div className="rounded-xl border border-border bg-card p-4">
        <p className="text-sm text-muted-foreground">Totale spese condivise</p>
        <p className="text-2xl font-bold">{formatEUR(totalShared)}</p>
        <p className="mt-1 text-xs text-muted-foreground">
          {sharedExpenses.length} spese condivise
        </p>
      </div>

      {/* Members */}
      <div>
        <h2 className="mb-3 text-sm font-semibold text-muted-foreground">
          Membri
        </h2>
        <div className="flex gap-3 overflow-x-auto pb-2">
          {group.members.map((member) => {
            const balance = getMemberBalanceValue(member.id);
            return (
              <div
                key={member.id}
                className="flex min-w-[80px] flex-col items-center gap-1 rounded-lg border border-border bg-card p-3"
              >
                <MemberAvatar name={member.name} color={member.color} />
                <span className="text-xs font-medium">{member.name}</span>
                <span
                  className={`flex items-center gap-0.5 text-xs font-semibold ${
                    balance > 0
                      ? "text-green-600"
                      : balance < 0
                        ? "text-red-500"
                        : "text-muted-foreground"
                  }`}
                >
                  {balance > 0 ? (
                    <TrendingUp className="h-3 w-3" />
                  ) : balance < 0 ? (
                    <TrendingDown className="h-3 w-3" />
                  ) : null}
                  {formatEUR(Math.abs(balance))}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent Expenses */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-muted-foreground">
            Ultime spese
          </h2>
          {expenses.length > 5 && (
            <button
              onClick={() => navigate(`/g/${groupId}/spese`)}
              className="text-xs text-primary"
            >
              Vedi tutte
            </button>
          )}
        </div>

        {recentExpenses.length === 0 ? (
          <p className="rounded-lg border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
            Nessuna spesa ancora. Aggiungi la prima!
          </p>
        ) : (
          <div className="space-y-2">
            {recentExpenses.map((expense) => {
              const payer = group.members.find(
                (m) => m.id === expense.paidByMemberId
              );
              const category = group.categories.find(
                (c) => c.id === expense.categoryId
              );
              return (
                <div
                  key={expense.id}
                  className="flex items-center justify-between rounded-lg border border-border bg-card p-3"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-lg">{category?.icon ?? "\u{1F4E6}"}</span>
                    <div>
                      <p className="text-sm font-medium">
                        {expense.description}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {payer?.name ?? "?"} &middot;{" "}
                        {expense.date?.toDate
                          ? formatDateShort(expense.date.toDate())
                          : ""}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold">
                      {formatEUR(expense.amount)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {expense.type === "shared" ? "Condivisa" : "Personale"}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* FAB */}
      <button
        onClick={() => navigate(`/g/${groupId}/spese?new=1`)}
        className="fixed bottom-20 right-4 z-30 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-transform hover:scale-105 active:scale-95"
        aria-label="Aggiungi spesa"
      >
        <Plus className="h-6 w-6" />
      </button>
    </div>
  );
}
