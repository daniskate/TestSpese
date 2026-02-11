import { useState, useMemo } from "react";
import { useGroup } from "@/context/GroupContext";
import { formatEUR } from "@/lib/currency";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
} from "recharts";
import { format } from "date-fns";
import { it } from "date-fns/locale";

export function ChartsPage() {
  const { group, expenses } = useGroup();
  const [chartTab, setChartTab] = useState<"category" | "member" | "time">(
    "category"
  );
  const [expenseType, setExpenseType] = useState<"shared" | "personal">("shared");

  const filteredExpenses = useMemo(
    () => expenses.filter((e) => !e.isSettlement && e.type === expenseType),
    [expenses, expenseType]
  );

  const nonSettlementShared = filteredExpenses;

  const categoryData = useMemo(() => {
    if (!group) return [];
    const totals = new Map<string, number>();

    for (const exp of nonSettlementShared) {
      const current = totals.get(exp.categoryId) ?? 0;
      totals.set(exp.categoryId, current + exp.amount);
    }

    return group.categories
      .map((cat) => ({
        name: `${cat.icon} ${cat.name}`,
        value: Math.round((totals.get(cat.id) ?? 0) * 100) / 100,
        color: cat.color,
      }))
      .filter((d) => d.value > 0)
      .sort((a, b) => b.value - a.value);
  }, [group, nonSettlementShared]);

  const memberData = useMemo(() => {
    if (!group) return [];
    const totals = new Map<string, number>();

    for (const exp of nonSettlementShared) {
      const current = totals.get(exp.paidByMemberId) ?? 0;
      totals.set(exp.paidByMemberId, current + exp.amount);
    }

    return group.members
      .map((m) => ({
        name: m.name,
        value: Math.round((totals.get(m.id) ?? 0) * 100) / 100,
        color: m.color,
      }))
      .sort((a, b) => b.value - a.value);
  }, [group, nonSettlementShared]);

  const timeData = useMemo(() => {
    const daily = new Map<string, number>();

    for (const exp of nonSettlementShared) {
      if (!exp.date?.toDate) continue;
      const key = format(exp.date.toDate(), "yyyy-MM-dd");
      daily.set(key, (daily.get(key) ?? 0) + exp.amount);
    }

    return Array.from(daily.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([dateStr, total]) => ({
        date: format(new Date(dateStr), "d MMM", { locale: it }),
        total: Math.round(total * 100) / 100,
      }));
  }, [nonSettlementShared]);

  if (!group) return null;

  const tabs = [
    { key: "category" as const, label: "Categorie" },
    { key: "member" as const, label: "Membri" },
    { key: "time" as const, label: "Nel tempo" },
  ];

  return (
    <div className="space-y-4">
      {/* Expense Type Toggle */}
      <div className="flex gap-2 rounded-lg bg-muted p-1">
        <button
          onClick={() => setExpenseType("shared")}
          className={`flex-1 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
            expenseType === "shared"
              ? "bg-card text-foreground shadow-sm"
              : "text-muted-foreground"
          }`}
        >
          Spese condivise
        </button>
        <button
          onClick={() => setExpenseType("personal")}
          className={`flex-1 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
            expenseType === "personal"
              ? "bg-card text-foreground shadow-sm"
              : "text-muted-foreground"
          }`}
        >
          Spese personali
        </button>
      </div>

      {/* Chart Type Tabs */}
      <div className="flex gap-1 rounded-lg bg-muted p-1">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setChartTab(t.key)}
            className={`flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
              chartTab === t.key
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {nonSettlementShared.length === 0 ? (
        <p className="rounded-lg border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
          Aggiungi {expenseType === "shared" ? "spese condivise" : "spese personali"} per vedere i grafici.
        </p>
      ) : (
        <div className="rounded-xl border border-border bg-card p-4">
          {/* Category Pie Chart */}
          {chartTab === "category" && (
            <div>
              <h3 className="mb-4 text-sm font-semibold">
                Spese per categoria
              </h3>
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={index} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value) => formatEUR(Number(value))}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="mt-4 space-y-2">
                {categoryData.map((item, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div
                        className="h-3 w-3 rounded-full"
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="text-sm">{item.name}</span>
                    </div>
                    <span className="text-sm font-medium">
                      {formatEUR(item.value)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Member Bar Chart */}
          {chartTab === "member" && (
            <div>
              <h3 className="mb-4 text-sm font-semibold">Spese per membro</h3>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={memberData} layout="vertical">
                  <XAxis type="number" tickFormatter={(v) => `${v}\u20AC`} />
                  <YAxis type="category" dataKey="name" width={80} />
                  <Tooltip
                    formatter={(value) => formatEUR(Number(value))}
                  />
                  <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                    {memberData.map((entry, index) => (
                      <Cell key={index} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Time Line Chart */}
          {chartTab === "time" && (
            <div>
              <h3 className="mb-4 text-sm font-semibold">Spese nel tempo</h3>
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={timeData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" fontSize={12} />
                  <YAxis tickFormatter={(v) => `${v}\u20AC`} fontSize={12} />
                  <Tooltip
                    formatter={(value) => formatEUR(Number(value))}
                  />
                  <Line
                    type="monotone"
                    dataKey="total"
                    stroke="#10B981"
                    strokeWidth={2}
                    dot={{ fill: "#10B981" }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
