// Enhanced subscription service without AI features

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
  mealPlans: {
    used: number
    limit: number
  }
  groceryLists: {
    used: number
    limit: number
  }
  nutritionTracking: {
    enabled: boolean
  }
}

// Mock subscription data - in production, this would be in your database
const mockSubscriptions: Record<string, Subscription> = {
  user1: {
    id: "sub_1",
    userId: "user1",
    plan: "free",
    status: "active",
    currentPeriodStart: new Date(),
    currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    cancelAtPeriodEnd: false,
    trialEnd: null,
    billingCycle: "monthly",
    amount: 0,
  },
}

// Mock usage data - in production, this would be in your database
const mockUsage: Record<string, UsageLimit> = {
  user1: {
    mealPlans: {
      used: 1,
      limit: 1, // Free users get 1 week meal planning
    },
    groceryLists: {
      used: 0,
      limit: 3, // Free users get 3 grocery lists
    },
    nutritionTracking: {
      enabled: false, // Premium feature
    },
  },
}

export async function getUserSubscription(userId: string): Promise<Subscription | null> {
  // In a real app, this would fetch from your database
  return (
    mockSubscriptions[userId] || {
      id: `sub_${userId}`,
      userId,
      plan: "free",
      status: "active",
      currentPeriodStart: new Date(),
      currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      cancelAtPeriodEnd: false,
      trialEnd: null,
      billingCycle: "monthly",
      amount: 0,
    }
  )
}

export async function getUserUsage(userId: string): Promise<UsageLimit | null> {
  // In a real app, this would fetch from your database
  return (
    mockUsage[userId] || {
      mealPlans: {
        used: 0,
        limit: 1,
      },
      groceryLists: {
        used: 0,
        limit: 3,
      },
      nutritionTracking: {
        enabled: false,
      },
    }
  )
}

export async function checkFeatureAccess(userId: string, feature: string): Promise<boolean> {
  const subscription = await getUserSubscription(userId)
  const usage = await getUserUsage(userId)

  if (!subscription) return false

  // Premium users have unlimited access
  if (subscription.plan === "premium" && (subscription.status === "active" || subscription.status === "trialing")) {
    return true
  }

  // Free users have limited access
  if (subscription.plan === "free") {
    switch (feature) {
      case "advanced_meal_planning":
        return false // Premium only
      case "unlimited_grocery_lists":
        return usage ? usage.groceryLists.used < usage.groceryLists.limit : false
      case "nutrition_insights":
        return false // Premium only
      case "custom_dietary_restrictions":
        return false // Premium only
      case "meal_prep_optimization":
        return false // Premium only
      case "family_meal_planning":
        return false // Premium only
      case "export_features":
        return false // Premium only
      case "advanced_search_filters":
        return false // Premium only
      case "nutrition_goal_tracking":
        return false // Premium only
      default:
        return true // Basic features are free
    }
  }

  return false
}

export async function incrementUsage(userId: string, feature: string): Promise<void> {
  // In a real app, this would update your database
  const usage = mockUsage[userId]
  if (!usage) return

  switch (feature) {
    case "meal_plans":
      usage.mealPlans.used += 1
      break
    case "grocery_lists":
      usage.groceryLists.used += 1
      break
  }

  // Save to localStorage for demo purposes
  if (typeof window !== "undefined") {
    localStorage.setItem(`usage_${userId}`, JSON.stringify(usage))
  }
}

export async function createSubscription(
  userId: string,
  plan: "premium",
  billingCycle: "monthly" | "annual",
  stripeCustomerId?: string,
  stripeSubscriptionId?: string,
): Promise<Subscription> {
  // In a real app, this would create a subscription in your database
  const subscription: Subscription = {
    id: `sub_${Date.now()}`,
    userId,
    plan,
    status: "trialing", // Start with trial
    currentPeriodStart: new Date(),
    currentPeriodEnd: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days trial
    cancelAtPeriodEnd: false,
    trialEnd: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    billingCycle,
    amount: billingCycle === "monthly" ? 4.99 : 49.99,
    stripeCustomerId,
    stripeSubscriptionId,
  }

  mockSubscriptions[userId] = subscription
  return subscription
}

export async function cancelSubscription(userId: string): Promise<void> {
  // In a real app, this would cancel via Stripe and update your database
  const subscription = mockSubscriptions[userId]
  if (subscription) {
    subscription.cancelAtPeriodEnd = true
  }
}

export async function reactivateSubscription(userId: string): Promise<void> {
  // In a real app, this would reactivate via Stripe and update your database
  const subscription = mockSubscriptions[userId]
  if (subscription) {
    subscription.cancelAtPeriodEnd = false
  }
}

export async function updateSubscriptionStatus(
  userId: string,
  status: Subscription["status"],
  stripeData?: any,
): Promise<void> {
  // In a real app, this would update your database
  const subscription = mockSubscriptions[userId]
  if (subscription) {
    subscription.status = status
    if (stripeData) {
      subscription.stripeCustomerId = stripeData.customer
      subscription.stripeSubscriptionId = stripeData.subscription
    }
  }
}
