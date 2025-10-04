"use client"

import React, { useRef, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Crown, Lock, Sparkles } from "lucide-react"
import { useLanguage } from "@/lib/i18n/context"
import { useAnalytics } from "@/hooks/use-analytics"
import Link from "next/link"
import { motion } from "framer-motion"
import { normalizeFeatureKey } from "@/lib/entitlements"

interface PremiumPreviewProps {
  feature: string
  title: string
  description: string
  children: React.ReactNode
  className?: string
  showOverlay?: boolean
  ctaText?: string
  ctaHref?: string
  onUpgradeClick?: () => void
  previewData?: any
  isBlurred?: boolean
}

// Session storage for debouncing paywall views
const paywallViewTracker = new Map<string, number>()

export function PremiumPreview({
  feature,
  title,
  description,
  children,
  className = "",
  showOverlay = true,
  ctaText,
  ctaHref = "/pricing",
  onUpgradeClick,
  previewData,
  isBlurred = true
}: PremiumPreviewProps) {
  const { t } = useLanguage()
  const analytics = useAnalytics()
  const hasTrackedView = useRef(false)

  // Normalize feature key to canonical form
  const canonicalFeature = normalizeFeatureKey(feature)

  const handleUpgradeClick = () => {
    analytics.track("upgrade_click", { 
      feature: canonicalFeature, 
      source: "premium_preview",
      location: window.location.pathname 
    })
    
    if (onUpgradeClick) {
      onUpgradeClick()
    }
  }

  const handlePreviewView = () => {
    const key = `${canonicalFeature}:${window.location.pathname}`
    const now = Date.now()
    const lastView = paywallViewTracker.get(key)
    
    // Debounce: only track once per session or after 5 minutes
    if (!lastView || now - lastView > 5 * 60 * 1000) {
      analytics.track("paywall_view", { 
        feature: canonicalFeature, 
        location: window.location.pathname 
      })
      paywallViewTracker.set(key, now)
    }
  }

  // Track preview view on mount (debounced)
  useEffect(() => {
    if (!hasTrackedView.current) {
      handlePreviewView()
      hasTrackedView.current = true
    }
  }, [canonicalFeature])

  return (
    <div className={`relative ${className}`}>
      {/* Main Content */}
      <div className={isBlurred ? "blur-sm pointer-events-none" : ""}>
        {children}
      </div>

      {/* Premium Overlay */}
      {showOverlay && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="absolute inset-0 bg-gradient-to-br from-orange-50/95 to-yellow-50/95 dark:from-orange-950/95 dark:to-yellow-950/95 backdrop-blur-sm rounded-lg border border-orange-200 dark:border-orange-800"
        >
          <div className="flex flex-col items-center justify-center h-full p-6 text-center">
            {/* Premium Badge */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.3 }}
              className="mb-4"
            >
              <Badge className="bg-gradient-to-r from-orange-500 to-yellow-500 text-white px-4 py-2 text-sm font-semibold">
                <Crown className="w-4 h-4 mr-2" />
                {t("premiumPreview.premiumFeature")}
              </Badge>
            </motion.div>

            {/* Title */}
            <motion.h3
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.3 }}
              className="text-xl font-bold text-gray-900 dark:text-white mb-2"
            >
              {title}
            </motion.h3>

            {/* Description */}
            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.3 }}
              className="text-gray-600 dark:text-gray-300 mb-6 max-w-md"
            >
              {description}
            </motion.p>

            {/* Preview Data */}
            {previewData && (
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5, duration: 0.3 }}
                className="mb-6 p-4 bg-white/50 dark:bg-gray-800/50 rounded-lg border border-orange-200 dark:border-orange-700"
              >
                {previewData}
              </motion.div>
            )}

            {/* CTA Button */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.3 }}
            >
              <Link href={ctaHref} onClick={handleUpgradeClick}>
                <Button className="bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 text-white px-8 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200">
                  <Sparkles className="w-5 h-5 mr-2" />
                  {ctaText || t("premiumPreview.upgradeToPremium")}
                </Button>
              </Link>
            </motion.div>

            {/* Feature Benefits */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.7, duration: 0.3 }}
              className="mt-4 text-sm text-gray-500 dark:text-gray-400"
            >
              {t("premiumPreview.unlockWithPremium")}
            </motion.div>
          </div>
        </motion.div>
      )}
    </div>
  )
}

