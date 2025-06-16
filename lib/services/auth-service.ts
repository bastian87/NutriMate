import { supabase } from "@/lib/supabase/client"
import type { User, Session } from "@supabase/supabase-js"

export interface UserProfile {
  id: string
  email: string
  full_name?: string
  avatar_url?: string
  created_at: string
  updated_at: string
}

export interface UserPreferences {
  id: string
  user_id: string
  age?: number
  gender?: string
  height?: number
  weight?: number
  activity_level?: "low" | "moderate" | "high"
  health_goal?: string
  calorie_target?: number
  dietary_preferences?: string[]
  excluded_ingredients?: string[]
  created_at: string
  updated_at: string
}

class AuthService {
  async signUp(email: string, password: string, fullName?: string) {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      })

      if (error) throw error

      // Create user profile
      if (data.user) {
        await this.createUserProfile(data.user.id, email, fullName)
      }

      return { data, error: null }
    } catch (error) {
      return { data: null, error }
    }
  }

  async signIn(email: string, password: string) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error
      return { data, error: null }
    } catch (error) {
      return { data: null, error }
    }
  }

  async signOut() {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      return { error: null }
    } catch (error) {
      return { error }
    }
  }

  async getCurrentUser(): Promise<User | null> {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      return user
    } catch (error) {
      console.error("Error getting current user:", error)
      return null
    }
  }

  async getCurrentSession(): Promise<Session | null> {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession()
      return session
    } catch (error) {
      console.error("Error getting current session:", error)
      return null
    }
  }

  async createUserProfile(userId: string, email: string, fullName?: string) {
    try {
      const { data, error } = await supabase
        .from("users")
        .insert([
          {
            id: userId,
            email,
            full_name: fullName,
          },
        ])
        .select()

      if (error) throw error
      return { data, error: null }
    } catch (error) {
      return { data: null, error }
    }
  }

  async updateUserProfile(userId: string, updates: Partial<UserProfile>) {
    try {
      const { data, error } = await supabase.from("users").update(updates).eq("id", userId).select()

      if (error) throw error
      return { data, error: null }
    } catch (error) {
      return { data: null, error }
    }
  }

  async getUserProfile(userId: string): Promise<UserProfile | null> {
    try {
      const { data, error } = await supabase.from("users").select("*").eq("id", userId).single()

      if (error) throw error
      return data
    } catch (error) {
      console.error("Error getting user profile:", error)
      return null
    }
  }

  async createUserPreferences(preferences: Omit<UserPreferences, "id" | "created_at" | "updated_at">) {
    try {
      const { data, error } = await supabase.from("user_preferences").insert([preferences]).select()

      if (error) throw error
      return { data, error: null }
    } catch (error) {
      return { data: null, error }
    }
  }

  async updateUserPreferences(userId: string, updates: Partial<UserPreferences>) {
    try {
      const { data, error } = await supabase.from("user_preferences").update(updates).eq("user_id", userId).select()

      if (error) throw error
      return { data, error: null }
    } catch (error) {
      return { data: null, error }
    }
  }

  async getUserPreferences(userId: string): Promise<UserPreferences | null> {
    try {
      const { data, error } = await supabase.from("user_preferences").select("*").eq("user_id", userId).single()

      if (error) throw error
      return data
    } catch (error) {
      console.error("Error getting user preferences:", error)
      return null
    }
  }

  onAuthStateChange(callback: (event: string, session: Session | null) => void) {
    return supabase.auth.onAuthStateChange(callback)
  }
}

// Export as named export
export const authService = new AuthService()

// Also export as default for flexibility
export default authService
