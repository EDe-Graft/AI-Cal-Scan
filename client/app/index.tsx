"use client"

import { useEffect } from "react"
import { View, ActivityIndicator } from "react-native"
import { useRouter } from "expo-router"
import { useAuth } from "../hooks/useAuth"
import { COLORS } from "../lib/constants"

export default function Index() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading) {
      if (user) {
        router.replace("./(tabs)/dashboard")
      } else {
        router.replace("/login")
      }
    }
  }, [user, loading])

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: COLORS.background }}>
      <ActivityIndicator size="large" color={COLORS.primary} />
    </View>
  )
}
