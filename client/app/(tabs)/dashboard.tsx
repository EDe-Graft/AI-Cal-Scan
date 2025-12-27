"use client"

import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, ActivityIndicator } from "react-native"
import { useRouter } from "expo-router"
import { useMeals } from "@/hooks/useMeals"
import { useProfile } from "@/hooks/useProfile"
import { useAuth } from "@/hooks/useAuth"
import { ProgressRing } from "@/components/ProgressRing"
import { MealCard } from "@/components/MealCard"
import { COLORS } from "@/constants/theme"

export default function Dashboard() {
  const router = useRouter()
  const { signOut } = useAuth()
  const { profile, loading: profileLoading } = useProfile()
  const { meals, loading, deleteMeal, refetch, getTotalCalories } = useMeals()

  const totalCalories = getTotalCalories()
  const calorieGoal = profile?.daily_calorie_goal || 2000
  const progress = Math.min(totalCalories / calorieGoal, 1)
  const remaining = Math.max(calorieGoal - totalCalories, 0)

  const handleSignOut = async () => {
    await signOut()
    router.replace("../login")
  }

  const handleDeleteMeal = async (id: string) => {
    await deleteMeal(id)
  }

  if (loading || profileLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Today's Progress</Text>
          <Text style={styles.date}>
            {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
          </Text>
        </View>
        <TouchableOpacity onPress={handleSignOut}>
          <Text style={styles.signOutButton}>Sign Out</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={refetch} tintColor={COLORS.primary} />}
      >
        <View style={styles.progressSection}>
          <ProgressRing progress={progress} current={totalCalories} goal={calorieGoal} />

          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{remaining}</Text>
              <Text style={styles.statLabel}>Remaining</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{meals.length}</Text>
              <Text style={styles.statLabel}>Meals</Text>
            </View>
          </View>
        </View>

        <View style={styles.actionsSection}>
          <TouchableOpacity style={styles.primaryButton} onPress={() => router.push("./camera")}>
            <Text style={styles.primaryButtonText}>📸 Take Photo</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.secondaryButton} onPress={() => router.push("./log-meal")}>
            <Text style={styles.secondaryButtonText}>✏️ Log Manually</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.mealsSection}>
          <Text style={styles.sectionTitle}>Today's Meals</Text>

          {meals.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>No meals logged yet</Text>
              <Text style={styles.emptyStateSubtext}>Start by taking a photo or logging manually</Text>
            </View>
          ) : (
            <View style={styles.mealsList}>
              {meals.map((meal) => (
                <MealCard key={meal.id} meal={meal} onDelete={handleDeleteMeal} />
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.background,
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  greeting: {
    fontSize: 28,
    fontWeight: "bold",
    color: COLORS.text,
  },
  date: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  signOutButton: {
    color: COLORS.error,
    fontSize: 14,
    fontWeight: "600",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    gap: 24,
  },
  progressSection: {
    alignItems: "center",
    gap: 24,
  },
  statsGrid: {
    flexDirection: "row",
    gap: 16,
    width: "100%",
  },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  statValue: {
    fontSize: 32,
    fontWeight: "bold",
    color: COLORS.primary,
  },
  statLabel: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  actionsSection: {
    gap: 12,
  },
  primaryButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 16,
    padding: 18,
    alignItems: "center",
  },
  primaryButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
  secondaryButton: {
    backgroundColor: COLORS.surface,
    borderWidth: 2,
    borderColor: COLORS.primary,
    borderRadius: 16,
    padding: 18,
    alignItems: "center",
  },
  secondaryButtonText: {
    color: COLORS.primary,
    fontSize: 18,
    fontWeight: "600",
  },
  mealsSection: {
    gap: 16,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: COLORS.text,
  },
  mealsList: {
    gap: 12,
  },
  emptyState: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 40,
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: "600",
    color: COLORS.text,
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: "center",
  },
})
