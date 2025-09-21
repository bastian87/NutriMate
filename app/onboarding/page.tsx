"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { OnboardingWizard } from "@/components/onboarding/onboarding-wizard"
import { useAuthContext } from "@/components/auth/simple-auth-provider"
import { Loader2 } from "lucide-react"
import { useLanguage } from "@/lib/i18n/context"
import { supabase } from "@/lib/supabase/client"
import { OnboardingGuard } from "@/components/onboarding-guard"

export default function OnboardingPage() {
  const { user, loading } = useAuthContext()
  const router = useRouter()
  const { t } = useLanguage()
  const [checkingProfile, setCheckingProfile] = useState(false)

  useEffect(() => {
    const checkUserProfile = async () => {
      if (!loading && user) {
        setCheckingProfile(true)
        try {
          // Verificar si el usuario tiene perfil completo
          const { data: userProfile } = await supabase
            .from("users")
            .select("id, username, full_name")
            .eq("id", user.id)
            .maybeSingle();

          // Verificar si tiene preferencias
          const { data: preferences } = await supabase
            .from("user_preferences")
            .select("id")
            .eq("user_id", user.id)
            .maybeSingle();

          if (userProfile && userProfile.username && preferences) {
            // Usuario tiene perfil completo, redirigir al dashboard
            console.log("✅ User has complete profile, redirecting to dashboard")
            router.push("/dashboard")
          } else {
            // Usuario necesita onboarding
            console.log("📝 User needs onboarding")
            setCheckingProfile(false)
          }
        } catch (error) {
          console.error("Error checking user profile:", error)
          setCheckingProfile(false)
        }
      } else if (!loading && !user) {
        // Si no hay usuario autenticado, redirigir al login (no signup para evitar bucle)
        console.log("🚫 No user authenticated, redirecting to login")
        router.push("/login")
      }
    }

    checkUserProfile()
  }, [user, loading, router])

  if (loading || checkingProfile) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-white p-4">
        <Loader2 className="h-12 w-12 animate-spin text-orange-600" />
        <p className="mt-4 text-lg text-gray-700">
          {checkingProfile ? "Verificando perfil..." : t("onboarding.loadingUserSession")}
        </p>
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

  // User is authenticated, show the onboarding wizard
  return (
    <OnboardingGuard>
      <OnboardingWizard />
    </OnboardingGuard>
  )
}
