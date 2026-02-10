import type { Expense, Member, Category } from "@/types";
import { formatDate } from "./format";

export function exportExpensesToCSV(
  expenses: Expense[],
  members: Member[],
  categories: Category[],
  filename: string = "spese.csv"
): void {
  const memberMap = new Map(members.map((m) => [m.id, m.name]));
  const categoryMap = new Map(categories.map((c) => [c.id, c.name]));

  const headers = [
    "Data",
    "Descrizione",
    "Importo",
    "Pagato da",
    "Tipo",
    "Categoria",
    "Metodo divisione",
    "Dettagli divisione",
  ];

  const rows = expenses
    .filter((e) => !e.isSettlement)
    .map((exp) => [
      formatDate(exp.date.toDate()),
      `"${exp.description.replace(/"/g, '""')}"`,
      exp.amount.toFixed(2),
      memberMap.get(exp.paidByMemberId) ?? "Sconosciuto",
      exp.type === "shared" ? "Condivisa" : "Personale",
      categoryMap.get(exp.categoryId) ?? "Senza categoria",
      exp.splitMethod === "equal"
        ? "Uguale"
        : exp.splitMethod === "custom"
          ? "Personalizzato"
          : "Percentuale",
      `"${exp.splits.map((s) => `${memberMap.get(s.memberId) ?? "?"}: ${s.amount.toFixed(2)} EUR`).join("; ")}"`,
    ]);

  const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join(
    "\n"
  );

  const blob = new Blob(["\ufeff" + csvContent], {
    type: "text/csv;charset=utf-8;",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}
