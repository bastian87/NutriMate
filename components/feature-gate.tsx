"use client"

import type { ReactNode } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Crown, Lock } from "lucide-react"
import { useSubscription } from "@/hooks/use-subscription"
import Link from "next/link"

interface FeatureGateProps {
  children: ReactNode
  feature: string
  fallback?: ReactNode
}

export function FeatureGate({ children, feature, fallback }: FeatureGateProps) {
  const { isPremium, loading } = useSubscription()

  if (loading) {
    return (
      <div className="animate-pulse bg-gray-200 dark:bg-gray-700 rounded-lg h-32 flex items-center justify-center">
        <div className="text-gray-500">Loading...</div>
      </div>
    )
  }

  if (isPremium) {
    return <>{children}</>
  }

  if (fallback) {
    return <>{fallback}</>
  }

  return (
    <Card className="border-orange-200 bg-gradient-to-br from-orange-50 to-yellow-50 dark:from-orange-950 dark:to-yellow-950">
      <CardHeader className="text-center">
        <div className="mx-auto w-12 h-12 bg-orange-100 dark:bg-orange-900 rounded-full flex items-center justify-center mb-4">
          <Crown className="h-6 w-6 text-orange-600" />
        </div>
        <CardTitle className="flex items-center justify-center gap-2">
          <Lock className="h-5 w-5" />
          Premium Feature
        </CardTitle>
        <CardDescription>Unlock {feature} and more with NutriMate Premium</CardDescription>
      </CardHeader>
      <CardContent className="text-center">
        <Button asChild className="bg-orange-600 hover:bg-orange-700">
          <Link href="/pricing">
            <Crown className="h-4 w-4 mr-2" />
            Upgrade to Premium
          </Link>
        </Button>
      </CardContent>
    </Card>
  )
}
