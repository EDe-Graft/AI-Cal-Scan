"use client"

import { useState } from "react"
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert, ActivityIndicator } from "react-native"
import { useRouter, useLocalSearchParams } from "expo-router"
import { useMeals } from "@/hooks/useMeals"
import { useTheme } from "@/hooks/useTheme"
import { MEAL_TYPES, MEAL_TYPE_LABELS } from "@/lib/constants"
import type { MealType } from "@/lib/constants"

export default function LogMeal() {
  const router = useRouter()
  const params = useLocalSearchParams()
  const { colors } = useTheme()

  // If coming from camera with AI results
  const aiFood = params.food as string | undefined
  const aiCalories = params.calories as string | undefined
  const aiServings = params.servings as string | undefined
  const aiConfidence = params.confidence as string | undefined
  const photoUrl = params.photoUrl as string | undefined

  const [foodName, setFoodName] = useState(aiFood || "")
  const [calories, setCalories] = useState(aiCalories || "")
  const [servings, setServings] = useState(aiServings || "")
  const [selectedMealType, setSelectedMealType] = useState<MealType>("breakfast")
  const [loading, setLoading] = useState(false)

  const { addMeal } = useMeals()

  const handleSaveMeal = async () => {
    if (!foodName || !calories || !servings) {
      Alert.alert("Error", "Please fill in all fields")
      return
    }

    const calorieNum = Number.parseInt(calories)
    if (isNaN(calorieNum) || calorieNum < 0) {
      Alert.alert("Error", "Please enter a valid calorie amount")
      return
    }

    const servingSize = Number.parseInt(servings)
    if (isNaN(servingSize) || servingSize < 0) {
      Alert.alert("Error", "Please enter a valid serving size")
      return
    }

    setLoading(true)

    const { error } = await addMeal({
      food_name: foodName,
      calories: calorieNum,
      servings: servingSize,
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
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={[styles.backButton, { color: colors.primary }]}>← Back</Text>
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.text }]}>Log Meal</Text>
      </View>

      <View style={styles.content}>
        {aiConfidence && (
          <View style={[styles.aiNotice, { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border }]}>
            <Text style={[styles.aiNoticeText, { color: colors.text }]}>
              AI Confidence: {(Number.parseFloat(aiConfidence) * 100).toFixed(0)}%
            </Text>
            <Text style={[styles.aiNoticeSubtext, { color: colors.textSecondary }]}>Please review and adjust if needed</Text>
          </View>
        )}

        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>Food Name</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text }]}
              placeholder="e.g., Grilled chicken breast"
              placeholderTextColor={colors.textSecondary}
              value={foodName}
              onChangeText={setFoodName}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>Calories Per Serving</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text }]}
              placeholder="e.g., 320"
              placeholderTextColor={colors.textSecondary}
              value={calories}
              onChangeText={setCalories}
              keyboardType="numeric"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>Serving Size</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text }]}
              placeholder="e.g., 1"
              placeholderTextColor={colors.textSecondary}
              value={servings}
              onChangeText={setServings}
              keyboardType="numeric"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>Meal Type</Text>
            <View style={styles.mealTypeGrid}>
              {MEAL_TYPES.map((type) => (
                <TouchableOpacity
                  key={type}
                  style={[
                    styles.mealTypeButton,
                    { backgroundColor: colors.surface, borderColor: colors.border },
                    selectedMealType === type && { borderColor: colors.primary, backgroundColor: colors.surface },
                  ]}
                  onPress={() => setSelectedMealType(type)}
                >
                  <Text
                    style={[
                      styles.mealTypeText,
                      { color: colors.textSecondary },
                      selectedMealType === type && { color: colors.primary, fontWeight: "600" },
                    ]}
                  >
                    {MEAL_TYPE_LABELS[type]}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <TouchableOpacity
            style={[styles.saveButton, { backgroundColor: colors.primary }, loading && styles.saveButtonDisabled]}
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
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
  },
  backButton: {
    fontSize: 16,
    marginBottom: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
  },
  content: {
    padding: 20,
  },
  aiNotice: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  aiNoticeText: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 4,
  },
  aiNoticeSubtext: {
    fontSize: 12,
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
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
  },
  mealTypeGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  mealTypeButton: {
    flex: 1,
    minWidth: "45%",
    borderWidth: 2,
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
  },
  mealTypeText: {
    fontSize: 16,
    fontWeight: "500",
  },
  saveButton: {
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
