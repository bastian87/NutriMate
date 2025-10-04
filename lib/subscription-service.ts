// Enhanced subscription service with proper free/premium feature gating
import { supabase } from "@/lib/supabase/client"
import { 
  FeatureKey, 
  FeatureAccess, 
  USAGE_LIMITS, 
  getFeatureAccess, 
  normalizeFeatureKey,
  isPremiumFeature,
  isFreeFeature
} from "@/lib/entitlements"

export interface Subscription {
  id: string
  userId: string
  plan: "free" | "premium"
  status: "active" | "cancelled" | "past_due" | "trialing"
  currentPeriodStart: Date
  currentPeriodEnd: Date
  cancelAtPeriodEnd: boolean
  trialEnd: Date | null
  billingCycle: "monthly" | "annual"
  amount: number
  stripeCustomerId?: string
  stripeSubscriptionId?: string
}

export interface UsageLimit {
  favorites: {
    saved: number
    maxSaved: number
  }
  customRecipes: {
    created: number
    maxCreated: number
  }
  exports: {
    used: number
    maxExports: number
  }
}

export async function getUserSubscription(userId: string): Promise<Subscription | null> {
  try {
    const { data, error } = await supabase
      .from("user_subscriptions")
      .select("*")
      .eq("user_id", userId)
      .eq("status", "active")
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        // No subscription found
        return null
      }
      throw error
    }

    if (!data) {
      return null
    }

    // Convertir los datos de la base de datos al formato esperado
    const subscription: Subscription = {
      id: data.id,
      userId: data.user_id,
      plan: "premium", // Si tiene suscripción activa, es premium
      status: data.status as "active" | "cancelled" | "past_due" | "trialing",
      currentPeriodStart: new Date(data.created_at),
      currentPeriodEnd: data.renews_at ? new Date(data.renews_at) : new Date(data.created_at),
      cancelAtPeriodEnd: data.cancel_at_period_end || false,
      trialEnd: data.trial_ends_at ? new Date(data.trial_ends_at) : null,
      billingCycle: data.billing_cycle as "monthly" | "annual" || "monthly",
      amount: data.amount || 4.99,
      stripeCustomerId: data.customer_id,
      stripeSubscriptionId: data.subscription_id
    }

    return subscription
  } catch (error) {
    console.error("Error fetching user subscription:", error)
    return null
  }
}

export async function getUserUsage(userId: string): Promise<UsageLimit | null> {
  // In production, this would fetch from your database
  // Return default free tier limits using centralized constants
  return {
    favorites: {
      saved: 0,
      maxSaved: USAGE_LIMITS.favorites.max,
    },
    customRecipes: {
      created: 0,
      maxCreated: USAGE_LIMITS.customRecipes.max,
    },
    exports: {
      used: 0,
      maxExports: USAGE_LIMITS.exports.max,
    },
  }
}

export async function checkFeatureAccess(userId: string, feature: string): Promise<boolean> {
  const subscription = await getUserSubscription(userId)
  const usage = await getUserUsage(userId)
  
  // Normalize the feature key to handle legacy mappings
  const normalizedFeature = normalizeFeatureKey(feature)
  
  // Use centralized feature access logic
  const isPremium = !!(subscription && subscription.plan === "premium" && (subscription.status === "active" || subscription.status === "trialing"))
  const access = getFeatureAccess(normalizedFeature, isPremium, usage || undefined)
  
  return access.canAccess
}

export async function incrementUsage(userId: string, feature: string): Promise<void> {
  // In production, this would update your database
  // For now, this is a no-op but the structure is ready
  return
}

export async function canUserAccessFeature(
  userId: string,
  feature: string,
): Promise<FeatureAccess> {
  const subscription = await getUserSubscription(userId)
  const usage = await getUserUsage(userId)
  
  // Normalize the feature key to handle legacy mappings
  const normalizedFeature = normalizeFeatureKey(feature)
  
  // Use centralized feature access logic
  const isPremium = !!(subscription && subscription.plan === "premium" && (subscription.status === "active" || subscription.status === "trialing"))
  
  return getFeatureAccess(normalizedFeature, isPremium, usage || undefined)
}

export async function createSubscription(
  userId: string,
  plan: "premium",
  billingCycle: "monthly" | "annual",
  stripeCustomerId?: string,
  stripeSubscriptionId?: string,
): Promise<Subscription> {
  // In production, this would create a subscription in your database
  const subscription: Subscription = {
    id: `sub_${Date.now()}`,
    userId,
    plan,
    status: "active",
    currentPeriodStart: new Date(),
    currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    cancelAtPeriodEnd: false,
    trialEnd: null,
    billingCycle,
    amount: billingCycle === "monthly" ? 2.99 : 29.99,
    stripeCustomerId,
    stripeSubscriptionId,
  }

  return subscription
}

export async function cancelSubscription(userId: string): Promise<void> {
  // In production, this would cancel via payment provider and update your database
  return
}

export async function reactivateSubscription(userId: string): Promise<void> {
  // In production, this would reactivate via payment provider and update your database
  return
}

export async function updateSubscriptionStatus(
  userId: string,
  status: Subscription["status"],
  stripeData?: any,
): Promise<void> {
  // In production, this would update your database
  return
}
