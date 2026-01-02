import { View, Text, StyleSheet, TouchableOpacity, Alert } from "react-native"
import { MEAL_TYPE_LABELS, MEAL_TYPE_EMOJIS } from "../lib/constants"
import { useTheme } from "@/hooks/useTheme"
import type { Database } from "../lib/database.types"

type Meal = Database["public"]["Tables"]["meals"]["Row"]

interface MealCardProps {
  meal: Meal
  onDelete?: (id: string) => void
}

export function MealCard({ meal, onDelete }: MealCardProps) {
  const { colors } = useTheme()
  const time = new Date(meal.logged_at).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  })

  const handleDelete = () => {
    Alert.alert("Delete Meal", "Are you sure you want to delete this meal?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => onDelete?.(meal.id),
      },
    ])
  }

  return (
    <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <View style={styles.header}>
        <View style={styles.mealTypeContainer}>
          <Text style={styles.emoji}>{MEAL_TYPE_EMOJIS[meal.meal_type]}</Text>
          <Text style={[styles.mealType, { color: colors.textSecondary }]}>{MEAL_TYPE_LABELS[meal.meal_type]}</Text>
        </View>
        <Text style={[styles.time, { color: colors.textSecondary }]}>{time}</Text>
      </View>

      <Text style={[styles.foodName, { color: colors.text }]}>{meal.food_name}</Text>

      <View style={styles.footer}>
        <View style={styles.calorieContainer}>
          <Text style={[styles.calories, { color: colors.primary }]}>{meal.calories}</Text>
          <Text style={[styles.calorieLabel, { color: colors.textSecondary }]}>calories</Text>
        </View>

        <View style={styles.calorieContainer}>
          <Text style={[styles.calories, { color: colors.primary }]}>{meal.servings}</Text>
          <Text style={[styles.calorieLabel, { color: colors.textSecondary }]}>serving</Text>
        </View>

        {meal.confidence_score && (
          <View style={[styles.confidenceBadge, { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border }]}>
            <Text style={[styles.confidenceText, { color: colors.textSecondary }]}>AI: {(meal.confidence_score * 100).toFixed(0)}%</Text>
          </View>
        )}

        {onDelete && (
          <TouchableOpacity onPress={handleDelete} style={styles.deleteButton}>
            <Text style={[styles.deleteText, { color: colors.error }]}>Delete</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  mealTypeContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  emoji: {
    fontSize: 20,
  },
  mealType: {
    fontSize: 14,
    fontWeight: "600",
    textTransform: "capitalize",
  },
  time: {
    fontSize: 14,
  },
  foodName: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 12,
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  calorieContainer: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 4,
  },
  calories: {
    fontSize: 24,
    fontWeight: "bold",
  },
  calorieLabel: {
    fontSize: 14,
  },
  confidenceBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  confidenceText: {
    fontSize: 12,
    fontWeight: "600",
  },
  deleteButton: {
    marginLeft: "auto",
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  deleteText: {
    fontSize: 14,
    fontWeight: "600",
  },
})
