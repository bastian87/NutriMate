"use client"

import { Button } from "@/components/ui/button"
import { Crown } from "lucide-react"
import Link from "next/link"
import { useLanguage } from "@/lib/i18n/context"

interface PremiumUpgradePromptProps {
  title: string
  description: string
  disclaimer?: string
  feature?: string
}

export default function PremiumUpgradePrompt({ 
  title, 
  description, 
  disclaimer,
  feature 
}: PremiumUpgradePromptProps) {
  const { t } = useLanguage()

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-2xl shadow-lg">
          <div className="mx-auto w-20 h-20 bg-gradient-to-br from-orange-400 to-orange-500 rounded-full flex items-center justify-center mb-8 shadow-lg">
            <Crown className="h-10 w-10 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            {title}
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto text-lg">
            {description}
          </p>
          <div className="space-y-4">
            <Link href="/pricing" className="block">
              <Button className="bg-orange-600 hover:bg-orange-700 text-white px-8 py-3 text-lg font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-200">
                <Crown className="h-5 w-5 mr-2" />
                Upgrade to Premium
              </Button>
            </Link>
            {disclaimer && (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {disclaimer}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
