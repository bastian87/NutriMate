"use client"

import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { X } from "lucide-react"
import { useState } from "react"
import Link from "next/link"

interface OnboardingBannerProps {
  onDismiss?: () => void
}

export function OnboardingBanner({ onDismiss }: OnboardingBannerProps) {
  const [isDismissed, setIsDismissed] = useState(false)

  const handleDismiss = () => {
    setIsDismissed(true)
    onDismiss?.()
  }

  if (isDismissed) {
    return null
  }

  return (
    <Alert className="border-orange-200 bg-orange-50 text-orange-800">
      <div className="flex items-center justify-between">
        <AlertDescription className="flex-1">
          <strong>Finish setting up your profile to continue.</strong> Complete your onboarding to access all features.
        </AlertDescription>
        <div className="flex items-center gap-2 ml-4">
          <Button asChild size="sm" variant="outline" className="border-orange-300 text-orange-700 hover:bg-orange-100">
            <Link href="/onboarding">
              Complete Setup
            </Link>
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={handleDismiss}
            className="text-orange-600 hover:text-orange-800 hover:bg-orange-100 p-1 h-auto"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </Alert>
  )
}
