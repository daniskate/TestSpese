import { useState, useMemo } from "react";
import { useSearchParams } from "react-router";
import { useGroup } from "@/context/GroupContext";
import { ExpenseForm } from "@/components/expenses/ExpenseForm";
import { MemberAvatar } from "@/components/members/MemberAvatar";
import { formatEUR } from "@/lib/currency";
import { formatDateShort } from "@/lib/format";
import { getMemberTotalSpending } from "@/lib/debt-calculator";
import { deleteExpense } from "@/services/expense-service";
import { Plus, Trash2, Pencil } from "lucide-react";
import { toast } from "sonner";
import { useParams } from "react-router";
import type { Expense } from "@/types";

export function ExpensesPage() {
  const { group, expenses } = useGroup();
  const { groupId } = useParams<{ groupId: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const [tab, setTab] = useState<"shared" | "personal">("shared");
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [showForm, setShowForm] = useState(searchParams.get("new") === "1");

  if (!group || !groupId) return null;

  const nonSettlementExpenses = expenses.filter((e) => !e.isSettlement);

  const sharedExpenses = nonSettlementExpenses.filter(
    (e) => e.type === "shared"
  );
  const totalShared = sharedExpenses.reduce((sum, e) => sum + e.amount, 0);

  const memberSpending = useMemo(
    () =>
      group.members.map((member) => ({
        member,
        ...getMemberTotalSpending(member.id, nonSettlementExpenses),
      })),
    [group.members, nonSettlementExpenses]
  );

  const handleDelete = async (expenseId: string) => {
    if (!confirm("Eliminare questa spesa?")) return;
    try {
      await deleteExpense(groupId, expenseId);
      toast.success("Spesa eliminata");
    } catch {
      toast.error("Errore nell'eliminazione");
    }
  };

  const openForm = () => {
    setShowForm(true);
    setSearchParams({});
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingExpense(null);
    setSearchParams({});
  };

  return (
    <div className="space-y-4">
      {/* Tabs */}
      <div className="flex gap-1 rounded-lg bg-muted p-1">
        <button
          onClick={() => setTab("shared")}
          className={`flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
            tab === "shared"
              ? "bg-card text-foreground shadow-sm"
              : "text-muted-foreground"
          }`}
        >
          Condivise
        </button>
        <button
          onClick={() => setTab("personal")}
          className={`flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
            tab === "personal"
              ? "bg-card text-foreground shadow-sm"
              : "text-muted-foreground"
          }`}
        >
          Personali
        </button>
      </div>

      {/* Shared Tab */}
      {tab === "shared" && (
        <>
          <div className="rounded-2xl bg-card p-4 shadow-md">
            <p className="text-sm text-muted-foreground">
              Totale spese condivise
            </p>
            <p className="text-2xl font-bold">{formatEUR(totalShared)}</p>
          </div>

          {sharedExpenses.length === 0 ? (
            <p className="rounded-lg border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
              Nessuna spesa condivisa ancora.
            </p>
          ) : (
            <div className="space-y-2">
              {sharedExpenses.map((expense) => {
                const payer = group.members.find(
                  (m) => m.id === expense.paidByMemberId
                );
                const category = group.categories.find(
                  (c) => c.id === expense.categoryId
                );
                return (
                  <div
                    key={expense.id}
                    className="flex items-center gap-3 rounded-xl bg-card p-4 shadow-sm"
                  >
                    <span className="text-lg">{category?.icon ?? "\u{1F4E6}"}</span>
                    <div className="flex-1 min-w-0">
                      <p className="truncate text-sm font-medium">
                        {expense.description}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {payer?.name ?? "?"} &middot;{" "}
                        {expense.date?.toDate
                          ? formatDateShort(expense.date.toDate())
                          : ""}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold">
                        {formatEUR(expense.amount)}
                      </p>
                    </div>
                    <div className="flex gap-1">
                      <button
                        onClick={() => {
                          setEditingExpense(expense);
                          setShowForm(true);
                        }}
                        className="rounded p-1 text-muted-foreground hover:bg-accent"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(expense.id)}
                        className="rounded p-1 text-muted-foreground hover:bg-red-50 hover:text-red-500"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* Personal Tab */}
      {tab === "personal" && (
        <div className="space-y-4">
          {memberSpending.map(({ member, personal, sharedQuota, total }) => (
            <div
              key={member.id}
              className="rounded-2xl bg-card p-4 shadow-md"
            >
              <div className="flex items-center gap-3 mb-3">
                <MemberAvatar name={member.name} color={member.color} />
                <div>
                  <p className="font-semibold">{member.name}</p>
                  <p className="text-xs text-muted-foreground">
                    Totale effettivo
                  </p>
                </div>
                <p className="ml-auto text-lg font-bold">{formatEUR(total)}</p>
              </div>
              <div className="flex gap-4 text-xs">
                <div className="flex-1 rounded-lg bg-muted p-2">
                  <p className="text-muted-foreground">Personali</p>
                  <p className="font-semibold">{formatEUR(personal)}</p>
                </div>
                <div className="flex-1 rounded-lg bg-muted p-2">
                  <p className="text-muted-foreground">Quota condivise</p>
                  <p className="font-semibold">{formatEUR(sharedQuota)}</p>
                </div>
              </div>
            </div>
          ))}

          {/* List personal expenses */}
          <h3 className="text-sm font-semibold text-muted-foreground">
            Spese personali
          </h3>
          {nonSettlementExpenses.filter((e) => e.type === "personal").length ===
          0 ? (
            <p className="rounded-lg border border-dashed border-border p-4 text-center text-sm text-muted-foreground">
              Nessuna spesa personale.
            </p>
          ) : (
            <div className="space-y-2">
              {nonSettlementExpenses
                .filter((e) => e.type === "personal")
                .map((expense) => {
                  const payer = group.members.find(
                    (m) => m.id === expense.paidByMemberId
                  );
                  const category = group.categories.find(
                    (c) => c.id === expense.categoryId
                  );
                  return (
                    <div
                      key={expense.id}
                      className="flex items-center gap-3 rounded-xl bg-card p-4 shadow-sm"
                    >
                      <span className="text-lg">{category?.icon ?? "\u{1F4E6}"}</span>
                      <div className="flex-1 min-w-0">
                        <p className="truncate text-sm font-medium">
                          {expense.description}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {payer?.name ?? "?"} &middot;{" "}
                          {expense.date?.toDate
                            ? formatDateShort(expense.date.toDate())
                            : ""}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className={`text-sm font-semibold ${expense.isIncome ? 'text-green-600' : ''}`}>
                          {expense.isIncome ? '+' : ''}{formatEUR(expense.amount)}
                        </p>
                      </div>
                      <div className="flex gap-1">
                        <button
                          onClick={() => {
                            setEditingExpense(expense);
                            setShowForm(true);
                          }}
                          className="rounded p-1 text-muted-foreground hover:bg-accent"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(expense.id)}
                          className="rounded p-1 text-muted-foreground hover:bg-red-50 hover:text-red-500"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
            </div>
          )}
        </div>
      )}

      {/* Yellow FAB */}
      <button
        onClick={openForm}
        className="fixed bottom-20 right-4 z-30 flex h-16 w-16 items-center justify-center rounded-full shadow-xl transition-all hover:scale-105 active:scale-95"
        style={{ backgroundColor: "#FDB913" }}
        aria-label="Aggiungi spesa"
      >
        <Plus className="h-7 w-7 text-gray-800" />
      </button>

      {/* Form overlay */}
      {showForm && (
        <ExpenseForm
          expense={editingExpense ?? undefined}
          onClose={closeForm}
        />
      )}
    </div>
  );
}
