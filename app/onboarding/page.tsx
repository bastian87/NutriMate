"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import OnboardingForm from "@/components/onboarding-form"
import { useAuthContext } from "@/components/auth/simple-auth-provider"
import { Loader2 } from "lucide-react"
import { useLanguage } from "@/lib/i18n/context"

export default function OnboardingPage() {
  const { user, loading } = useAuthContext()
  const router = useRouter()
  const { t } = useLanguage()

  useEffect(() => {
    if (!loading) {
      if (user) {
        // Si hay un usuario autenticado, redirigir al dashboard
        console.log("👤 User already authenticated, redirecting to dashboard")
        router.push("/dashboard")
      } else {
        // Si no hay usuario autenticado, redirigir al signup
        console.log("🚫 No user authenticated, redirecting to signup")
        router.push("/signup")
      }
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-white p-4">
        <Loader2 className="h-12 w-12 animate-spin text-orange-600" />
        <p className="mt-4 text-lg text-gray-700">{t("onboarding.loadingUserSession")}</p>
      </div>
    )
  }

  // Si no hay usuario, no mostrar el formulario
  if (!user) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-white p-4">
        <p className="text-lg text-gray-700">{t("onboarding.redirectingToSignup")}</p>
      </div>
    )
  }

  // User is authenticated, show the onboarding form
  return (
    <div className="min-h-screen bg-white py-8 lg:py-12">
      <div className="container mx-auto max-w-2xl px-4">
        <OnboardingForm />
      </div>
    </div>
  )
}
