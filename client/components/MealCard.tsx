import { View, Text, StyleSheet, TouchableOpacity, Alert } from "react-native"
import { COLORS, MEAL_TYPE_LABELS, MEAL_TYPE_EMOJIS } from "../lib/constants"
import type { Database } from "../lib/database.types"

type Meal = Database["public"]["Tables"]["meals"]["Row"]

interface MealCardProps {
  meal: Meal
  onDelete?: (id: string) => void
}

export function MealCard({ meal, onDelete }: MealCardProps) {
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
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.mealTypeContainer}>
          <Text style={styles.emoji}>{MEAL_TYPE_EMOJIS[meal.meal_type]}</Text>
          <Text style={styles.mealType}>{MEAL_TYPE_LABELS[meal.meal_type]}</Text>
        </View>
        <Text style={styles.time}>{time}</Text>
      </View>

      <Text style={styles.foodName}>{meal.food_name}</Text>

      <View style={styles.footer}>
        <View style={styles.calorieContainer}>
          <Text style={styles.calories}>{meal.calories}</Text>
          <Text style={styles.calorieLabel}>calories</Text>
        </View>

        {meal.confidence_score && (
          <View style={styles.confidenceBadge}>
            <Text style={styles.confidenceText}>AI: {(meal.confidence_score * 100).toFixed(0)}%</Text>
          </View>
        )}

        {onDelete && (
          <TouchableOpacity onPress={handleDelete} style={styles.deleteButton}>
            <Text style={styles.deleteText}>Delete</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
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
    color: COLORS.textSecondary,
    textTransform: "capitalize",
  },
  time: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  foodName: {
    fontSize: 18,
    fontWeight: "600",
    color: COLORS.text,
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
    color: COLORS.primary,
  },
  calorieLabel: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  confidenceBadge: {
    backgroundColor: "#dbeafe",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  confidenceText: {
    fontSize: 12,
    color: "#1e40af",
    fontWeight: "600",
  },
  deleteButton: {
    marginLeft: "auto",
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  deleteText: {
    color: COLORS.error,
    fontSize: 14,
    fontWeight: "600",
  },
})
