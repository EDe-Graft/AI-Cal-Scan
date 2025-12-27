import { useState, useEffect, useCallback, useMemo } from "react"
import { supabase } from "../lib/supabase"
import { useAuth } from "./useAuth"
import type { Database } from "@/lib/database.types"
import AsyncStorage from "@react-native-async-storage/async-storage"

type Meal = Database["public"]["Tables"]["meals"]["Row"]
type MealInsert = Database["public"]["Tables"]["meals"]["Insert"]

const MEALS_CACHE_KEY = "cached_meals"

export function useMeals(date?: Date) {
  const { user } = useAuth()
  const [meals, setMeals] = useState<Meal[]>([])
  const [loading, setLoading] = useState(true)
  const [syncing, setSyncing] = useState(false)

  // Memoize targetDate to prevent unnecessary re-renders
  const targetDate = useMemo(() => {
    if (date) {
      // Normalize to start of day for comparison
      const normalized = new Date(date)
      normalized.setHours(0, 0, 0, 0)
      return normalized
    }
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return today
  }, [date ? date.getTime() : null])

  // Load cached meals on mount
  useEffect(() => {
    const loadCachedMeals = async () => {
      try {
        const cached = await AsyncStorage.getItem(MEALS_CACHE_KEY)
        if (cached) {
          setMeals(JSON.parse(cached))
        }
        // Don't set loading to false here - let fetchMeals handle it
        // This ensures we always fetch fresh data when user is available
      } catch (error) {
        console.error("Error loading cached meals:", error)
      }
    }
    loadCachedMeals()
  }, [])

  const cacheMeals = async (mealsToCache: Meal[]) => {
    try {
      await AsyncStorage.setItem(MEALS_CACHE_KEY, JSON.stringify(mealsToCache))
    } catch (error) {
      console.error("Error caching meals:", error)
    }
  }

  const fetchMeals = useCallback(async () => {
    if (!user) {
      setLoading(false)
      setMeals([])
      return
    }

    try {
      setLoading(true)
      const startOfDay = new Date(targetDate)
      startOfDay.setHours(0, 0, 0, 0)
      const endOfDay = new Date(targetDate)
      endOfDay.setHours(23, 59, 59, 999)

      const { data, error } = await supabase
        .from("meals")
        .select("*")
        .eq("user_id", user.id)
        .gte("logged_at", startOfDay.toISOString())
        .lte("logged_at", endOfDay.toISOString())
        .order("logged_at", { ascending: false })

      if (error) {
        console.error("Error fetching meals:", error)
        // Keep cached meals on error
      } else if (data) {
        setMeals(data)
        cacheMeals(data)
      } else {
        setMeals([])
      }
    } catch (err) {
      console.error("Unexpected error in fetchMeals:", err)
      // Keep cached meals on unexpected error
    } finally {
      setLoading(false)
    }
  }, [user, targetDate])

  // Fetch meals from Supabase
  useEffect(() => {
    fetchMeals()
  }, [fetchMeals])

  const addMeal = async (meal: Omit<MealInsert, "user_id">) => {
    if (!user) return { error: new Error("No user logged in") }

    const newMeal: MealInsert = {
      ...meal,
      user_id: user.id,
    }

    // Optimistic update
    const tempMeal = { ...newMeal, id: `temp-${Date.now()}`, created_at: new Date().toISOString() } as Meal
    setMeals((prev) => [tempMeal, ...prev])

    const { data, error } = await supabase.from("meals").insert(newMeal).select().single()

    if (error) {
      // Rollback on error
      setMeals((prev) => prev.filter((m) => m.id !== tempMeal.id))
      return { error }
    }

    // Replace temp with real meal
    setMeals((prev) => prev.map((m) => (m.id === tempMeal.id ? data : m)))
    await fetchMeals() // Refresh to ensure consistency

    return { data, error: null }
  }

  const updateMeal = async (id: string, updates: Partial<MealInsert>) => {
    const { data, error } = await supabase.from("meals").update(updates).eq("id", id).select().single()

    if (error) {
      return { error }
    }

    setMeals((prev) => prev.map((m) => (m.id === id ? data : m)))
    await fetchMeals()

    return { data, error: null }
  }

  const deleteMeal = async (id: string) => {
    const { error } = await supabase.from("meals").delete().eq("id", id)

    if (error) {
      return { error }
    }

    setMeals((prev) => prev.filter((m) => m.id !== id))
    await fetchMeals()

    return { error: null }
  }

  const syncOfflineMeals = async () => {
    setSyncing(true)
    await fetchMeals()
    setSyncing(false)
  }

  const getTotalCalories = () => {
    return meals.reduce((sum, meal) => sum + meal.calories, 0)
  }

  return {
    meals,
    loading,
    syncing,
    addMeal,
    updateMeal,
    deleteMeal,
    syncOfflineMeals,
    getTotalCalories,
    refetch: fetchMeals,
  }
}
