"use client"

import { useEffect } from "react"
import { analytics } from "@/lib/analytics"
import { useAuthContext } from "@/components/auth/auth-provider"
import { usePathname } from "next/navigation"

export function useAnalytics() {
  const { user } = useAuthContext()
  const pathname = usePathname()

  // Track page views
  useEffect(() => {
    analytics.pageView(pathname, user?.id)
  }, [pathname, user?.id])

  // Track session start
  useEffect(() => {
    if (user) {
      analytics.sessionStart(user.id)

      // Track session end on page unload
      const handleBeforeUnload = () => {
        const sessionStart = sessionStorage.getItem("session_start")
        if (sessionStart) {
          const duration = Math.floor((Date.now() - Number.parseInt(sessionStart)) / 1000)
          analytics.sessionEnd(duration, user.id)
        }
      }

      // Store session start time
      sessionStorage.setItem("session_start", Date.now().toString())

      window.addEventListener("beforeunload", handleBeforeUnload)
      return () => window.removeEventListener("beforeunload", handleBeforeUnload)
    }
  }, [user])

  return {
    trackRecipeView: (recipeId: string, recipeName: string) => analytics.recipeView(recipeId, recipeName, user?.id),

    trackRecipeFavorite: (recipeId: string, recipeName: string, action: "add" | "remove") =>
      analytics.recipeFavorite(recipeId, recipeName, action, user?.id),

    trackRecipeSearch: (query: string, resultsCount: number) => analytics.recipeSearch(query, resultsCount, user?.id),

    trackGroceryListAction: (action: string, data?: any) => {
      switch (action) {
        case "create":
          analytics.groceryListCreate(user?.id)
          break
        case "add_item":
          analytics.groceryListAddItem(data.itemName, data.source, user?.id)
          break
        case "add_recipe":
          analytics.groceryListAddRecipe(data.recipeId, data.itemCount, user?.id)
          break
      }
    },

    trackFeatureUsage: (feature: string, context?: string) => analytics.featureUsed(feature, context, user?.id),

    trackPremiumBlock: (feature: string) => analytics.premiumFeatureBlocked(feature, user?.id),
  }
}
