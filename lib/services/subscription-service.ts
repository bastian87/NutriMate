import { createClient } from "@/lib/supabase/client"

class SubscriptionService {
  private supabase = createClient()

  async getSubscription(userId: string) {
    try {
      const { data, error } = await this.supabase
        .from("user_subscriptions")
        .select("*")
        .eq("user_id", userId)
        .maybeSingle()

      if (error) {
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

  async hasPremiumAccess(userId: string): Promise<boolean> {
    try {
      const subscription = await this.getSubscription(userId)

      // If no subscription record exists, user is free
      if (!subscription) {
        return false
      }

      // Check if subscription is active and premium
      return subscription.status === "active" && subscription.plan_name?.toLowerCase().includes("premium")
    } catch (error) {
      console.error("Error checking premium access:", error)
      return false
    }
  }
}

export const subscriptionService = new SubscriptionService()
