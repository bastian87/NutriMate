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

interface UsageTrackerProps {
  userId: string
}

export default function UsageTracker({ userId }: UsageTrackerProps) {
  const [usage, setUsage] = useState<UsageLimit | null>(null)
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [isLoading, setIsLoading] = useState(true)

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
  const mealPlans = usage.mealPlans || { used: 0, limit: 1 }
  const groceryLists = usage.groceryLists || { used: 0, limit: 3 }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-orange-600" />
            Usage This Month
          </span>
          {isPremium && (
            <Badge className="bg-orange-100 text-orange-800">
              <Crown className="h-3 w-3 mr-1" />
              Premium
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Meal Plans */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Advanced Meal Plans</span>
            <span className="text-sm text-gray-600">
              {isPremium ? (
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  Unlimited
                </Badge>
              ) : (
                `${mealPlans.used}/${mealPlans.limit}`
              )}
            </span>
          </div>
          {!isPremium && <Progress value={(mealPlans.used / mealPlans.limit) * 100} className="h-2" />}
        </div>

        {/* Grocery Lists */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Grocery Lists</span>
            <span className="text-sm text-gray-600">
              {isPremium ? (
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  Unlimited
                </Badge>
              ) : (
                `${groceryLists.used}/${groceryLists.limit}`
              )}
            </span>
          </div>
          {!isPremium && <Progress value={(groceryLists.used / groceryLists.limit) * 100} className="h-2" />}
        </div>

        {/* Premium Features */}
        {!isPremium && (
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
            <h4 className="font-medium text-orange-900 mb-1">Unlock Premium Features</h4>
            <ul className="text-sm text-orange-800 space-y-1">
              <li>• Advanced meal planning (4 weeks)</li>
              <li>• Smart grocery lists</li>
              <li>• Personalized nutrition insights</li>
              <li>• Custom dietary restrictions</li>
            </ul>
            <Link href="/pricing">
              <Button className="w-full mt-3 bg-orange-600 hover:bg-orange-700" size="sm">
                <Crown className="h-4 w-4 mr-2" />
                Upgrade to Premium
              </Button>
            </Link>
          </div>
        )}

        {/* Subscription Info */}
        <div className="flex items-center gap-2 text-xs text-gray-500 pt-2 border-t">
          <Calendar className="h-3 w-3" />
          <span>
            {subscription.plan === "premium"
              ? `Premium until ${new Date(subscription.currentPeriodEnd).toLocaleDateString()}`
              : "Free plan"}
          </span>
        </div>
      </CardContent>
    </Card>
  )
}
