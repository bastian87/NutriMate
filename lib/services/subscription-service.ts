import { createClient } from "@/lib/supabase/client"

class SubscriptionService {
  private supabase = createClient()

  async getSubscription(userId: string) {
    try {
      // First check if user_subscriptions table exists by trying to query it
      const { data, error } = await this.supabase.from("user_subscriptions").select("*").eq("user_id", userId).single()

      if (error) {
        // If table doesn't exist, return null (free user)
        if (error.message.includes("does not exist")) {
          console.log("Subscriptions table doesn't exist, treating as free user")
          return null
        }

        // If no subscription found, return null (free user)
        if (error.code === "PGRST116") {
          console.log("No subscription found for user, treating as free user")
          return null
        }

        console.error("Error fetching subscription:", error)
        return null
      }

      return data
    } catch (error) {
      console.error("Unexpected error fetching subscription:", error)
      return null
    }
  }

  async createSubscription(userId: string, planId: string) {
    try {
      const { data, error } = await this.supabase
        .from("user_subscriptions")
        .insert([{ user_id: userId, plan_id: planId }])
        .select()
        .single()

      if (error) {
        console.error("Error creating subscription:", error)
        return null
      }

      return data
    } catch (error) {
      console.error("Unexpected error creating subscription:", error)
      return null
    }
  }

  async updateSubscription(userId: string, planId: string) {
    try {
      const { data, error } = await this.supabase
        .from("user_subscriptions")
        .update({ plan_id: planId })
        .eq("user_id", userId)
        .select()
        .single()

      if (error) {
        console.error("Error updating subscription:", error)
        return null
      }

      return data
    } catch (error) {
      console.error("Unexpected error updating subscription:", error)
      return null
    }
  }

  async deleteSubscription(userId: string) {
    try {
      const { data, error } = await this.supabase.from("user_subscriptions").delete().eq("user_id", userId)

      if (error) {
        console.error("Error deleting subscription:", error)
        return false
      }

      return true
    } catch (error) {
      console.error("Unexpected error deleting subscription:", error)
      return false
    }
  }

  // Helper method to check if user has premium access
  async hasPremiumAccess(userId: string): Promise<boolean> {
    try {
      const subscription = await this.getSubscription(userId)

      // If no subscription table or no subscription, user is free
      if (!subscription) {
        return false
      }

      // Check if subscription is active (you can add more logic here)
      return subscription.status === "active"
    } catch (error) {
      console.error("Error checking premium access:", error)
      // Default to free access on error
      return false
    }
  }
}

export const subscriptionService = new SubscriptionService()
