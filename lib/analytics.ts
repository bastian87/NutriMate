// Analytics service for tracking user behavior and success metrics

interface AnalyticsEvent {
  event: string
  properties?: Record<string, any>
  userId?: string
}

class Analytics {
  private isInitialized = false

  // Initialize analytics (Google Analytics 4)
  init() {
    if (typeof window === "undefined" || this.isInitialized) return

    // Google Analytics 4 - hardcoded for now
    const GA_MEASUREMENT_ID = "G-SCX9Q55CJF"

    if (GA_MEASUREMENT_ID) {
      // Check if gtag is already available (loaded by Next.js Script)
      if ((window as any).gtag) {
        this.isInitialized = true
        return
      }

      // Fallback: load manually if not loaded by Script
      const script = document.createElement("script")
      script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`
      script.async = true
      document.head.appendChild(script)

      window.dataLayer = window.dataLayer || []
      function gtag(...args: any[]) {
        window.dataLayer.push(args)
      }
      gtag("js", new Date())
      gtag("config", GA_MEASUREMENT_ID)

      // Make gtag available globally
      ;(window as any).gtag = gtag
    }

    this.isInitialized = true
  }

  // Track custom events
  track(event: string, properties?: Record<string, any>, userId?: string) {
    // Google Analytics
    if (typeof window !== "undefined" && (window as any).gtag) {
      ;(window as any).gtag("event", event, {
        ...properties,
        user_id: userId,
      })
    }

    // Send to our custom analytics endpoint
    this.sendToCustomAnalytics({ event, properties, userId })

    // Console log in development
    if (process.env.NODE_ENV === "development") {
      console.log("📊 Analytics Event:", { event, properties, userId })
    }
  }

  // Send to custom analytics endpoint
  private async sendToCustomAnalytics({ event, properties, userId }: AnalyticsEvent) {
    try {
      await fetch("/api/analytics", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          event,
          properties: {
            ...properties,
            timestamp: new Date().toISOString(),
            url: typeof window !== "undefined" ? window.location.href : "",
            user_agent: typeof navigator !== "undefined" ? navigator.userAgent : "",
          },
          userId,
        }),
      })
    } catch (error) {
      console.error("Analytics error:", error)
    }
  }

  // Page view tracking
  pageView(path: string, userId?: string) {
    this.track("page_view", { path }, userId)
  }

  // User events
  userSignUp(userId: string, method = "email") {
    this.track("user_signup", { method }, userId)
  }

  userSignIn(userId: string, method = "email") {
    this.track("user_signin", { method }, userId)
  }

  userSignOut(userId: string) {
    this.track("user_signout", {}, userId)
  }

  // Recipe events
  recipeView(recipeId: string, recipeName: string, userId?: string) {
    this.track("recipe_view", { recipe_id: recipeId, recipe_name: recipeName }, userId)
  }

  recipeFavorite(recipeId: string, recipeName: string, action: "add" | "remove", userId?: string) {
    this.track(
      "recipe_favorite",
      {
        recipe_id: recipeId,
        recipe_name: recipeName,
        action,
      },
      userId,
    )
  }

  recipeRate(recipeId: string, rating: number, userId?: string) {
    this.track("recipe_rate", { recipe_id: recipeId, rating }, userId)
  }

  recipeSearch(query: string, resultsCount: number, userId?: string) {
    this.track("recipe_search", { query, results_count: resultsCount }, userId)
  }

  // Grocery list events
  groceryListCreate(userId?: string) {
    this.track("grocery_list_create", {}, userId)
  }

  groceryListAddItem(itemName: string, source: "manual" | "recipe", userId?: string) {
    this.track("grocery_list_add_item", { item_name: itemName, source }, userId)
  }

  groceryListAddRecipe(recipeId: string, itemCount: number, userId?: string) {
    this.track("grocery_list_add_recipe", { recipe_id: recipeId, item_count: itemCount }, userId)
  }

  groceryListComplete(itemCount: number, userId?: string) {
    this.track("grocery_list_complete", { item_count: itemCount }, userId)
  }

  // Subscription events
  subscriptionStart(plan: string, billingCycle: string, amount: number, userId?: string) {
    this.track("subscription_start", { plan, billing_cycle: billingCycle, amount }, userId)
  }

  subscriptionCancel(plan: string, userId?: string) {
    this.track("subscription_cancel", { plan }, userId)
  }

  subscriptionUpgrade(fromPlan: string, toPlan: string, userId?: string) {
    this.track("subscription_upgrade", { from_plan: fromPlan, to_plan: toPlan }, userId)
  }

  // Feature usage
  featureUsed(feature: string, context?: string, userId?: string) {
    this.track("feature_used", { feature, context }, userId)
  }

  premiumFeatureBlocked(feature: string, userId?: string) {
    this.track("premium_feature_blocked", { feature }, userId)
  }

  // Engagement events
  sessionStart(userId?: string) {
    this.track("session_start", {}, userId)
  }

  sessionEnd(duration: number, userId?: string) {
    this.track("session_end", { duration_seconds: duration }, userId)
  }
}

// Export singleton instance
export const analytics = new Analytics()

// Initialize analytics on import
if (typeof window !== "undefined") {
  analytics.init()
}

// Declare global gtag for TypeScript
declare global {
  interface Window {
    dataLayer: any[]
    gtag: (...args: any[]) => void
  }
}
