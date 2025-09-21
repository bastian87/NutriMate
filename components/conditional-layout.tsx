"use client"

import { usePathname, useRouter } from "next/navigation"
import { useAuthContext } from "@/components/auth/simple-auth-provider"
import { HorizontalNavigation } from "@/components/horizontal-navigation"
import { useEffect, useState, useMemo, useCallback } from "react"
import { supabase } from "@/lib/supabase/client"

interface ConditionalLayoutProps {
  children: React.ReactNode
}

// Rutas que NO deben mostrar el sidebar (páginas públicas)
const PUBLIC_ROUTES = [
  "/",
  "/landing",
  "/login",
  "/signup",
  "/onboarding",
  "/forgot-password",
  "/reset-password",
  "/pricing",
  "/privacy-policy",
  "/terms-of-service",
  "/auth/callback",
]

export function ConditionalLayout({ children }: ConditionalLayoutProps) {
  const pathname = usePathname()
  const router = useRouter()
  const { user, loading } = useAuthContext()
  const [isRedirecting, setIsRedirecting] = useState(false)
  const [isCheckingOnboarding, setIsCheckingOnboarding] = useState(false)
  const [onboardingChecked, setOnboardingChecked] = useState(false)

  // Memoizar si es una ruta pública para evitar recálculos
  const isPublicRoute = useMemo(() => PUBLIC_ROUTES.includes(pathname), [pathname])

  // Función unificada para manejar redirecciones y verificaciones
  const handleUserVerification = useCallback(async () => {
    if (loading || !user || isRedirecting || isPublicRoute) return

    // Si ya verificamos el onboarding para este usuario, no volver a verificar
    if (onboardingChecked) return

    setIsCheckingOnboarding(true)
    setOnboardingChecked(true)

    try {
      // Verificar si el usuario tiene perfil en la base de datos
      const { data: userProfile } = await supabase
        .from("users")
        .select("id")
        .eq("id", user.id)
        .single()
      
      if (!userProfile) {
        console.log("🚫 User has no profile, redirecting to onboarding")
        router.push("/onboarding")
        return
      }

      // Verificar si tiene preferencias completas
      const { data: preferences } = await supabase
        .from("user_preferences")
        .select("id")
        .eq("user_id", user.id)
        .single()
      
      if (!preferences) {
        console.log("🚫 User has no preferences, redirecting to onboarding")
        router.push("/onboarding")
        return
      }

      console.log("✅ User is fully configured, allowing access")
    } catch (error) {
      console.error("❌ Error checking onboarding status:", error)
      router.push("/onboarding")
    } finally {
      setIsCheckingOnboarding(false)
    }
  }, [loading, user, isRedirecting, isPublicRoute, onboardingChecked, router])

  // Manejar redirecciones después del login/signup
  useEffect(() => {
    if (!loading && user && !isRedirecting) {
      const handleAuthRedirect = async () => {
        // Solo redirigir si estamos en una ruta de autenticación
        if (pathname === "/login" || pathname === "/signup" || pathname === "/auth/callback") {
          console.log("🔄 Starting auth redirect for user:", user.id, "from path:", pathname)
          setIsRedirecting(true)
          
          try {
            // Verificar si el usuario ya tiene perfil (solo para usuarios existentes)
            const { data: existingProfile } = await supabase
              .from("users")
              .select("id")
              .eq("id", user.id)
              .single()
            
            if (existingProfile) {
              // Usuario existente con perfil - verificar si tiene preferencias
              const { data: preferences } = await supabase
                .from("user_preferences")
                .select("id")
                .eq("user_id", user.id)
                .single()
              
              if (preferences) {
                console.log("🏠 User has complete profile and preferences, redirecting to dashboard")
                router.push("/dashboard")
              } else {
                console.log("📝 User has profile but no preferences, redirecting to onboarding")
                router.push("/onboarding")
              }
            } else {
              // Usuario nuevo sin perfil - siempre ir al onboarding
              console.log("📝 New user without profile, redirecting to onboarding")
              router.push("/onboarding")
            }
          } catch (error) {
            console.error("❌ Error in auth redirect:", error)
            router.push("/onboarding")
          }
        }
      }

      handleAuthRedirect()
    }
  }, [user, loading, pathname, router, isRedirecting])

  // Redirigir a landing si no hay usuario y está en ruta protegida
  useEffect(() => {
    if (!loading && !user && !isPublicRoute && !isRedirecting) {
      console.log("🔄 No user in protected route, redirecting to landing")
      router.push("/landing")
    }
  }, [user, loading, isPublicRoute, router, isRedirecting])

  // Verificar onboarding una sola vez cuando el usuario esté disponible
  useEffect(() => {
    handleUserVerification()
  }, [handleUserVerification])

  // Reset onboarding check cuando el usuario cambia
  useEffect(() => {
    setOnboardingChecked(false)
  }, [user?.id])

  // Determinar si debe mostrar el sidebar
  const shouldShowSidebar = useMemo(() => {
    return user && !isPublicRoute && !isRedirecting && !isCheckingOnboarding && onboardingChecked
  }, [user, isPublicRoute, isRedirecting, isCheckingOnboarding, onboardingChecked])

  // Si está cargando o verificando onboarding, mostrar solo el contenido sin sidebar
  if (loading || isCheckingOnboarding) {
    return <main className="min-h-screen bg-background">{children}</main>
  }

  if (shouldShowSidebar) {
    return (
      <div className="min-h-screen bg-background">
        <HorizontalNavigation />
        <main className="p-4 lg:p-6">
          {children}
        </main>
      </div>
    )
  }

  // Para rutas públicas o sin autenticación, mostrar solo el contenido
  return <main className="min-h-screen bg-background">{children}</main>
} 