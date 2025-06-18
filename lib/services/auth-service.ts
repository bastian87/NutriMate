import { supabase } from "@/lib/supabase/client"
import type { User, Session, AuthError, SignUpWithPasswordCredentials } from "@supabase/supabase-js"

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

interface AuthResponseData {
  user: User | null
  session: Session | null
}

interface AuthServiceResponse {
  data: AuthResponseData | null
  error: AuthError | Error | null
}

class AuthService {
  async signUp(email: string, password: string, fullName?: string): Promise<AuthServiceResponse> {
    try {
      const credentials: SignUpWithPasswordCredentials = { email, password }
      if (fullName) {
        credentials.options = { data: { full_name: fullName } }
      }

      const { data, error } = await supabase.auth.signUp(credentials)

      if (error) {
        console.error("Supabase auth.signUp error:", error)
        return { data: null, error }
      }
      if (!data.user) {
        // This case should ideally be covered by `error` from Supabase,
        // but as a safeguard:
        console.error("Supabase auth.signUp: User object is null despite no error.")
        return { data: null, error: new Error("User creation failed: No user object returned.") }
      }

      // Create user profile. This happens regardless of email confirmation status.
      // If email confirmation is ON, the user exists but session is null until confirmed.
      // If email confirmation is OFF, session should exist.
      const { error: profileError } = await this.createUserProfile(data.user.id, email, fullName)
      if (profileError) {
        // Log profile creation error, but still return the auth data/error
        console.error("Error creating user profile after signup:", profileError)
        // Decide if this should make the whole signup fail.
        // For now, let's say auth succeeded but profile failed.
        // The original auth `data` (user, session) and `error` are more critical here.
      }

      return { data: { user: data.user, session: data.session }, error: null }
    } catch (error) {
      console.error("Catch block error in authService.signUp:", error)
      return {
        data: null,
        error: error instanceof Error ? error : new AuthError("Sign up failed due to an unexpected error."),
      }
    }
  }

  async signIn(email: string, password: string): Promise<AuthServiceResponse> {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        return { data: null, error }
      }
      return { data: { user: data.user, session: data.session }, error: null }
    } catch (error) {
      console.error("Catch block error in authService.signIn:", error)
      return {
        data: null,
        error: error instanceof Error ? error : new AuthError("Sign in failed due to an unexpected error."),
      }
    }
  }

  async signOut(): Promise<{ error: AuthError | null }> {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      return { error: null }
    } catch (error) {
      return { error: error as AuthError }
    }
  }

  async getCurrentUser(): Promise<User | null> {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    return user
  }

  async getCurrentSession(): Promise<Session | null> {
    const {
      data: { session },
    } = await supabase.auth.getSession()
    return session
  }

  async updateUserPassword(newPassword: string): Promise<{ error: AuthError | null }> {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      })

      if (error) {
        console.error("Password update error:", error)
        return { error }
      }

      return { error: null }
    } catch (error) {
      console.error("Catch block error in updateUserPassword:", error)
      return {
        error: error instanceof AuthError ? error : new AuthError("Failed to update password"),
      }
    }
  }

  async createUserProfile(
    userId: string,
    email: string,
    fullName?: string,
  ): Promise<{ data: UserProfile[] | null; error: Error | null }> {
    try {
      const { data, error } = await supabase
        .from("users")
        .insert([{ id: userId, email, full_name: fullName }])
        .select()

      if (error) throw error
      return { data, error: null }
    } catch (error) {
      return { data: null, error: error instanceof Error ? error : new Error("Failed to create user profile.") }
    }
  }

  async updateUserProfile(
    userId: string,
    updates: Partial<UserProfile>,
  ): Promise<{ data: UserProfile[] | null; error: Error | null }> {
    try {
      const { data, error } = await supabase.from("users").update(updates).eq("id", userId).select()
      if (error) throw error
      return { data, error: null }
    } catch (error) {
      return { data: null, error: error instanceof Error ? error : new Error("Failed to update user profile.") }
    }
  }

  async getUserProfile(userId: string): Promise<UserProfile | null> {
    const { data, error } = await supabase.from("users").select("*").eq("id", userId).single()
    if (error) {
      console.error("Error getting user profile:", error)
      return null
    }
    return data
  }

  async createUserPreferences(
    userId: string,
    preferences: Omit<UserPreferences, "id" | "user_id" | "created_at" | "updated_at">,
  ) {
    try {
      const { data, error } = await supabase
        .from("user_preferences")
        .insert([{ ...preferences, user_id: userId }])
        .select()
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
    const { data, error } = await supabase.from("user_preferences").select("*").eq("user_id", userId).single()
    if (error) {
      // It's common for preferences not to exist initially, so don't log as a severe error unless it's unexpected.
      // console.error("Error getting user preferences:", error.message);
      return null
    }
    return data
  }

  onAuthStateChange(callback: (event: string, session: Session | null) => void) {
    return supabase.auth.onAuthStateChange(callback)
  }
}

export const authService = new AuthService()
export default authService
