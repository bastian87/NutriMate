"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CreditCard, Loader2, Globe, Shield } from "lucide-react"
import { LEMONSQUEEZY_CONFIG } from "@/lib/stripe"

interface PaymentMethodsProps {
  billingCycle: "monthly" | "annual"
  userEmail: string
  userId: string
}

export default function PaymentMethods({ billingCycle, userEmail, userId }: PaymentMethodsProps) {
  const [isLoading, setIsLoading] = useState(false)

  const handleLemonSqueezyCheckout = async () => {
    setIsLoading(true)
    try {
      const variantId =
        billingCycle === "monthly" ? LEMONSQUEEZY_CONFIG.monthlyVariantId : LEMONSQUEEZY_CONFIG.annualVariantId

      const response = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          variantId,
          userId,
          email: userEmail,
        }),
      })

      const { checkoutUrl } = await response.json()

      if (checkoutUrl) {
        // Redirect to LemonSqueezy checkout
        window.location.href = checkoutUrl
      } else {
        throw new Error("No checkout URL received")
      }
    } catch (error) {
      console.error("LemonSqueezy checkout error:", error)
      alert("Payment failed. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Secure Payment with LemonSqueezy</h3>

      {/* LemonSqueezy Payment */}
      <Card className="cursor-pointer hover:shadow-md transition-shadow">
        <CardContent className="p-6">
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <div className="bg-yellow-100 rounded-full p-4">
                <CreditCard className="h-8 w-8 text-yellow-600" />
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-lg">Complete Your Purchase</h4>
              <p className="text-gray-600">Secure checkout powered by LemonSqueezy</p>
            </div>

            {/* Payment Methods Supported */}
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm font-medium text-gray-700 mb-2">Accepted Payment Methods:</p>
              <div className="flex flex-wrap justify-center gap-2 text-xs text-gray-600">
                <Badge variant="outline">💳 Credit Cards</Badge>
                <Badge variant="outline">🏦 Bank Transfer</Badge>
                <Badge variant="outline">💰 PayPal</Badge>
                <Badge variant="outline">🌍 Local Methods</Badge>
              </div>
            </div>

            {/* Features */}
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-green-500" />
                <span>Secure & Encrypted</span>
              </div>
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4 text-blue-500" />
                <span>Global Support</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-green-500">✓</span>
                <span>Argentina Supported</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-green-500">✓</span>
                <span>Tax Included</span>
              </div>
            </div>

            <Button
              onClick={handleLemonSqueezyCheckout}
              disabled={isLoading}
              className="w-full bg-yellow-500 hover:bg-yellow-600 text-black font-semibold h-12 text-lg"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Creating checkout...
                </div>
              ) : (
                `Suscribirse - $${billingCycle === "monthly" ? "4.99/mo" : "49.99/yr"}`
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Security & Support Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="text-center space-y-2">
          <h5 className="font-medium text-blue-900">Why LemonSqueezy?</h5>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>🌍 Supports 100+ countries including Argentina</li>
            <li>💱 Handles currency conversion automatically</li>
            <li>🧾 Manages all tax compliance for you</li>
            <li>🔒 PCI DSS Level 1 certified security</li>
            <li>📞 24/7 customer support</li>
          </ul>
        </div>
      </div>

      <div className="text-xs text-gray-500 text-center space-y-1">
        <p>🔒 Your payment information is encrypted and secure</p>
        <p>Sin cargos ocultos. Cancela cuando quieras.</p>
        <p>Powered by LemonSqueezy - Trusted by 50,000+ businesses worldwide</p>
      </div>
    </div>
  )
}