// Specialized components for different feature types
export function MonthlyAnalyticsPreview({ children, ...props }: Omit<PremiumPreviewProps, 'feature' | 'title' | 'description'>) {
  const { t } = useLanguage()
  
  return (
    <PremiumPreview
      feature="monthly_analytics"
      title={t("premiumPreview.monthlyAnalytics.title")}
      description={t("premiumPreview.monthlyAnalytics.description")}
      ctaText={t("premiumPreview.monthlyAnalytics.cta")}
      {...props}
    >
      {children}
    </PremiumPreview>
  )
}

export function GroceryListsPreview({ children, ...props }: Omit<PremiumPreviewProps, 'feature' | 'title' | 'description'>) {
  const { t } = useLanguage()
  
  return (
    <PremiumPreview
      feature="grocery_lists"
      title={t("premiumPreview.groceryLists.title")}
      description={t("premiumPreview.groceryLists.description")}
      ctaText={t("premiumPreview.groceryLists.cta")}
      {...props}
    >
      {children}
    </PremiumPreview>
  )
}

export function ExportsPreview({ children, ...props }: Omit<PremiumPreviewProps, 'feature' | 'title' | 'description'>) {
  const { t } = useLanguage()
  
  return (
    <PremiumPreview
      feature="exports"
      title={t("premiumPreview.exports.title")}
      description={t("premiumPreview.exports.description")}
      ctaText={t("premiumPreview.exports.cta")}
      {...props}
    >
      {children}
    </PremiumPreview>
  )
}

export function CustomIngredientsPreview({ children, ...props }: Omit<PremiumPreviewProps, 'feature' | 'title' | 'description'>) {
  const { t } = useLanguage()
  
  return (
    <PremiumPreview
      feature="custom_ingredients"
      title={t("premiumPreview.customIngredients.title")}
      description={t("premiumPreview.customIngredients.description")}
      ctaText={t("premiumPreview.customIngredients.cta")}
      {...props}
    >
      {children}
    </PremiumPreview>
  )
}

export function RecipePrivateEditPreview({ children, ...props }: Omit<PremiumPreviewProps, 'feature' | 'title' | 'description'>) {
  const { t } = useLanguage()
  
  return (
    <PremiumPreview
      feature="recipes.private_edit"
      title={t("premiumPreview.recipePrivateEdit.title")}
      description={t("premiumPreview.recipePrivateEdit.description")}
      ctaText={t("premiumPreview.recipePrivateEdit.cta")}
      {...props}
    >
      {children}
    </PremiumPreview>
  )
}

export function RecipeBulkImportPreview({ children, ...props }: Omit<PremiumPreviewProps, 'feature' | 'title' | 'description'>) {
  const { t } = useLanguage()
  
  return (
    <PremiumPreview
      feature="recipes.bulk_import"
      title={t("premiumPreview.recipeBulkImport.title")}
      description={t("premiumPreview.recipeBulkImport.description")}
      ctaText={t("premiumPreview.recipeBulkImport.cta")}
      {...props}
    >
      {children}
    </PremiumPreview>
  )
}

export function ThemeExtrasPreview({ children, ...props }: Omit<PremiumPreviewProps, 'feature' | 'title' | 'description'>) {
  const { t } = useLanguage()
  
  return (
    <PremiumPreview
      feature="themes.extras"
      title={t("premiumPreview.themeExtras.title")}
      description={t("premiumPreview.themeExtras.description")}
      ctaText={t("premiumPreview.themeExtras.cta")}
      {...props}
    >
      {children}
    </PremiumPreview>
  )
}
