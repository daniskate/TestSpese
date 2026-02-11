import { useNavigate, useParams } from "react-router";
import { useGroup } from "@/context/GroupContext";
import { MemberAvatar } from "@/components/members/MemberAvatar";
import { formatEUR } from "@/lib/currency";
import { formatDateShort } from "@/lib/format";
import { Plus, TrendingUp, TrendingDown, Settings, Home } from "lucide-react";
import { useMemo } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

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

  // Calculate category breakdown
  const categoryData = useMemo(() => {
    const totals = new Map<string, number>();
    for (const exp of sharedExpenses) {
      const current = totals.get(exp.categoryId) ?? 0;
      totals.set(exp.categoryId, current + exp.amount);
    }

    return group.categories
      .map((cat) => {
        const value = totals.get(cat.id) ?? 0;
        const percentage = totalShared > 0 ? (value / totalShared) * 100 : 0;
        return {
          name: cat.name,
          icon: cat.icon,
          value,
          percentage,
          color: cat.color,
        };
      })
      .filter((d) => d.value > 0)
      .sort((a, b) => b.value - a.value);
  }, [group, sharedExpenses, totalShared]);

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Green Header */}
      <div className="header-gradient px-4 pb-8 pt-4 text-primary-foreground">
        <div className="mb-6 flex items-center justify-between">
          <button
            onClick={() => navigate("/")}
            className="rounded-lg p-2 transition-colors hover:bg-white/10"
            aria-label="Home"
          >
            <Home className="h-5 w-5" />
          </button>
          <h1 className="text-lg font-semibold">{group.name}</h1>
          <button
            onClick={() => navigate(`/g/${groupId}/impostazioni`)}
            className="rounded-lg p-2 transition-colors hover:bg-white/10"
            aria-label="Impostazioni"
          >
            <Settings className="h-5 w-5" />
          </button>
        </div>

        {/* Balance */}
        <div className="text-center">
          <p className="mb-2 text-sm font-medium opacity-90">Spese Condivise</p>
          <p className="text-4xl font-bold">{formatEUR(totalShared)}</p>
        </div>
      </div>

      {/* Content */}
      <div className="space-y-6 px-4 pt-6">
        {/* Donut Chart */}
        {categoryData.length > 0 ? (
          <div className="rounded-2xl bg-card p-6 shadow-md">
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>

            {/* Category List */}
            <div className="mt-6 space-y-3">
              {categoryData.map((item) => (
                <div key={item.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="flex h-10 w-10 items-center justify-center rounded-full text-lg"
                      style={{ backgroundColor: `${item.color}20` }}
                    >
                      {item.icon}
                    </div>
                    <span className="text-sm font-medium">{item.name}</span>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold">{formatEUR(item.value)}</p>
                    <p className="text-xs text-muted-foreground">
                      {item.percentage.toFixed(1)}%
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="rounded-2xl bg-card p-8 text-center shadow-md">
            <p className="text-sm text-muted-foreground">
              Nessuna spesa ancora. Aggiungi la prima!
            </p>
          </div>
        )}

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
                  className="flex min-w-[90px] flex-col items-center gap-2 rounded-xl bg-card p-4 shadow-sm"
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
                className="text-xs font-medium text-primary"
              >
                Vedi tutte
              </button>
            )}
          </div>

          {recentExpenses.length === 0 ? (
            <div className="rounded-2xl bg-card p-8 text-center shadow-sm">
              <p className="text-sm text-muted-foreground">
                Nessuna spesa recente
              </p>
            </div>
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
                    className="flex items-center justify-between rounded-xl bg-card p-4 shadow-sm"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="flex h-10 w-10 items-center justify-center rounded-full text-lg"
                        style={{ backgroundColor: `${category?.color}20` }}
                      >
                        {category?.icon ?? "📦"}
                      </div>
                      <div>
                        <p className="text-sm font-medium">
                          {expense.description}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {payer?.name ?? "?"} •{" "}
                          {expense.date?.toDate
                            ? formatDateShort(expense.date.toDate())
                            : ""}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-sm font-semibold ${expense.isIncome ? 'text-green-600' : ''}`}>
                        {expense.isIncome ? '+' : ''}{formatEUR(expense.amount)}
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
      </div>

      {/* Yellow FAB */}
      <button
        onClick={() => navigate(`/g/${groupId}/spese?new=1`)}
        className="fixed bottom-20 right-4 z-30 flex h-16 w-16 items-center justify-center rounded-full shadow-xl transition-all hover:scale-105 active:scale-95"
        style={{ backgroundColor: "#FDB913" }}
        aria-label="Aggiungi spesa"
      >
        <Plus className="h-7 w-7 text-gray-800" />
      </button>
    </div>
  );
}
