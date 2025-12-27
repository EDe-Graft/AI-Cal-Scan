export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          daily_calorie_goal: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          daily_calorie_goal?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          daily_calorie_goal?: number
          updated_at?: string
        }
      }
      meals: {
        Row: {
          id: string
          user_id: string
          food_name: string
          calories: number
          meal_type: "breakfast" | "lunch" | "dinner" | "snack"
          photo_url: string | null
          confidence_score: number | null
          logged_at: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          food_name: string
          calories: number
          meal_type: "breakfast" | "lunch" | "dinner" | "snack"
          photo_url?: string | null
          confidence_score?: number | null
          logged_at?: string
          created_at?: string
        }
        Update: {
          food_name?: string
          calories?: number
          meal_type?: "breakfast" | "lunch" | "dinner" | "snack"
          photo_url?: string | null
          confidence_score?: number | null
          logged_at?: string
        }
      }
    }
  }
}
