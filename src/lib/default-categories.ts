import type { Category } from "@/types";
import { generateCategoryId } from "./group-id";

export function createDefaultCategories(): Category[] {
  return [
    { id: generateCategoryId(), name: "Cibo", icon: "\u{1F355}", color: "#F97316", isDefault: true },
    { id: generateCategoryId(), name: "Trasporto", icon: "\u{1F697}", color: "#3B82F6", isDefault: true },
    { id: generateCategoryId(), name: "Alloggio", icon: "\u{1F3E0}", color: "#8B5CF6", isDefault: true },
    { id: generateCategoryId(), name: "Utenze", icon: "\u{1F4A1}", color: "#EAB308", isDefault: true },
    { id: generateCategoryId(), name: "Intrattenimento", icon: "\u{1F3AC}", color: "#EC4899", isDefault: true },
    { id: generateCategoryId(), name: "Shopping", icon: "\u{1F6D2}", color: "#10B981", isDefault: true },
    { id: generateCategoryId(), name: "Salute", icon: "\u{1F48A}", color: "#EF4444", isDefault: true },
    { id: generateCategoryId(), name: "Altro", icon: "\u{1F4E6}", color: "#6B7280", isDefault: true },
  ];
}

export const MEMBER_COLORS = [
  "#3B82F6", "#EF4444", "#10B981", "#F59E0B",
  "#8B5CF6", "#EC4899", "#06B6D4", "#F97316",
  "#6366F1", "#14B8A6", "#E11D48", "#84CC16",
];
