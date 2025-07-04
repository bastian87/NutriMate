"use client"

import type { ReactNode } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Crown, Lock, AlertTriangle } from "lucide-react"
import { useFeatureAccess } from "@/components/auth/user-profile-provider"
import Link from "next/link"
import { useLanguage } from "@/lib/i18n/context"

interface FeatureGateProps {
  children: ReactNode
  feature: string
  fallback?: ReactNode
  title?: string
  description?: string
  showUsageLimit?: boolean
}

export function FeatureGate({
  children,
  feature,
  fallback,
  title,
  description,
  showUsageLimit = false,
}: FeatureGateProps) {
  const { canAccess, reason } = useFeatureAccess(feature)
  const { t } = useLanguage()

  if (canAccess) {
    return <>{children}</>
  }

  if (fallback) {
    return <>{fallback}</>
  }

  // Premium-only features that free users cannot access
  const premiumOnlyFeatures = [
    "export_meal_plans",
    "priority_support",
    "advanced_nutrition_analysis",
    "unlimited_meal_plans",
    "unlimited_custom_recipes",
    "unlimited_saved_recipes",
    "advanced_meal_planning",
    "smart_grocery_lists",
  ]

  const isPremiumOnly = premiumOnlyFeatures.includes(feature)

  return (
    <Card className="border-orange-200 bg-gradient-to-br from-orange-50 to-yellow-50 dark:from-orange-950 dark:to-yellow-950">
      <CardHeader className="text-center">
        <div className="mx-auto w-12 h-12 bg-orange-100 dark:bg-orange-900 rounded-full flex items-center justify-center mb-4">
          {isPremiumOnly ? (
            <Crown className="h-6 w-6 text-orange-600" />
          ) : (
            <AlertTriangle className="h-6 w-6 text-orange-600" />
          )}
        </div>
        <CardTitle className="flex items-center justify-center gap-2">
          <Lock className="h-5 w-5" />
          {title || (isPremiumOnly ? t("featureGate.premiumFeature") : t("featureGate.upgradeRequired"))}
        </CardTitle>
        <CardDescription>
          {description || reason ||
            (isPremiumOnly
              ? t("featureGate.availableForPremium", { feature: feature.replace(/_/g, " ") })
              : t("featureGate.freeLimitReached", { feature: feature.replace(/_/g, " ") }))}
        </CardDescription>
      </CardHeader>
      <CardContent className="text-center space-y-4">
        {!isPremiumOnly && showUsageLimit && (
          <div className="bg-white dark:bg-gray-800 rounded-lg p-3 text-sm">
            <p className="text-gray-600 dark:text-gray-400">
              {t("featureGate.freeLimited")}
            </p>
          </div>
        )}
        <div className="space-y-2">
          <Button asChild className="w-full bg-orange-600 hover:bg-orange-700">
            <Link href="/pricing">
              <Crown className="h-4 w-4 mr-2" />
              {t("featureGate.upgrade")}
            </Link>
          </Button>
          {!isPremiumOnly && <p className="text-xs text-gray-500">{t("featureGate.continueFree")}</p>}
        </div>
      </CardContent>
    </Card>
  )
}
