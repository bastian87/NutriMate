// Enhanced subscription service with proper free/premium feature gating

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
  recipes: {
    saved: number
    maxSaved: number
  }
  mealPlans: {
    created: number
    maxCreated: number
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
  // In production, this would fetch from your database
  // For now, return null which means user is on free plan
  return null
}

export async function getUserUsage(userId: string): Promise<UsageLimit | null> {
  // In production, this would fetch from your database
  // Return default free tier limits
  return {
    recipes: {
      saved: 0,
      maxSaved: 10, // Free users can save up to 10 recipes
    },
    mealPlans: {
      created: 0,
      maxCreated: 1, // Free users can create up to 1 meal plan
    },
    customRecipes: {
      created: 0,
      maxCreated: 0, // Free users can create up to 3 custom recipes
    },
    exports: {
      used: 0,
      maxExports: 0, // Free users cannot export (premium only)
    },
  }
}

export async function checkFeatureAccess(userId: string, feature: string): Promise<boolean> {
  const subscription = await getUserSubscription(userId)
  const usage = await getUserUsage(userId)

  // If user has premium subscription and it's active, give full access
  if (
    subscription &&
    subscription.plan === "premium" &&
    (subscription.status === "active" || subscription.status === "trialing")
  ) {
    return true
  }

  // For free users (no subscription or free plan), check feature limitations
  switch (feature) {
    // PREMIUM ONLY FEATURES - Free users cannot access these
    case "export_meal_plans":
    case "priority_support":
    case "advanced_nutrition_analysis":
    case "unlimited_meal_plans":
    case "unlimited_custom_recipes":
    case "unlimited_saved_recipes":
    case "advanced_meal_planning":
    case "smart_grocery_lists":
      return false

    // LIMITED FREE FEATURES - Free users have usage limits
    case "save_recipes":
      return usage ? usage.recipes.saved < usage.recipes.maxSaved : false
    case "create_meal_plans":
      return usage ? usage.mealPlans.created < usage.mealPlans.maxCreated : false
    case "create_custom_recipes":
      return usage ? usage.customRecipes.created < usage.customRecipes.maxCreated : false

    // BASIC FREE FEATURES - Always available to free users
    case "browse_recipes":
    case "basic_search":
    case "view_nutrition_info":
    case "basic_meal_planning":
    case "basic_grocery_lists":
      return true

    default:
      return false // Default to restricted for unknown features
  }
}

export async function incrementUsage(userId: string, feature: string): Promise<void> {
  // In production, this would update your database
  // For now, this is a no-op but the structure is ready
  return
}

export async function canUserAccessFeature(
  userId: string,
  feature: string,
): Promise<{
  canAccess: boolean
  reason?: string
  upgradeRequired?: boolean
}> {
  const subscription = await getUserSubscription(userId)
  const usage = await getUserUsage(userId)

  // Premium users have full access
  if (
    subscription &&
    subscription.plan === "premium" &&
    (subscription.status === "active" || subscription.status === "trialing")
  ) {
    return { canAccess: true }
  }

  // Check free tier limitations
  switch (feature) {
    case "export_meal_plans":
      return {
        canAccess: false,
        reason: "Export functionality is available for Premium users only",
        upgradeRequired: true,
      }
    case "priority_support":
      return {
        canAccess: false,
        reason: "Priority support is available for Premium users only",
        upgradeRequired: true,
      }
    case "save_recipes":
      if (usage && usage.recipes.saved >= usage.recipes.maxSaved) {
        return {
          canAccess: false,
          reason: `You've reached the limit of ${usage.recipes.maxSaved} saved recipes. Upgrade to Premium for unlimited saves.`,
          upgradeRequired: true,
        }
      }
      return { canAccess: true }
    case "create_meal_plans":
      if (usage && usage.mealPlans.created >= usage.mealPlans.maxCreated) {
        return {
          canAccess: false,
          reason: `You've reached the limit of ${usage.mealPlans.maxCreated} meal plans. Upgrade to Premium for unlimited meal plans.`,
          upgradeRequired: true,
        }
      }
      return { canAccess: true }
    case "create_custom_recipes":
      if (usage && usage.customRecipes.created >= usage.customRecipes.maxCreated) {
        return {
          canAccess: false,
          reason: `You've reached the limit of ${usage.customRecipes.maxCreated} custom recipes. Upgrade to Premium for unlimited custom recipes.`,
          upgradeRequired: true,
        }
      }
      return { canAccess: true }
    default:
      return { canAccess: true }
  }
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
    amount: billingCycle === "monthly" ? 4.99 : 49.99,
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
