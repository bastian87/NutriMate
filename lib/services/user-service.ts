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
      const { data, error } = await this.supabase.from("users").update(updates).eq("id", userId).select().maybeSingle()

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
      console.log("🔍 UserService: Creating preferences with data:", preferences)
      const { data, error } = await this.supabase.from("user_preferences").insert(preferences).select().single()

      if (error) {
        console.error("❌ UserService: Error creating preferences:", error)
        throw error
      }
      console.log("✅ UserService: Successfully created preferences:", data)
      return data
    } catch (error) {
      console.error("❌ UserService: Error creating user preferences:", error)
      return null
    }
  }

  async updateUserPreferences(userId: string, updates: Partial<UserPreferences>): Promise<UserPreferences | null> {
    try {
      console.log("🔍 UserService: Updating preferences for user:", userId, "Updates:", updates)
      // Remove id, created_at, and updated_at from updates as they should not be updated
      const { id, created_at, updated_at, ...updatesToSave } = updates
      const { data, error } = await this.supabase
        .from("user_preferences")
        .update(updatesToSave)
        .eq("user_id", userId)
        .select()
        .single()

      if (error) {
        console.error("❌ UserService: Error updating preferences:", error)
        throw error
      }
      console.log("✅ UserService: Successfully updated preferences:", data)
      return data
    } catch (error) {
      console.error("❌ UserService: Error updating user preferences:", error)
      return null
    }
  }

  async saveUserPreferences(userId: string, preferences: Partial<UserPreferences>): Promise<UserPreferences | null> {
    console.log("🔍 UserService: Saving preferences for user:", userId, "Data:", preferences)
    
    // Check if preferences exist
    const existing = await this.getUserPreferences(userId)
    console.log("🔍 UserService: Existing preferences:", existing)

    if (existing) {
      console.log("🔍 UserService: Updating existing preferences")
      return this.updateUserPreferences(userId, preferences)
    } else {
      console.log("🔍 UserService: Creating new preferences")
      // Remove id, created_at, and updated_at from preferences as they are auto-generated
      const { id, created_at, updated_at, ...preferencesToSave } = preferences
      return this.createUserPreferences({
        user_id: userId,
        ...preferencesToSave,
      } as any)
    }
  }

  async checkUsernameAvailability(username: string): Promise<{ available: boolean; error?: string }> {
    try {
      const { data, error } = await this.supabase
        .from("users")
        .select("username")
        .eq("username", username)
        .maybeSingle()

      if (error) {
        console.error("Error checking username availability:", error)
        return { available: false, error: error.message }
      }

      return { available: !data }
    } catch (error) {
      console.error("Error checking username availability:", error)
      return { available: false, error: "Failed to check username availability" }
    }
  }

  async updateUsername(userId: string, username: string): Promise<{ success: boolean; error?: string }> {
    try {
      // First check if username is available
      const availability = await this.checkUsernameAvailability(username)
      if (!availability.available) {
        return { success: false, error: "Username is already taken" }
      }

      // Update the username
      const { error } = await this.supabase
        .from("users")
        .update({ username })
        .eq("id", userId)

      if (error) {
        console.error("Error updating username:", error)
        return { success: false, error: error.message }
      }

      return { success: true }
    } catch (error) {
      console.error("Error updating username:", error)
      return { success: false, error: "Failed to update username" }
    }
  }

  async deleteUserAccount(): Promise<{ error?: any }> {
    try {
      const { data } = await this.supabase.auth.getSession();
      const accessToken = data.session?.access_token || "";
      const res = await fetch("/api/user/delete-account", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      })
      if (!res.ok) {
        const data = await res.json()
        return { error: data.error || "Failed to delete account" }
      }
      return {}
    } catch (error) {
      return { error }
    }
  }
}

export const userService = new UserService()
