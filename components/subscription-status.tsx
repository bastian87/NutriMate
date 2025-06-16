"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Crown, Calendar, CreditCard, Settings } from "lucide-react"

interface SubscriptionStatusProps {
  userId?: string
}

// Mock subscription data
const mockSubscription = {
  plan: "premium",
  status: "active",
  currentPeriodEnd: new Date(Date.now() + 23 * 24 * 60 * 60 * 1000), // 23 days from now
  cancelAtPeriodEnd: false,
  trialEnd: null,
  billingCycle: "monthly" as "monthly" | "annual",
  amount: 4.99,
}

export default function SubscriptionStatus({ userId }: SubscriptionStatusProps) {
  const [subscription, setSubscription] = useState(mockSubscription)
  const [isLoading, setIsLoading] = useState(false)

  const handleCancelSubscription = async () => {
    setIsLoading(true)
    try {
      // In a real app, this would call your API to cancel the subscription
      await new Promise((resolve) => setTimeout(resolve, 1000))
      setSubscription((prev) => ({ ...prev, cancelAtPeriodEnd: true }))
      alert("Subscription will be cancelled at the end of the current billing period.")
    } catch (error) {
      alert("Failed to cancel subscription. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleReactivateSubscription = async () => {
    setIsLoading(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000))
      setSubscription((prev) => ({ ...prev, cancelAtPeriodEnd: false }))
      alert("Subscription reactivated successfully!")
    } catch (error) {
      alert("Failed to reactivate subscription. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusBadge = () => {
    if (subscription.cancelAtPeriodEnd) {
      return (
        <Badge variant="destructive" className="bg-yellow-100 text-yellow-800">
          Cancelling
        </Badge>
      )
    }
    if (subscription.status === "active") {
      return <Badge className="bg-green-100 text-green-800">Active</Badge>
    }
    return <Badge variant="secondary">{subscription.status}</Badge>
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Crown className="h-5 w-5 text-orange-600" />
          Subscription Status
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold capitalize">{subscription.plan} Plan</h3>
            <p className="text-sm text-gray-600">
              ${subscription.amount}/{subscription.billingCycle === "monthly" ? "month" : "year"}
            </p>
          </div>
          {getStatusBadge()}
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="h-4 w-4 text-gray-500" />
            <span>
              {subscription.cancelAtPeriodEnd
                ? `Expires on ${subscription.currentPeriodEnd.toLocaleDateString()}`
                : `Renews on ${subscription.currentPeriodEnd.toLocaleDateString()}`}
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <CreditCard className="h-4 w-4 text-gray-500" />
            <span>Billing cycle: {subscription.billingCycle}</span>
          </div>
        </div>

        {subscription.cancelAtPeriodEnd ? (
          <div className="space-y-3">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <p className="text-sm text-yellow-800">
                Your subscription will end on {subscription.currentPeriodEnd.toLocaleDateString()}. You'll lose access
                to Premium features after this date.
              </p>
            </div>
            <Button
              onClick={handleReactivateSubscription}
              disabled={isLoading}
              className="w-full bg-orange-600 hover:bg-orange-700"
            >
              {isLoading ? "Processing..." : "Reactivate Subscription"}
            </Button>
          </div>
        ) : (
          <div className="space-y-2">
            <Button variant="outline" className="w-full" disabled={isLoading}>
              <Settings className="h-4 w-4 mr-2" />
              Manage Billing
            </Button>
            <Button
              variant="outline"
              onClick={handleCancelSubscription}
              disabled={isLoading}
              className="w-full text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              {isLoading ? "Processing..." : "Cancel Subscription"}
            </Button>
          </div>
        )}

        <div className="text-xs text-gray-500 pt-2 border-t">
          <p>
            Need help?{" "}
            <a href="/support" className="text-orange-600 hover:underline">
              Contact support
            </a>
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
