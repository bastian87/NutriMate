"use client"

import { useOnboardingGuard } from "@/hooks/use-onboarding-guard"
import { OnboardingBanner } from "@/components/onboarding-banner"
import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"

interface OnboardingGuardProps {
  children: React.ReactNode
}

export function OnboardingGuard({ children }: OnboardingGuardProps) {
  const { isLoading, needsOnboarding, isRedirecting } = useOnboardingGuard()
  const pathname = usePathname()
  const [showBanner, setShowBanner] = useState(false)

  const isOnboardingRoute = pathname === '/onboarding'
  const isPublicRoute = [
    '/',
    '/landing',
    '/login',
    '/signup',
    '/forgot-password',
    '/reset-password',
    '/privacy-policy',
    '/terms-of-service',
    '/pricing',
    '/auth/callback',
    '/clear-auth',
    '/clear-session',
    '/configure-url',
    '/debug-auth',
    '/debug-subscription',
    '/debug-grocery-list',
    '/test',
    '/test-analytics',
    '/test-billing-portal',
    '/test-pages',
    '/test-user-profile'
  ].includes(pathname)

  useEffect(() => {
    // Mostrar banner si necesita onboarding y no está en onboarding ni en rutas públicas
    if (needsOnboarding && !isOnboardingRoute && !isPublicRoute && !isLoading) {
      setShowBanner(true)
    } else {
      setShowBanner(false)
    }
  }, [needsOnboarding, isOnboardingRoute, isPublicRoute, isLoading])

  // Mostrar loading spinner mientras verifica
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
          <p className="text-sm text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  // Mostrar mensaje de redirección
  if (isRedirecting) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
          <p className="text-sm text-gray-600">Redirecting...</p>
        </div>
      </div>
    )
  }

  return (
    <>
      {showBanner && <OnboardingBanner onDismiss={() => setShowBanner(false)} />}
      {children}
    </>
  )
}
