import {
  BookOpen,
  Clapperboard,
  Folder,
  HeartPulse,
  ReceiptText,
  ShoppingBag,
  TrainFront,
  UtensilsCrossed,
} from "lucide-react";

// One icon + tint per category so tables and tiles stay visually consistent.
// Lookup is case-insensitive because categories are free text in the API.
const CATEGORY_META = {
  food: { Icon: UtensilsCrossed, color: "#b45309", tint: "#fef5e2", line: "#f5e3c0" },
  travel: { Icon: TrainFront, color: "#1d4ed8", tint: "#eaf1fe", line: "#d8e5fb" },
  shopping: { Icon: ShoppingBag, color: "#be185d", tint: "#fdeef4", line: "#f8dbe7" },
  bills: { Icon: ReceiptText, color: "#7c3aed", tint: "#f3f0fe", line: "#e5dffb" },
  health: { Icon: HeartPulse, color: "#0d9488", tint: "#e8f8f5", line: "#cdeee7" },
  education: { Icon: BookOpen, color: "#0369a1", tint: "#e8f4fb", line: "#cee6f4" },
  entertainment: { Icon: Clapperboard, color: "#c026d3", tint: "#fbeefc", line: "#f2dbf4" },
};

const FALLBACK_META = {
  Icon: Folder,
  color: "#475569",
  tint: "#f1f5f9",
  line: "#e2e8f0",
};

export function getCategoryMeta(category) {
  if (!category) {
    return FALLBACK_META;
  }
  return CATEGORY_META[String(category).trim().toLowerCase()] || FALLBACK_META;
}
