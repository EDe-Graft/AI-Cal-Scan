"use client"

import { useState } from "react"
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert, ActivityIndicator } from "react-native"
import { useRouter, useLocalSearchParams } from "expo-router"
import { useMeals } from "@/hooks/useMeals"
import { COLORS, MEAL_TYPES, MEAL_TYPE_LABELS } from "@/lib/constants"
import type { MealType } from "@/lib/constants"

export default function LogMeal() {
  const router = useRouter()
  const params = useLocalSearchParams()

  // If coming from camera with AI results
  const aiFood = params.food as string | undefined
  const aiCalories = params.calories as string | undefined
  const aiConfidence = params.confidence as string | undefined
  const photoUrl = params.photoUrl as string | undefined

  const [foodName, setFoodName] = useState(aiFood || "")
  const [calories, setCalories] = useState(aiCalories || "")
  const [selectedMealType, setSelectedMealType] = useState<MealType>("breakfast")
  const [loading, setLoading] = useState(false)

  const { addMeal } = useMeals()

  const handleSaveMeal = async () => {
    if (!foodName || !calories) {
      Alert.alert("Error", "Please fill in all fields")
      return
    }

    const calorieNum = Number.parseInt(calories)
    if (isNaN(calorieNum) || calorieNum < 0) {
      Alert.alert("Error", "Please enter a valid calorie amount")
      return
    }

    setLoading(true)

    const { error } = await addMeal({
      food_name: foodName,
      calories: calorieNum,
      meal_type: selectedMealType,
      photo_url: photoUrl || null,
      confidence_score: aiConfidence ? Number.parseFloat(aiConfidence) : null,
      logged_at: new Date().toISOString(),
    })

    setLoading(false)

    if (error) {
      Alert.alert("Error", "Failed to save meal. Please try again.")
    } else {
      Alert.alert("Success", "Meal logged successfully!", [{ text: "OK", onPress: () => router.back() }])
    }
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backButton}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Log Meal</Text>
      </View>

      <View style={styles.content}>
        {aiConfidence && (
          <View style={styles.aiNotice}>
            <Text style={styles.aiNoticeText}>
              AI Confidence: {(Number.parseFloat(aiConfidence) * 100).toFixed(0)}%
            </Text>
            <Text style={styles.aiNoticeSubtext}>Please review and adjust if needed</Text>
          </View>
        )}

        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Food Name</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., Grilled chicken breast"
              value={foodName}
              onChangeText={setFoodName}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Calories</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., 320"
              value={calories}
              onChangeText={setCalories}
              keyboardType="numeric"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Meal Type</Text>
            <View style={styles.mealTypeGrid}>
              {MEAL_TYPES.map((type) => (
                <TouchableOpacity
                  key={type}
                  style={[styles.mealTypeButton, selectedMealType === type && styles.mealTypeButtonActive]}
                  onPress={() => setSelectedMealType(type)}
                >
                  <Text style={[styles.mealTypeText, selectedMealType === type && styles.mealTypeTextActive]}>
                    {MEAL_TYPE_LABELS[type]}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <TouchableOpacity
            style={[styles.saveButton, loading && styles.saveButtonDisabled]}
            onPress={handleSaveMeal}
            disabled={loading}
          >
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveButtonText}>Save Meal</Text>}
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backButton: {
    fontSize: 16,
    color: COLORS.primary,
    marginBottom: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: COLORS.text,
  },
  content: {
    padding: 20,
  },
  aiNotice: {
    backgroundColor: "#dbeafe",
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  aiNoticeText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1e40af",
    marginBottom: 4,
  },
  aiNoticeSubtext: {
    fontSize: 12,
    color: "#1e40af",
  },
  form: {
    gap: 24,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.text,
  },
  input: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: COLORS.text,
  },
  mealTypeGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  mealTypeButton: {
    flex: 1,
    minWidth: "45%",
    backgroundColor: COLORS.surface,
    borderWidth: 2,
    borderColor: COLORS.border,
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
  },
  mealTypeButtonActive: {
    borderColor: COLORS.primary,
    backgroundColor: "#d1fae5",
  },
  mealTypeText: {
    fontSize: 16,
    fontWeight: "500",
    color: COLORS.textSecondary,
  },
  mealTypeTextActive: {
    color: COLORS.primary,
    fontWeight: "600",
  },
  saveButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    padding: 18,
    alignItems: "center",
    marginTop: 8,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
})
