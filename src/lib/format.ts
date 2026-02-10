import { format, isToday, isYesterday } from "date-fns";
import { it } from "date-fns/locale";

export function formatDate(date: Date): string {
  if (isToday(date)) return "Oggi";
  if (isYesterday(date)) return "Ieri";
  return format(date, "d MMMM yyyy", { locale: it });
}

export function formatDateShort(date: Date): string {
  if (isToday(date)) return "Oggi";
  if (isYesterday(date)) return "Ieri";
  return format(date, "d MMM", { locale: it });
}

export function formatDateISO(date: Date): string {
  return format(date, "yyyy-MM-dd");
}
