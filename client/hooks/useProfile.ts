import { useState, useEffect } from "react"
import { supabase } from "../lib/supabase"
import { useAuth } from "./useAuth"
import type { Database } from "../lib/database.types"

type Profile = Database["public"]["Tables"]["profiles"]["Row"]

export function useProfile() {
  const { user } = useAuth()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      fetchProfile()
    }
  }, [user])

  const fetchProfile = async () => {
    if (!user) return

    setLoading(true)
    const { data, error } = await supabase.from("profiles").select("*").eq("id", user.id).single()

    if (error) {
      console.error("Error fetching profile:", error)
    } else {
      setProfile(data)
    }

    setLoading(false)
  }

  const updateCalorieGoal = async (goal: number) => {
    if (!user) return { error: new Error("No user logged in") }

    const { data, error } = await supabase
      .from("profiles")
      .update({ daily_calorie_goal: goal })
      .eq("id", user.id)
      .select()
      .single()

    if (error) {
      return { error }
    }

    setProfile(data)
    return { data, error: null }
  }

  return {
    profile,
    loading,
    updateCalorieGoal,
    refetch: fetchProfile,
  }
}
