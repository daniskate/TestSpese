import { useState } from "react";
import { useGroup } from "@/context/GroupContext";
import { useParams } from "react-router";
import { addExpense, updateExpense } from "@/services/expense-service";
import { splitEqual } from "@/lib/currency";
import { X } from "lucide-react";
import { toast } from "sonner";
import type { Expense, ExpenseSplit } from "@/types";

interface ExpenseFormProps {
  expense?: Expense;
  onClose: () => void;
}

export function ExpenseForm({ expense, onClose }: ExpenseFormProps) {
  const { group, currentMemberId } = useGroup();
  const { groupId } = useParams<{ groupId: string }>();

  const [description, setDescription] = useState(expense?.description ?? "");
  const [amount, setAmount] = useState(expense?.amount?.toString() ?? "");
  const [date, setDate] = useState(() => {
    if (expense?.date?.toDate) {
      const d = expense.date.toDate();
      return d.toISOString().split("T")[0]!;
    }
    return new Date().toISOString().split("T")[0]!;
  });
  const [paidByMemberId, setPaidByMemberId] = useState(
    expense?.paidByMemberId ?? currentMemberId ?? ""
  );
  const [categoryId, setCategoryId] = useState(
    expense?.categoryId ?? group?.categories[0]?.id ?? ""
  );
  const [type, setType] = useState<"shared" | "personal">(
    expense?.type ?? "shared"
  );
  const [isIncome, setIsIncome] = useState(expense?.isIncome ?? false);
  const [splitMethod, setSplitMethod] = useState<
    "equal" | "custom" | "percentage"
  >(expense?.splitMethod ?? "equal");
  const [selectedMembers, setSelectedMembers] = useState<string[]>(() => {
    if (expense?.splits) return expense.splits.map((s) => s.memberId);
    return group?.members.map((m) => m.id) ?? [];
  });
  const [customAmounts, setCustomAmounts] = useState<Record<string, string>>(
    () => {
      if (expense?.splitMethod === "custom") {
        return Object.fromEntries(
          expense.splits.map((s) => [s.memberId, s.amount.toString()])
        );
      }
      return {};
    }
  );
  const [percentages, setPercentages] = useState<Record<string, string>>(
    () => {
      if (expense?.splitMethod === "percentage") {
        return Object.fromEntries(
          expense.splits.map((s) => [
            s.memberId,
            (s.percentage ?? 0).toString(),
          ])
        );
      }
      return {};
    }
  );
  const [loading, setLoading] = useState(false);

  if (!group || !groupId) return null;

  const parsedAmount = parseFloat(amount) || 0;

  const computeSplits = (): ExpenseSplit[] => {
    if (type === "personal") {
      return [{ memberId: paidByMemberId, amount: parsedAmount }];
    }

    if (splitMethod === "equal") {
      const amounts = splitEqual(parsedAmount, selectedMembers.length);
      return selectedMembers.map((id, i) => ({
        memberId: id,
        amount: amounts[i]!,
      }));
    }

    if (splitMethod === "custom") {
      return selectedMembers.map((id) => ({
        memberId: id,
        amount: parseFloat(customAmounts[id] ?? "0") || 0,
      }));
    }

    // percentage
    return selectedMembers.map((id) => {
      const pct = parseFloat(percentages[id] ?? "0") || 0;
      return {
        memberId: id,
        amount: Math.round(parsedAmount * (pct / 100) * 100) / 100,
        percentage: pct,
      };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim() || parsedAmount <= 0) return;

    const splits = computeSplits();

    setLoading(true);
    try {
      const data = {
        description: description.trim(),
        amount: parsedAmount,
        date: new Date(date),
        paidByMemberId,
        categoryId,
        type,
        splitMethod: type === "personal" ? ("equal" as const) : splitMethod,
        splits,
        createdByMemberId: currentMemberId!,
        ...(type === "personal" && isIncome && { isIncome: true }),
      };

      if (expense) {
        await updateExpense(groupId, expense.id, data);
        toast.success(isIncome ? "Entrata aggiornata" : "Spesa aggiornata");
      } else {
        await addExpense(groupId, data);
        toast.success(isIncome ? "Entrata aggiunta" : "Spesa aggiunta");
      }
      onClose();
    } catch {
      toast.error("Errore nel salvataggio");
    } finally {
      setLoading(false);
    }
  };

  const toggleMember = (memberId: string) => {
    setSelectedMembers((prev) =>
      prev.includes(memberId)
        ? prev.filter((id) => id !== memberId)
        : [...prev, memberId]
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-background">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <h2 className="text-lg font-semibold">
          {expense
            ? (isIncome ? "Modifica entrata" : "Modifica spesa")
            : (isIncome ? "Nuova entrata" : "Nuova spesa")}
        </h2>
        <button
          onClick={onClose}
          className="rounded-lg p-1 text-muted-foreground hover:bg-accent"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Form */}
      <form
        onSubmit={handleSubmit}
        className="flex-1 space-y-4 overflow-y-auto px-4 py-4"
      >
        {/* Description */}
        <div className="space-y-1">
          <label className="text-sm font-medium">Descrizione</label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="es. Cena al ristorante"
            className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            required
          />
        </div>

        {/* Amount */}
        <div className="space-y-1">
          <label className="text-sm font-medium">Importo (EUR)</label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            step="0.01"
            min="0.01"
            className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            required
          />
        </div>

        {/* Date */}
        <div className="space-y-1">
          <label className="text-sm font-medium">Data</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        {/* Paid by */}
        <div className="space-y-1">
          <label className="text-sm font-medium">Pagato da</label>
          <select
            value={paidByMemberId}
            onChange={(e) => setPaidByMemberId(e.target.value)}
            className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          >
            {group.members.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name}
              </option>
            ))}
          </select>
        </div>

        {/* Category */}
        <div className="space-y-1">
          <label className="text-sm font-medium">Categoria</label>
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          >
            {group.categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.icon} {c.name}
              </option>
            ))}
          </select>
        </div>

        {/* Type */}
        <div className="space-y-1">
          <label className="text-sm font-medium">Tipo</label>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => {
                setType("shared");
                setIsIncome(false);
              }}
              className={`flex-1 rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
                type === "shared"
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border text-muted-foreground hover:bg-accent"
              }`}
            >
              Condivisa
            </button>
            <button
              type="button"
              onClick={() => setType("personal")}
              className={`flex-1 rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
                type === "personal"
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border text-muted-foreground hover:bg-accent"
              }`}
            >
              Personale
            </button>
          </div>
        </div>

        {/* Income/Expense toggle (only for personal) */}
        {type === "personal" && (
          <div className="space-y-1">
            <label className="text-sm font-medium">Transazione</label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setIsIncome(false)}
                className={`flex-1 rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
                  !isIncome
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border text-muted-foreground hover:bg-accent"
                }`}
              >
                Spesa
              </button>
              <button
                type="button"
                onClick={() => setIsIncome(true)}
                className={`flex-1 rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
                  isIncome
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border text-muted-foreground hover:bg-accent"
                }`}
              >
                Entrata
              </button>
            </div>
          </div>
        )}

        {/* Split (only for shared) */}
        {type === "shared" && (
          <>
            {/* Split method */}
            <div className="space-y-1">
              <label className="text-sm font-medium">Divisione</label>
              <div className="flex gap-1">
                {(["equal", "custom", "percentage"] as const).map((method) => (
                  <button
                    key={method}
                    type="button"
                    onClick={() => setSplitMethod(method)}
                    className={`flex-1 rounded-lg border px-2 py-1.5 text-xs font-medium transition-colors ${
                      splitMethod === method
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border text-muted-foreground hover:bg-accent"
                    }`}
                  >
                    {method === "equal"
                      ? "Uguale"
                      : method === "custom"
                        ? "Personalizzato"
                        : "Percentuale"}
                  </button>
                ))}
              </div>
            </div>

            {/* Member selection */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Tra chi dividere</label>
              {group.members.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center justify-between rounded-lg border border-border p-2"
                >
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={selectedMembers.includes(member.id)}
                      onChange={() => toggleMember(member.id)}
                      className="h-4 w-4 rounded accent-primary"
                    />
                    <span className="text-sm">{member.name}</span>
                  </label>

                  {splitMethod === "custom" &&
                    selectedMembers.includes(member.id) && (
                      <input
                        type="number"
                        value={customAmounts[member.id] ?? ""}
                        onChange={(e) =>
                          setCustomAmounts((prev) => ({
                            ...prev,
                            [member.id]: e.target.value,
                          }))
                        }
                        placeholder="0.00"
                        step="0.01"
                        className="w-24 rounded border border-input px-2 py-1 text-right text-sm"
                      />
                    )}

                  {splitMethod === "percentage" &&
                    selectedMembers.includes(member.id) && (
                      <div className="flex items-center gap-1">
                        <input
                          type="number"
                          value={percentages[member.id] ?? ""}
                          onChange={(e) =>
                            setPercentages((prev) => ({
                              ...prev,
                              [member.id]: e.target.value,
                            }))
                          }
                          placeholder="0"
                          className="w-16 rounded border border-input px-2 py-1 text-right text-sm"
                        />
                        <span className="text-sm text-muted-foreground">%</span>
                      </div>
                    )}

                  {splitMethod === "equal" &&
                    selectedMembers.includes(member.id) &&
                    selectedMembers.length > 0 && (
                      <span className="text-xs text-muted-foreground">
                        {(parsedAmount / selectedMembers.length).toFixed(2)} EUR
                      </span>
                    )}
                </div>
              ))}
            </div>
          </>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={loading || !description.trim() || parsedAmount <= 0}
          className="w-full rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
        >
          {loading
            ? "Salvataggio..."
            : expense
              ? "Aggiorna spesa"
              : "Aggiungi spesa"}
        </button>
      </form>
    </div>
  );
}
