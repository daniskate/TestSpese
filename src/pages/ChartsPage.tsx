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

  const filteredExpenses = useMemo(() => {
    const nonSettlement = expenses.filter((e) => !e.isSettlement);

    // For shared view, show only shared expenses
    if (expenseType === "shared") {
      return nonSettlement.filter((e) => e.type === "shared");
    }

    // For personal view, include BOTH personal expenses AND shared expenses
    // (shared expenses will be split among members in calculations)
    return nonSettlement;
  }, [expenses, expenseType]);

  const nonSettlementShared = filteredExpenses;

  const categoryData = useMemo(() => {
    if (!group) return [];

    // For personal expenses, show breakdown by member (including shared expenses split)
    if (expenseType === "personal") {
      const memberCategoryMap = new Map<string, Map<string, number>>();

      // Initialize map for each member
      for (const member of group.members) {
        memberCategoryMap.set(member.id, new Map());
      }

      // Aggregate expenses by member and category using splits
      for (const exp of nonSettlementShared) {
        if (exp.isIncome) continue; // Skip income for category breakdown

        // For personal expenses, use splits to determine who actually owes
        for (const split of exp.splits) {
          const memberMap = memberCategoryMap.get(split.memberId);
          if (memberMap) {
            const current = memberMap.get(exp.categoryId) ?? 0;
            memberMap.set(exp.categoryId, current + split.amount);
          }
        }
      }

      // Create data for each member with their category expenses
      const result: Array<{ member: string; category: string; value: number; color: string }> = [];

      for (const member of group.members) {
        const memberMap = memberCategoryMap.get(member.id);
        if (!memberMap) continue;

        for (const cat of group.categories) {
          const value = memberMap.get(cat.id) ?? 0;
          if (value > 0) {
            result.push({
              member: member.name,
              category: cat.name,
              value: Math.round(value * 100) / 100,
              color: cat.color,
            });
          }
        }
      }

      return result;
    }

    // For shared expenses, show total by category
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
  }, [group, nonSettlementShared, expenseType]);

  const memberData = useMemo(() => {
    if (!group) return [];

    if (expenseType === "personal") {
      // For personal expenses, separate income and expenses using splits
      const incomeByMember = new Map<string, number>();
      const expensesByMember = new Map<string, number>();

      const memberCount = group.members.length;

      for (const exp of nonSettlementShared) {
        if (exp.isIncome) {
          // Income: the payer receives money
          const memberId = exp.paidByMemberId;
          incomeByMember.set(memberId, (incomeByMember.get(memberId) ?? 0) + exp.amount);
        } else {
          // Expenses: who paid gets income (credit), who's in splits gets expense (debt)
          // Payer gets credit
          const payerId = exp.paidByMemberId;
          incomeByMember.set(payerId, (incomeByMember.get(payerId) ?? 0) + exp.amount);

          // People in splits owe money
          for (const split of exp.splits) {
            expensesByMember.set(split.memberId, (expensesByMember.get(split.memberId) ?? 0) + split.amount);
          }
        }
      }

      return group.members.map((m) => ({
        name: m.name,
        income: Math.round((incomeByMember.get(m.id) ?? 0) * 100) / 100,
        expenses: Math.round((expensesByMember.get(m.id) ?? 0) * 100) / 100,
        balance: Math.round(((incomeByMember.get(m.id) ?? 0) - (expensesByMember.get(m.id) ?? 0)) * 100) / 100,
        color: m.color,
      }));
    }

    // For shared expenses, use the original logic
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
  }, [group, nonSettlementShared, expenseType]);

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
          className={`btn-animated flex-1 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
            expenseType === "shared"
              ? "bg-card text-foreground shadow-sm"
              : "text-muted-foreground"
          }`}
        >
          Spese condivise
        </button>
        <button
          onClick={() => setExpenseType("personal")}
          className={`btn-animated flex-1 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
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
            className={`btn-animated flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
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
        <>
          <div className="animate-fade-in-up rounded-xl border border-border bg-card p-4 chart-transition">
          {/* Category Chart */}
          {chartTab === "category" && (
            <div>
              <h3 className="mb-4 text-sm font-semibold text-gradient">
                Spese per categoria
              </h3>
              {expenseType === "personal" ? (
                // For personal expenses, show pie chart for each member
                <div className="space-y-6">
                  {group && (() => {
                    // Group data by member
                    type PersonalCategoryData = { member: string; category: string; value: number; color: string };
                    const byMember = new Map<string, Array<PersonalCategoryData>>();
                    (categoryData as Array<PersonalCategoryData>).forEach(item => {
                      if (!byMember.has(item.member)) {
                        byMember.set(item.member, []);
                      }
                      byMember.get(item.member)!.push(item);
                    });

                    // Show ALL members, even those without expenses
                    return group.members.map((member) => {
                      const items = byMember.get(member.name) || [];

                      // Get income/expenses/balance data for this member
                      const memberStats = (memberData as Array<{ name: string; income: number; expenses: number; balance: number; color: string }>)
                        .find(m => m.name === member.name);

                      // Transform data for pie chart
                      const pieData = items.map(item => ({
                        name: item.category,
                        value: item.value,
                        color: item.color,
                      }));

                      return (
                        <div key={member.id} className="animate-fade-in-up rounded-lg border border-border bg-card p-4 hover:shadow-md transition-shadow">
                          <h4 className="mb-4 text-center text-sm font-semibold text-gradient">{member.name}</h4>
                          {items.length > 0 ? (
                            <>
                              <ResponsiveContainer width="100%" height={220}>
                                <PieChart>
                                  <Pie
                                    data={pieData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={50}
                                    outerRadius={80}
                                    paddingAngle={2}
                                    dataKey="value"
                                  >
                                    {pieData.map((entry, index) => (
                                      <Cell key={index} fill={entry.color} />
                                    ))}
                                  </Pie>
                                  <Tooltip formatter={(value) => formatEUR(Number(value))} />
                                </PieChart>
                              </ResponsiveContainer>
                              <div className="mt-3 space-y-1.5">
                                {items.map((item, i) => (
                                  <div key={i} className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                      <div
                                        className="h-3 w-3 rounded-full"
                                        style={{ backgroundColor: item.color }}
                                      />
                                      <span className="text-sm">{item.category}</span>
                                    </div>
                                    <span className="text-sm font-medium">
                                      {formatEUR(item.value)}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </>
                          ) : (
                            <p className="py-8 text-center text-sm text-muted-foreground">
                              Nessuna spesa
                            </p>
                          )}

                          {/* Income/Expenses/Balance Summary */}
                          {memberStats && (
                            <div className="mt-4 border-t border-border pt-3">
                              <div className="grid grid-cols-3 gap-2 text-center">
                                <div>
                                  <p className="text-xs text-muted-foreground">Entrate</p>
                                  <p className="text-sm font-semibold text-green-600">
                                    +{formatEUR(memberStats.income)}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-xs text-muted-foreground">Uscite</p>
                                  <p className="text-sm font-semibold text-red-600">
                                    -{formatEUR(memberStats.expenses)}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-xs text-muted-foreground">Bilancio</p>
                                  <p className={`text-sm font-semibold ${memberStats.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                    {memberStats.balance >= 0 ? '+' : ''}{formatEUR(memberStats.balance)}
                                  </p>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    });
                  })()}
                </div>
              ) : (
                // For shared expenses, show pie chart
                <>
                  <ResponsiveContainer width="100%" height={280}>
                    <PieChart>
                      <Pie
                        data={categoryData as Array<{ name: string; value: number; color: string }>}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={2}
                        dataKey="value"
                      >
                        {(categoryData as Array<{ name: string; value: number; color: string }>).map((entry, index) => (
                          <Cell key={index} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value) => formatEUR(Number(value))}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="mt-4 space-y-2">
                    {(categoryData as Array<{ name: string; value: number; color: string }>).map((item, i) => (
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
                </>
              )}
            </div>
          )}

          {/* Member Bar Chart */}
          {chartTab === "member" && (
            <div>
              <h3 className="mb-4 text-sm font-semibold text-gradient">
                {expenseType === "personal" ? "Entrate e uscite per membro" : "Spese per membro"}
              </h3>
              {expenseType === "personal" ? (
                <>
                  <ResponsiveContainer width="100%" height={280}>
                    <BarChart data={memberData} layout="vertical">
                      <XAxis type="number" tickFormatter={(v) => `${v}\u20AC`} />
                      <YAxis type="category" dataKey="name" width={80} />
                      <Tooltip
                        formatter={(value, name) => [
                          formatEUR(Number(value)),
                          name === "income" ? "Entrate" : name === "expenses" ? "Uscite" : "Bilancio"
                        ]}
                      />
                      <Bar dataKey="income" fill="#16a34a" radius={[0, 4, 4, 0]} />
                      <Bar dataKey="expenses" fill="#dc2626" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                  <div className="mt-4 space-y-2">
                    {memberData.map((item, i) => {
                      // Type assertion: we know this is personal data with income/expenses/balance
                      const personalData = item as { name: string; income: number; expenses: number; balance: number; color: string };
                      return (
                        <div key={i} className="flex items-center justify-between rounded-lg bg-muted p-2">
                          <span className="text-sm font-medium">{personalData.name}</span>
                          <div className="flex gap-3 text-xs">
                            <span className="text-green-600">+{formatEUR(personalData.income)}</span>
                            <span className="text-red-600">-{formatEUR(personalData.expenses)}</span>
                            <span className={`font-semibold ${personalData.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                              = {personalData.balance >= 0 ? '+' : ''}{formatEUR(personalData.balance)}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </>
              ) : (
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
              )}
            </div>
          )}

          {/* Time Line Chart */}
          {chartTab === "time" && (
            <div>
              <h3 className="mb-4 text-sm font-semibold text-gradient">Spese nel tempo</h3>
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
                    stroke="#2D7A5F"
                    strokeWidth={2}
                    dot={{ fill: "#2D7A5F" }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
        </>
      )}
    </div>
  );
}
