"use client"

import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, ActivityIndicator } from "react-native"
import { useRouter } from "expo-router"
import { Ionicons } from "@expo/vector-icons"
import { useMeals } from "@/hooks/useMeals"
import { useProfile } from "@/hooks/useProfile"
import { useAuth } from "@/hooks/useAuth"
import { useTheme } from "@/hooks/useTheme"
import { ProgressRing } from "@/components/ProgressRing"
import { MealCard } from "@/components/MealCard"

export default function Dashboard() {
  const router = useRouter()
  const { signOut } = useAuth()
  const { profile, loading: profileLoading } = useProfile()
  const { meals, loading, deleteMeal, refetch, getTotalCalories } = useMeals()
  const { colors, colorScheme, toggleTheme } = useTheme()

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
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    )
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <View>
          <Text style={[styles.greeting, { color: colors.text }]}>Today's Progress</Text>
          <Text style={[styles.date, { color: colors.textSecondary }]}>
            {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
          </Text>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity onPress={toggleTheme} style={styles.themeToggle}>
            <Ionicons name={colorScheme === "dark" ? "sunny" : "moon"} size={24} color={colors.text} />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleSignOut}>
            <Text style={[styles.signOutButton, { color: colors.error }]}>Sign Out</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={refetch} tintColor={colors.primary} />}
      >
        <View style={styles.progressSection}>
          <ProgressRing progress={progress} current={totalCalories} goal={calorieGoal} />

          <View style={styles.statsGrid}>
            <View style={[styles.statCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Text style={[styles.statValue, { color: colors.primary }]}>{remaining}</Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Remaining</Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Text style={[styles.statValue, { color: colors.primary }]}>{meals.length}</Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Meals</Text>
            </View>
          </View>
        </View>

        <View style={styles.actionsSection}>
          <TouchableOpacity style={[styles.primaryButton, { backgroundColor: colors.primary }]} onPress={() => router.push("./camera")}>
            <Text style={styles.primaryButtonText}>📸 Take Photo</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.secondaryButton, { backgroundColor: colors.surface, borderColor: colors.primary }]} onPress={() => router.push("./logmeal")}>
            <Text style={[styles.secondaryButtonText, { color: colors.primary }]}>✏️ Log Manually</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.mealsSection}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Today's Meals</Text>

          {meals.length === 0 ? (
            <View style={[styles.emptyState, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Text style={[styles.emptyStateText, { color: colors.text }]}>No meals logged yet</Text>
              <Text style={[styles.emptyStateSubtext, { color: colors.textSecondary }]}>Start by taking a photo or logging manually</Text>
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
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  themeToggle: {
    padding: 4,
  },
  greeting: {
    fontSize: 28,
    fontWeight: "bold",
  },
  date: {
    fontSize: 14,
    marginTop: 4,
  },
  signOutButton: {
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
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
    borderWidth: 1,
  },
  statValue: {
    fontSize: 32,
    fontWeight: "bold",
  },
  statLabel: {
    fontSize: 14,
    marginTop: 4,
  },
  actionsSection: {
    gap: 12,
  },
  primaryButton: {
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
    borderWidth: 2,
    borderRadius: 16,
    padding: 18,
    alignItems: "center",
  },
  secondaryButtonText: {
    fontSize: 18,
    fontWeight: "600",
  },
  mealsSection: {
    gap: 16,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "bold",
  },
  mealsList: {
    gap: 12,
  },
  emptyState: {
    borderRadius: 16,
    padding: 40,
    alignItems: "center",
    borderWidth: 1,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    textAlign: "center",
  },
})
