"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, Crown, Check } from "lucide-react"
import Link from "next/link"
import PaymentMethods from "@/components/payment-methods"

export default function CheckoutPage() {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "annual">("monthly")
  const [userEmail] = useState("demo@example.com") // In real app, get from auth
  const [userId] = useState("user1") // In real app, get from auth

  const monthlyPrice = 4.99
  const annualPrice = 49.99
  const annualSavings = (monthlyPrice * 12 - annualPrice).toFixed(2)

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link href="/pricing" className="inline-flex items-center text-orange-600 hover:text-orange-700 mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Pricing
          </Link>
          <h1 className="text-3xl font-serif font-bold">Complete Your Subscription</h1>
          <p className="text-gray-600">Join thousands of users who love NutriMate Premium</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Crown className="h-5 w-5 text-orange-600" />
                  Order Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Plan Selection */}
                <div className="space-y-3">
                  <div
                    className={`border rounded-lg p-3 cursor-pointer transition-colors ${
                      billingCycle === "monthly" ? "border-orange-500 bg-orange-50" : "border-gray-200"
                    }`}
                    onClick={() => setBillingCycle("monthly")}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Monthly Plan</p>
                        <p className="text-sm text-gray-600">Billed monthly</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">${monthlyPrice}/mo</p>
                      </div>
                    </div>
                  </div>

                  <div
                    className={`border rounded-lg p-3 cursor-pointer transition-colors ${
                      billingCycle === "annual" ? "border-orange-500 bg-orange-50" : "border-gray-200"
                    }`}
                    onClick={() => setBillingCycle("annual")}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium">Annual Plan</p>
                          <Badge variant="secondary" className="bg-green-100 text-green-800 text-xs">
                            Save ${annualSavings}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600">Billed annually</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">${(annualPrice / 12).toFixed(2)}/mo</p>
                        <p className="text-xs text-gray-500">${annualPrice}/year</p>
                      </div>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Features */}
                <div>
                  <h3 className="font-medium mb-3">What's included:</h3>
                  <ul className="space-y-2 text-sm">
                    {[
                      "Unlimited AI recipe suggestions",
                      "Advanced meal planning (4 weeks)",
                      "Smart grocery lists",
                      "Personalized nutrition insights",
                      "Custom dietary restrictions",
                      "Priority customer support",
                    ].map((feature, index) => (
                      <li key={index} className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-green-500" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <Separator />

                {/* Total */}
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>${billingCycle === "monthly" ? monthlyPrice : annualPrice}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tax</span>
                    <span>$0.00</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span>${billingCycle === "monthly" ? monthlyPrice : annualPrice}</span>
                  </div>
                  <p className="text-xs text-gray-500">
                    {billingCycle === "monthly" ? "Billed monthly" : "Billed annually"}
                  </p>
                </div>

                {/* Trial Notice */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p className="text-sm text-blue-800">
                    <strong>7-day free trial</strong> - You won't be charged until your trial ends. Cancel anytime.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Payment Methods */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Choose Payment Method</CardTitle>
                <p className="text-sm text-gray-600">
                  Select your preferred payment method to start your 7-day free trial
                </p>
              </CardHeader>
              <CardContent>
                <PaymentMethods billingCycle={billingCycle} userEmail={userEmail} userId={userId} />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
