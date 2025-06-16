"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Check, Star, Zap } from "lucide-react"
import { useAuthContext } from "@/components/auth/auth-provider"
import { useLanguage } from "@/lib/i18n/context"
import { motion } from "framer-motion"
import Link from "next/link"

export default function PricingPage() {
  const { user } = useAuthContext()
  const { t } = useLanguage()
  const [loading, setLoading] = useState<string | null>(null)

  const handleSubscribe = async (variantId: string, plan: string) => {
    if (!user) {
      // Redirect to login
      window.location.href = "/login?redirect=/pricing"
      return
    }

    try {
      setLoading(plan)

      const response = await fetch("/api/create-checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          variantId,
          plan,
        }),
      })

      const data = await response.json()

      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl
      } else {
        throw new Error("Failed to create checkout")
      }
    } catch (error) {
      console.error("Subscription error:", error)
      alert("Failed to start subscription process. Please try again.")
    } finally {
      setLoading(null)
    }
  }

  const plans = [
    {
      name: "Free",
      price: "$0",
      period: "forever",
      description: "Perfect for getting started with meal planning",
      features: [
        "Basic recipe search",
        "Save up to 10 recipes",
        "Simple meal planning",
        "Basic grocery lists",
        "Mobile app access",
      ],
      buttonText: "Get Started",
      buttonVariant: "outline" as const,
      popular: false,
      action: () => (window.location.href = user ? "/recipes" : "/signup"),
    },
    {
      name: "Premium",
      price: "$9.99",
      period: "month",
      description: "Everything you need for complete nutrition management",
      features: [
        "Unlimited recipe access",
        "Advanced meal planning",
        "Smart grocery lists",
        "Nutritional analysis",
        "Custom recipe creation",
        "Export meal plans",
        "Priority support",
      ],
      buttonText: "Start Premium",
      buttonVariant: "default" as const,
      popular: true,
      variantId: process.env.NEXT_PUBLIC_LEMONSQUEEZY_MONTHLY_VARIANT_ID!,
      action: (variantId: string) => handleSubscribe(variantId, "monthly"),
    },
    {
      name: "Premium Annual",
      price: "$99.99",
      period: "year",
      description: "Best value - save 17% with annual billing",
      features: [
        "Everything in Premium",
        "2 months free",
        "Advanced analytics",
        "Recipe recommendations",
        "Meal plan templates",
        "Family sharing (up to 4 members)",
        "Premium support",
      ],
      buttonText: "Start Annual",
      buttonVariant: "default" as const,
      popular: false,
      variantId: process.env.NEXT_PUBLIC_LEMONSQUEEZY_ANNUAL_VARIANT_ID!,
      action: (variantId: string) => handleSubscribe(variantId, "annual"),
    },
  ]

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
        <h1 className="text-4xl font-serif font-bold mb-4">Choose Your Plan</h1>
        <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
          Start your nutrition journey with the perfect plan for your needs
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {plans.map((plan, index) => (
          <motion.div
            key={plan.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="relative"
          >
            {plan.popular && (
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <Badge className="bg-orange-600 text-white px-4 py-1">
                  <Star className="h-3 w-3 mr-1" />
                  Most Popular
                </Badge>
              </div>
            )}

            <Card className={`h-full ${plan.popular ? "border-orange-600 shadow-lg scale-105" : ""}`}>
              <CardHeader className="text-center">
                <CardTitle className="text-2xl font-bold">{plan.name}</CardTitle>
                <CardDescription className="text-sm">{plan.description}</CardDescription>
                <div className="mt-4">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  <span className="text-gray-600 dark:text-gray-400">/{plan.period}</span>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <ul className="space-y-3">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-600 flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  variant={plan.buttonVariant}
                  className={`w-full mt-6 ${
                    plan.buttonVariant === "default" ? "bg-orange-600 hover:bg-orange-700" : ""
                  }`}
                  onClick={() => {
                    if (plan.variantId) {
                      plan.action(plan.variantId)
                    } else {
                      plan.action()
                    }
                  }}
                  disabled={loading === plan.name.toLowerCase()}
                >
                  {loading === plan.name.toLowerCase() ? (
                    <div className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                      Processing...
                    </div>
                  ) : (
                    <>
                      {plan.popular && <Zap className="h-4 w-4 mr-2" />}
                      {plan.buttonText}
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="text-center mt-12"
      >
        <p className="text-gray-600 dark:text-gray-400 mb-4">All plans include a 14-day free trial. Cancel anytime.</p>
        <div className="flex justify-center gap-4 text-sm">
          <Link href="/privacy" className="text-orange-600 hover:underline">
            Privacy Policy
          </Link>
          <Link href="/terms" className="text-orange-600 hover:underline">
            Terms of Service
          </Link>
        </div>
      </motion.div>
    </div>
  )
}
