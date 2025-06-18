import { createClient } from "@/lib/supabase/client"
import type { Database } from "@/lib/types/database"

type UserProfile = Database["public"]["Tables"]["users"]["Row"]
type UserPreferences = Database["public"]["Tables"]["user_preferences"]["Row"]

export class UserService {
  private supabase = createClient()

  async getUserProfile(userId: string): Promise<UserProfile | null> {
    try {
      const { data, error } = await this.supabase.from("users").select("*").eq("id", userId).maybeSingle() // Use maybeSingle() instead of single()

      if (error) {
        console.error("Supabase error in getUserProfile:", error)
        return null
      }

      return data
    } catch (error) {
      console.error("Error fetching user profile:", error)
      return null
    }
  }

  async updateUserProfile(userId: string, updates: Partial<UserProfile>): Promise<UserProfile | null> {
    try {
      const { data, error } = await this.supabase.from("users").update(updates).eq("id", userId).select().single()

      if (error) throw error
      return data
    } catch (error) {
      console.error("Error updating user profile:", error)
      return null
    }
  }

  async getUserPreferences(userId: string): Promise<UserPreferences | null> {
    try {
      const { data, error } = await this.supabase
        .from("user_preferences")
        .select("*")
        .eq("user_id", userId)
        .maybeSingle() // Use maybeSingle() instead of single()

      if (error && error.code !== "PGRST116") {
        console.error("Supabase error in getUserPreferences:", error)
        return null
      }

      return data
    } catch (error) {
      console.error("Error fetching user preferences:", error)
      return null
    }
  }

  async createUserPreferences(
    preferences: Omit<UserPreferences, "id" | "created_at" | "updated_at">,
  ): Promise<UserPreferences | null> {
    try {
      const { data, error } = await this.supabase.from("user_preferences").insert(preferences).select().single()

      if (error) throw error
      return data
    } catch (error) {
      console.error("Error creating user preferences:", error)
      return null
    }
  }

  async updateUserPreferences(userId: string, updates: Partial<UserPreferences>): Promise<UserPreferences | null> {
    try {
      const { data, error } = await this.supabase
        .from("user_preferences")
        .update(updates)
        .eq("user_id", userId)
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error("Error updating user preferences:", error)
      return null
    }
  }

  async saveUserPreferences(userId: string, preferences: Partial<UserPreferences>): Promise<UserPreferences | null> {
    // Check if preferences exist
    const existing = await this.getUserPreferences(userId)

    if (existing) {
      return this.updateUserPreferences(userId, preferences)
    } else {
      return this.createUserPreferences({
        user_id: userId,
        ...preferences,
      } as any)
    }
  }
}

export const userService = new UserService()
