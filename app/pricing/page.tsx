"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Check, Star, Zap, ArrowLeft } from "lucide-react"
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
      name: t("pricing.free"),
      price: "$0",
      period: t("pricing.forever"),
      description: t("pricing.freeDesc"),
      features: [
        t("pricing.basicRecipeSearch"),
        t("pricing.saveUpTo10"),
        t("pricing.simpleMealPlanning"),
        t("pricing.basicGroceryLists"),
        t("pricing.mobileAppAccess"),
      ],
      buttonText: t("pricing.getStarted"),
      buttonVariant: "outline" as const,
      popular: false,
      action: (_variantId?: string) => (window.location.href = user ? "/recipes" : "/signup"),
    },
    {
      name: t("pricing.premium"),
      price: "$4.99",
      period: t("pricing.month"),
      description: t("pricing.premiumDesc"),
      features: [
        t("pricing.unlimitedRecipeAccess"),
        t("pricing.advancedMealPlanning"),
        t("pricing.smartGroceryLists"),
        t("pricing.nutritionalAnalysis"),
        t("pricing.customRecipeCreation"),
        t("pricing.exportMealPlans"),
        t("pricing.prioritySupport"),
      ],
      buttonText: t("pricing.startPremium"),
      buttonVariant: "default" as const,
      popular: true,
      variantId: process.env.NEXT_PUBLIC_LEMONSQUEEZY_MONTHLY_VARIANT_ID!,
      action: (variantId: string) => handleSubscribe(variantId, "monthly"),
    },
    {
      name: t("pricing.premiumAnnual"),
      price: "$49.99",
      period: t("pricing.year"),
      description: t("pricing.premiumAnnualDesc"),
      features: [
        t("pricing.everythingInPremium"),        
        t("pricing.advancedAnalytics"),
        t("pricing.recipeRecommendations"),
        t("pricing.mealPlanTemplates"),
        t("pricing.premiumSupport"),
      ],
      buttonText: t("pricing.startAnnual"),
      buttonVariant: "default" as const,
      popular: false,
      variantId: process.env.NEXT_PUBLIC_LEMONSQUEEZY_ANNUAL_VARIANT_ID!,
      action: (variantId: string) => handleSubscribe(variantId, "annual"),
    },
  ]

  return (
    <div className="container mx-auto px-4 py-8 font-sans">
      {/* Back to Dashboard Button */}
      {user && (
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="mb-6"
        >
          <Link href="/dashboard">
            <Button variant="ghost" className="flex items-center gap-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100">
              <ArrowLeft className="h-4 w-4" />
              {t("pricing.backToDashboard")}
            </Button>
          </Link>
        </motion.div>
      )}

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
        <h1 className="text-3xl font-bold mb-4">{t("pricing.chooseYourPlan")}</h1>
        <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          {t("pricing.startYourJourney")}
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
                <Badge className="bg-orange-600 text-white px-3 py-1 text-xs">
                  <Star className="h-3 w-3 mr-1" />
                  {t("pricing.mostPopular")}
                </Badge>
              </div>
            )}

            <Card className={`h-full ${plan.popular ? "border-orange-600 shadow-lg" : ""}`}>
              <CardHeader className="text-center">
                <CardTitle className="text-2xl font-bold">{plan.name}</CardTitle>
                <CardDescription className="text-sm text-gray-600 dark:text-gray-400">{plan.description}</CardDescription>
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
                  onClick={() => plan.action(plan.variantId ?? "")}
                  disabled={loading === plan.name.toLowerCase()}
                >
                  {loading === plan.name.toLowerCase() ? (
                    <div className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                      {t("pricing.processing")}
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
        <p className="text-gray-600 dark:text-gray-400 mb-4">{t("pricing.allPlansInclude")}</p>
        <div className="flex justify-center gap-4 text-sm">
          <Link href="/privacy-policy" className="text-orange-600 hover:underline">
            {t("pricing.privacy")}
          </Link>
          <Link href="/terms-of-service" className="text-orange-600 hover:underline">
            {t("pricing.terms")}
          </Link>
        </div>
      </motion.div>
    </div>
  )
}
