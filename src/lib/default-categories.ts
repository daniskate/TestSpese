import type { Category } from "@/types";
import { generateCategoryId } from "./group-id";

export function createDefaultCategories(): Category[] {
  return [
    // Categorie base
    { id: generateCategoryId(), name: "Alimentari", icon: "/Icons/icon_alimentari.png", color: "#F97316", isDefault: true },
    { id: generateCategoryId(), name: "Trasporti", icon: "/Icons/icon_trasporti.png", color: "#3B82F6", isDefault: true },
    { id: generateCategoryId(), name: "Casa", icon: "/Icons/icon_casa.png", color: "#8B5CF6", isDefault: true },
    { id: generateCategoryId(), name: "Bollette", icon: "/Icons/icon_bollette.png", color: "#EAB308", isDefault: true },
    { id: generateCategoryId(), name: "Intrattenimento", icon: "/Icons/icon_intrattenimento.png", color: "#EC4899", isDefault: true },
    { id: generateCategoryId(), name: "Vestiti", icon: "/Icons/icon_vestiti.png", color: "#10B981", isDefault: true },
    { id: generateCategoryId(), name: "Salute", icon: "/Icons/icon_salute.png", color: "#EF4444", isDefault: true },

    // Categorie aggiuntive
    { id: generateCategoryId(), name: "Abbonamenti", icon: "/Icons/icon_abbonamenti.png", color: "#06B6D4", isDefault: true },
    { id: generateCategoryId(), name: "Animali", icon: "/Icons/icon_animali.png", color: "#84CC16", isDefault: true },
    { id: generateCategoryId(), name: "Caffè", icon: "/Icons/icon_caffe.png", color: "#92400E", isDefault: true },
    { id: generateCategoryId(), name: "Viaggi", icon: "/Icons/icon_viaggi.png", color: "#0EA5E9", isDefault: true },
    { id: generateCategoryId(), name: "Famiglia", icon: "/Icons/icon_famiglia.png", color: "#F472B6", isDefault: true },
    { id: generateCategoryId(), name: "Regali", icon: "/Icons/icon_regali.png", color: "#A855F7", isDefault: true },
    { id: generateCategoryId(), name: "Istruzione", icon: "/Icons/icon_istruzione.png", color: "#3B82F6", isDefault: true },
    { id: generateCategoryId(), name: "Attività Fisica", icon: "/Icons/icon_attivita_fisica.png", color: "#22C55E", isDefault: true },
    { id: generateCategoryId(), name: "Tecnologia", icon: "/Icons/icon_tecnologia.png", color: "#6366F1", isDefault: true },
    { id: generateCategoryId(), name: "Svago", icon: "/Icons/icon_svago.png", color: "#F59E0B", isDefault: true },

    // Categoria speciale per entrate
    { id: generateCategoryId(), name: "Stipendio", icon: "/Icons/icon_stipendio.png", color: "#10B981", isDefault: true },
  ];
}

export const MEMBER_COLORS = [
  "#3B82F6", "#EF4444", "#10B981", "#F59E0B",
  "#8B5CF6", "#EC4899", "#06B6D4", "#F97316",
  "#6366F1", "#14B8A6", "#E11D48", "#84CC16",
];
