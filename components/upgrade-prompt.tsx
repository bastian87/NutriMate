"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { X, Crown, Calendar, ShoppingCart, Star, Heart } from "lucide-react"
import Link from "next/link"

interface UpgradePromptProps {
  feature: string
  onClose?: () => void
  trigger?: "limit_reached" | "feature_locked" | "trial_ended"
}

const featureDetails = {
  advanced_meal_planning: {
    icon: Calendar,
    title: "Advanced Meal Planning",
    description: "Create detailed meal plans for up to 4 weeks with nutritional insights.",
    benefit: "Plan your meals like a pro nutritionist",
  },
  unlimited_grocery_lists: {
    icon: ShoppingCart,
    title: "Unlimited Grocery Lists",
    description: "Create and manage unlimited grocery lists with smart organization.",
    benefit: "Never forget an ingredient again",
  },
  nutrition_insights: {
    icon: Star,
    title: "Nutrition Insights",
    description: "Get detailed nutritional analysis and personalized recommendations.",
    benefit: "Optimize your nutrition with detailed tracking",
  },
  custom_dietary_restrictions: {
    icon: Heart,
    title: "Custom Dietary Restrictions",
    description: "Set up custom dietary filters and restrictions for personalized meal planning.",
    benefit: "Meals tailored to your specific needs",
  },
}

export default function UpgradePrompt({ feature, onClose, trigger = "feature_locked" }: UpgradePromptProps) {
  const [isVisible, setIsVisible] = useState(true)

  const handleClose = () => {
    setIsVisible(false)
    onClose?.()
  }

  if (!isVisible) return null

  const details = featureDetails[feature as keyof typeof featureDetails] || featureDetails.advanced_meal_planning
  const IconComponent = details.icon

  const getTriggerMessage = () => {
    switch (trigger) {
      case "limit_reached":
        return "You've reached your free limit"
      case "trial_ended":
        return "Your free trial has ended"
      default:
        return "This is a Premium feature"
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="max-w-md w-full">
        <CardHeader className="relative">
          <Button variant="ghost" size="sm" className="absolute right-2 top-2 h-8 w-8 p-0" onClick={handleClose}>
            <X className="h-4 w-4" />
          </Button>
          <div className="text-center space-y-2">
            <div className="mx-auto bg-orange-100 rounded-full p-3 w-16 h-16 flex items-center justify-center">
              <IconComponent className="h-8 w-8 text-orange-600" />
            </div>
            <CardTitle className="text-xl">{details.title}</CardTitle>
            <Badge variant="secondary" className="bg-orange-100 text-orange-800">
              {getTriggerMessage()}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-gray-600 text-center">{details.description}</p>

          {/* Premium Benefits */}
          <div className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-lg p-4">
            <h4 className="font-semibold text-orange-800 mb-3 flex items-center gap-2">
              <Crown className="h-4 w-4" />
              Premium Benefits
            </h4>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2">
                <span className="text-green-500">✓</span>
                <span>Advanced meal planning (4 weeks)</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-500">✓</span>
                <span>Smart grocery lists with categories</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-500">✓</span>
                <span>Detailed nutrition tracking</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-500">✓</span>
                <span>Custom dietary restrictions</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-500">✓</span>
                <span>Priority customer support</span>
              </li>
            </ul>
          </div>

          {/* Pricing */}
          <div className="text-center space-y-2">
            <div className="flex items-center justify-center gap-2">
              <span className="text-2xl font-bold">$4.99</span>
              <span className="text-gray-600">/month</span>
              <Badge className="bg-green-100 text-green-800">7-day free trial</Badge>
            </div>
            <p className="text-sm text-gray-600">Or save 17% with annual billing ($49.99/year)</p>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2">
            <Link href="/pricing" className="block">
              <Button className="w-full bg-orange-600 hover:bg-orange-700 h-11">
                <Crown className="h-4 w-4 mr-2" />
                Start Free Trial
              </Button>
            </Link>
            <Button variant="outline" onClick={handleClose} className="w-full">
              Maybe Later
            </Button>
          </div>

          {/* Trust Signals */}
          <div className="text-center text-xs text-gray-500 space-y-1">
            <p>🔒 Secure payment with LemonSqueezy</p>
            <p>🌍 Supports Argentina and 100+ countries</p>
            <p>❌ Cancel anytime, no questions asked</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
