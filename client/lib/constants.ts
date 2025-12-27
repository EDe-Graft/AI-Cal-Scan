export const MEAL_TYPES = ["breakfast", "lunch", "dinner", "snack"] as const
export type MealType = (typeof MEAL_TYPES)[number]

export const COLORS = {
  primary: "#10b981",
  primaryDark: "#059669",
  secondary: "#3b82f6",
  background: "#f9fafb",
  surface: "#ffffff",
  text: "#111827",
  textSecondary: "#6b7280",
  error: "#ef4444",
  success: "#10b981",
  border: "#e5e7eb",
}

export const MEAL_TYPE_LABELS: Record<MealType, string> = {
  breakfast: "Breakfast",
  lunch: "Lunch",
  dinner: "Dinner",
  snack: "Snack",
}

export const MEAL_TYPE_EMOJIS: Record<MealType, string> = {
  breakfast: "🌅",
  lunch: "☀️",
  dinner: "🌙",
  snack: "🍎",
}
