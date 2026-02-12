import { useState } from "react";
import { useParams } from "react-router";
import { useGroup } from "@/context/GroupContext";
import { MemberAvatar } from "@/components/members/MemberAvatar";
import { addSettlement, removeSettlement } from "@/services/group-service";
import { formatEUR } from "@/lib/currency";
import { ArrowRight, Check, Trash2 } from "lucide-react";
import { toast } from "sonner";

export function DebtsPage() {
  const { group, debts } = useGroup();
  const { groupId } = useParams<{ groupId: string }>();
  const [settlingId, setSettlingId] = useState<string | null>(null);

  if (!group || !groupId) return null;

  const getMember = (id: string) => group.members.find((m) => m.id === id);

  const handleSettle = async (
    fromMemberId: string,
    toMemberId: string,
    amount: number
  ) => {
    const key = `${fromMemberId}-${toMemberId}`;
    const fromName = getMember(fromMemberId)?.name ?? "?";
    const toName = getMember(toMemberId)?.name ?? "?";

    if (
      !confirm(
        `Confermi che ${fromName} ha pagato ${formatEUR(amount)} a ${toName}?`
      )
    )
      return;

    setSettlingId(key);
    try {
      await addSettlement(groupId, fromMemberId, toMemberId, amount);
      toast.success("Debito saldato!");
    } catch {
      toast.error("Errore nel saldo");
    } finally {
      setSettlingId(null);
    }
  };

  const handleDeleteSettlement = async (settlementId: string) => {
    const settlement = group.settlements.find((s) => s.id === settlementId);
    if (!settlement) return;

    const fromName = getMember(settlement.fromMemberId)?.name ?? "?";
    const toName = getMember(settlement.toMemberId)?.name ?? "?";

    if (
      !confirm(
        `Eliminare il saldo di ${formatEUR(settlement.amount)} da ${fromName} a ${toName}?`
      )
    )
      return;

    try {
      await removeSettlement(groupId, settlement);
      toast.success("Saldo eliminato");
    } catch {
      toast.error("Errore nell'eliminazione");
    }
  };

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-border bg-card p-4">
        <p className="text-sm text-muted-foreground">Situazione debiti</p>
        <p className="text-lg font-semibold">
          {debts.length === 0
            ? "Tutti pari!"
            : `${debts.length} ${debts.length === 1 ? "debito" : "debiti"} da saldare`}
        </p>
      </div>

      {debts.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed border-border p-8">
          <Check className="h-10 w-10 text-green-500" />
          <p className="text-sm text-muted-foreground">
            Non ci sono debiti da saldare.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {debts.map((debt) => {
            const from = getMember(debt.fromMemberId);
            const to = getMember(debt.toMemberId);
            const key = `${debt.fromMemberId}-${debt.toMemberId}`;
            const isSettling = settlingId === key;

            return (
              <div
                key={key}
                className="flex items-center gap-3 rounded-xl border border-border bg-card p-4"
              >
                <div className="flex items-center gap-2">
                  <MemberAvatar
                    name={from?.name ?? "?"}
                    color={from?.color ?? "#999"}
                  />
                  <span className="text-sm font-medium">
                    {from?.name ?? "?"}
                  </span>
                </div>

                <div className="flex flex-1 flex-col items-center">
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  <span className="text-lg font-bold text-red-500">
                    {formatEUR(debt.amount)}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">
                    {to?.name ?? "?"}
                  </span>
                  <MemberAvatar
                    name={to?.name ?? "?"}
                    color={to?.color ?? "#999"}
                  />
                </div>

                <button
                  onClick={() =>
                    handleSettle(
                      debt.fromMemberId,
                      debt.toMemberId,
                      debt.amount
                    )
                  }
                  disabled={isSettling}
                  className="ml-2 rounded-lg bg-green-500 px-3 py-1.5 text-xs font-medium text-white transition-all duration-200 hover:bg-green-600 active:scale-95 disabled:opacity-50"
                >
                  {isSettling ? "..." : "Salda"}
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Settlement history */}
      {group.settlements.length > 0 && (
        <div>
          <h3 className="mb-2 text-sm font-semibold text-muted-foreground">
            Storico saldi
          </h3>
          <div className="space-y-2">
            {group.settlements.map((s) => {
              const from = getMember(s.fromMemberId);
              const to = getMember(s.toMemberId);
              return (
                <div
                  key={s.id}
                  className="flex items-center justify-between gap-2 rounded-lg border border-border bg-card/50 p-3 text-sm"
                >
                  <span className="flex-1 text-muted-foreground">
                    {from?.name ?? "?"} ha pagato {to?.name ?? "?"}
                  </span>
                  <span className="font-medium text-green-600">
                    {formatEUR(s.amount)}
                  </span>
                  <button
                    onClick={() => handleDeleteSettlement(s.id)}
                    className="rounded p-1 text-muted-foreground transition-all duration-200 hover:bg-red-50 hover:text-red-500 active:scale-95"
                    aria-label="Elimina saldo"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
