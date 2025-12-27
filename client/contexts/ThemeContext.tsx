import React, { createContext, useContext, useState, useEffect, ReactNode } from "react"
import AsyncStorage from "@react-native-async-storage/async-storage"
import type { ColorScheme } from "@/constants/theme"
import { lightColors, darkColors } from "@/constants/theme"

const THEME_STORAGE_KEY = "@theme_preference"

interface ThemeContextType {
  colorScheme: ColorScheme
  colors: typeof lightColors
  toggleTheme: () => void
  setTheme: (theme: ColorScheme) => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [colorScheme, setColorScheme] = useState<ColorScheme>("light")
  const [isLoading, setIsLoading] = useState(true)

  // Load saved theme preference on mount
  useEffect(() => {
    loadThemePreference()
  }, [])

  const loadThemePreference = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem(THEME_STORAGE_KEY)
      if (savedTheme === "light" || savedTheme === "dark") {
        setColorScheme(savedTheme)
      }
    } catch (error) {
      console.error("Error loading theme preference:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const saveThemePreference = async (theme: ColorScheme) => {
    try {
      await AsyncStorage.setItem(THEME_STORAGE_KEY, theme)
    } catch (error) {
      console.error("Error saving theme preference:", error)
    }
  }

  const toggleTheme = () => {
    const newTheme = colorScheme === "light" ? "dark" : "light"
    setColorScheme(newTheme)
    saveThemePreference(newTheme)
  }

  const setTheme = (theme: ColorScheme) => {
    setColorScheme(theme)
    saveThemePreference(theme)
  }

  const colors = colorScheme === "dark" ? darkColors : lightColors

  // Don't render children until theme is loaded to prevent flash
  if (isLoading) {
    return null
  }

  return <ThemeContext.Provider value={{ colorScheme, colors, toggleTheme, setTheme }}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider")
  }
  return context
}

