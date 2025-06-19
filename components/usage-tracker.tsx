"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Sparkles, Calendar, Crown } from "lucide-react"
import { getUserUsage, getUserSubscription } from "@/lib/subscription-service"
import type { UsageLimit, Subscription } from "@/lib/subscription-service"
import Link from "next/link"
import { useLanguage } from "@/lib/i18n/context"

interface UsageTrackerProps {
  userId: string
}

export default function UsageTracker({ userId }: UsageTrackerProps) {
  const [usage, setUsage] = useState<UsageLimit | null>(null)
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const { t } = useLanguage()

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [usageData, subscriptionData] = await Promise.all([getUserUsage(userId), getUserSubscription(userId)])
        setUsage(usageData)
        setSubscription(subscriptionData)
      } catch (error) {
        console.error("Failed to fetch usage data:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [userId])

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-1/3"></div>
            <div className="h-2 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  // If usage or subscription data is missing, show a fallback UI
  if (!usage || !subscription) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-gray-500">
            <p>Unable to load usage data</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const isPremium = subscription.plan === "premium" && subscription.status === "active"

  // Ensure all required properties exist with defaults
  const mealPlans = usage.mealPlans

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-orange-600" />
            {t("usageTracker.usageThisMonth")}
          </span>
          {isPremium && (
            <Badge className="bg-orange-100 text-orange-800">
              <Crown className="h-3 w-3 mr-1" />
              {t("usageTracker.premium")}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Meal Plans */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">{t("usageTracker.advancedMealPlans")}</span>
            <span className="text-sm text-gray-600">
              {isPremium ? (
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  {t("usageTracker.unlimited")}
                </Badge>
              ) : (
                `${mealPlans.created}/${mealPlans.maxCreated} ${t("usageTracker.used")}`
              )}
            </span>
          </div>
          {!isPremium && <Progress value={(mealPlans.created / mealPlans.maxCreated) * 100} className="h-2" />}
        </div>

        {/* Premium Features */}
        {!isPremium && (
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
            <h4 className="font-medium text-orange-900 mb-1">{t("usageTracker.unlockPremium")}</h4>
            <ul className="text-sm text-orange-800 space-y-1">
              <li>{t("usageTracker.advancedMealPlansDesc")}</li>
            </ul>
            <Link href="/pricing">
              <Button className="w-full mt-3 bg-orange-600 hover:bg-orange-700" size="sm">
                <Crown className="h-4 w-4 mr-2" />
                {t("pricing.upgradeToPremium")}
              </Button>
            </Link>
          </div>
        )}

        {/* Subscription Info */}
        <div className="flex items-center gap-2 text-xs text-gray-500 pt-2 border-t">
          <Calendar className="h-3 w-3" />
          <span>
            {subscription.plan === "premium"
              ? t("subscription.premiumPlan")
              : t("subscription.freePlan")}
          </span>
        </div>
      </CardContent>
    </Card>
  )
}
