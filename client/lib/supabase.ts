import { createClient } from "@supabase/supabase-js"

// TODO: Replace these with your actual Supabase URL and anon key
// You can find these in your Supabase project settings
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || ""
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || ""

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
})

