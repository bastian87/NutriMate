"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Crown, AlertTriangle, X } from "lucide-react"
import Link from "next/link"
import { useAuthContext } from "@/components/auth/auth-provider"
import { getUserUsage, type UsageLimit } from "@/lib/subscription-service"

interface UsageLimitBannerProps {
  feature: "recipes" | "mealPlans" | "customRecipes"
  className?: string
}

export function UsageLimitBanner({ feature, className }: UsageLimitBannerProps) {
  const { user } = useAuthContext()
  const [usage, setUsage] = useState<UsageLimit | null>(null)
  const [dismissed, setDismissed] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchUsage = async () => {
      if (!user) return

      try {
        const userUsage = await getUserUsage(user.id)
        setUsage(userUsage)
      } catch (error) {
        console.error("Error fetching usage:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchUsage()
  }, [user])

  if (loading || !usage || dismissed) return null

  const getFeatureData = () => {
    switch (feature) {
      case "recipes":
        return {
          current: usage.recipes.saved,
          max: usage.recipes.maxSaved,
          label: "Saved Recipes",
          upgradeText: "Save unlimited recipes",
        }
      case "mealPlans":
        return {
          current: usage.mealPlans.created,
          max: usage.mealPlans.maxCreated,
          label: "Meal Plans",
          upgradeText: "Create unlimited meal plans",
        }
      case "customRecipes":
        return {
          current: usage.customRecipes.created,
          max: usage.customRecipes.maxCreated,
          label: "Custom Recipes",
          upgradeText: "Create unlimited custom recipes",
        }
    }
  }

  const featureData = getFeatureData()
  const percentage = (featureData.current / featureData.max) * 100
  const isNearLimit = percentage >= 80
  const isAtLimit = featureData.current >= featureData.max

  if (!isNearLimit) return null

  return (
    <Card className={`border-orange-200 bg-gradient-to-r from-orange-50 to-yellow-50 ${className}`}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              {isAtLimit ? (
                <AlertTriangle className="h-5 w-5 text-orange-600" />
              ) : (
                <Crown className="h-5 w-5 text-orange-600" />
              )}
              <h3 className="font-semibold text-gray-900">{isAtLimit ? "Limit Reached" : "Approaching Limit"}</h3>
            </div>

            <p className="text-sm text-gray-600 mb-3">
              {isAtLimit
                ? `You've used all ${featureData.max} of your ${featureData.label.toLowerCase()}.`
                : `You've used ${featureData.current} of ${featureData.max} ${featureData.label.toLowerCase()}.`}
            </p>

            <div className="mb-3">
              <div className="flex justify-between text-xs text-gray-500 mb-1">
                <span>{featureData.current} used</span>
                <span>{featureData.max} limit</span>
              </div>
              <Progress
                value={percentage}
                className="h-2"
                // @ts-ignore
                style={{
                  "--progress-background": isAtLimit ? "#dc2626" : percentage >= 80 ? "#ea580c" : "#059669",
                }}
              />
            </div>

            <div className="flex gap-2">
              <Link href="/pricing">
                <Button size="sm" className="bg-orange-600 hover:bg-orange-700">
                  <Crown className="h-4 w-4 mr-1" />
                  Upgrade to Premium
                </Button>
              </Link>
            </div>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setDismissed(true)}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
