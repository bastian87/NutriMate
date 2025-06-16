"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Crown, X, Sparkles } from "lucide-react"
import Link from "next/link"

interface SubscriptionBannerProps {
  onDismiss?: () => void
}

export default function SubscriptionBanner({ onDismiss }: SubscriptionBannerProps) {
  const [isVisible, setIsVisible] = useState(true)

  const handleDismiss = () => {
    setIsVisible(false)
    onDismiss?.()
  }

  if (!isVisible) return null

  return (
    <Card className="bg-gradient-to-r from-orange-500 to-amber-500 border-0 text-white mb-6">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 rounded-full p-2">
              <Crown className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-semibold">Upgrade to NutriMate Premium</h3>
              <p className="text-sm text-white/90">
                Unlimited AI suggestions, advanced meal planning, and more for just $4.99/month
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/pricing">
              <Button variant="secondary" size="sm" className="bg-white text-orange-600 hover:bg-white/90">
                <Sparkles className="h-4 w-4 mr-1" />
                Upgrade Now
              </Button>
            </Link>
            <Button variant="ghost" size="sm" onClick={handleDismiss} className="text-white hover:bg-white/20">
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
