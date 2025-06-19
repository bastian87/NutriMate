"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import OnboardingForm from "@/components/onboarding-form"
import { useAuthContext } from "@/components/auth/auth-provider"
import { Loader2 } from "lucide-react"
import { useLanguage } from "@/lib/i18n/context"

export default function OnboardingPage() {
  const { user, loading } = useAuthContext()
  const router = useRouter()
  const { t } = useLanguage()

  useEffect(() => {
    if (!loading && !user) {
      // If not loading and no user, redirect to login
      router.push("/login")
    }
    // If user exists and has already completed onboarding (e.g., has preferences set),
    // you might want to redirect them to the dashboard.
    // This logic would require checking user_preferences.
    // For now, we'll assume if they land here, they need to see the form.
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-cream-50 p-4">
        <Loader2 className="h-12 w-12 animate-spin text-orange-600" />
        <p className="mt-4 text-lg text-gray-700">{t("onboarding.loadingUserSession")}</p>
      </div>
    )
  }

  if (!user) {
    // This case should ideally be handled by the useEffect redirect,
    // but it's a fallback.
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-cream-50 p-4">
        <p className="text-lg text-gray-700">{t("onboarding.redirectingToLogin")}</p>
      </div>
    )
  }

  // User is authenticated, show the onboarding form
  return (
    <div className="min-h-screen bg-cream-50 py-8 lg:py-12">
      <div className="container mx-auto max-w-2xl px-4">
        <OnboardingForm />
      </div>
    </div>
  )
}
