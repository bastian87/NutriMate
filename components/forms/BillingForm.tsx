"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { CreditCard, DollarSign } from "lucide-react"
import { useLanguage } from "@/lib/i18n/context"

interface BillingFormProps {
  user: any
}

export default function BillingForm({ user }: BillingFormProps) {
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  // Mock subscription data
  const subscription = {
    plan: "Premium",
    status: "active",
    nextBilling: "2024-02-15",
    amount: "$9.99/month",
  }

  const handleUpdatePayment = async () => {
    setLoading(true)
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      toast({
        title: "Payment method updated",
        description: "Your payment method has been successfully updated.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update payment method. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleCancelSubscription = async () => {
    setLoading(true)
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      toast({
        title: "Subscription cancelled",
        description: "Your subscription has been cancelled. You'll retain access until the end of your billing period.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to cancel subscription. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Current Subscription
          </CardTitle>
          <CardDescription>Manage your subscription and billing information.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium">Plan</h3>
              <p className="text-sm text-muted-foreground">{subscription.plan}</p>
            </div>
            <Badge variant={subscription.status === "active" ? "default" : "secondary"}>{subscription.status}</Badge>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium">Amount</h3>
              <p className="text-sm text-muted-foreground">{subscription.amount}</p>
            </div>
            <div className="text-right">
              <h3 className="font-medium">Next Billing</h3>
              <p className="text-sm text-muted-foreground">{subscription.nextBilling}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Payment Method
          </CardTitle>
          <CardDescription>Update your payment information.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="cardNumber">Card Number</Label>
                <Input id="cardNumber" placeholder="**** **** **** 1234" disabled />
              </div>
              <div className="space-y-2">
                <Label htmlFor="expiryDate">Expiry Date</Label>
                <Input id="expiryDate" placeholder="MM/YY" disabled />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="cvv">CVV</Label>
                <Input id="cvv" placeholder="***" disabled />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cardName">Name on Card</Label>
                <Input id="cardName" placeholder="John Doe" disabled />
              </div>
            </div>

            <Button onClick={handleUpdatePayment} disabled={loading}>
              {loading ? "Updating..." : "Update Payment Method"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-red-600">Danger Zone</CardTitle>
          <CardDescription>Irreversible actions for your subscription.</CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="destructive" onClick={handleCancelSubscription} disabled={loading}>
            {loading ? "Cancelling..." : "Cancel Subscription"}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
