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
      const { data: userProfile, error: profileError } = await supabase
        .from("users")
        .select("id")
        .eq("id", user.id)
        .maybeSingle()
      
      if (profileError) {
        console.error("❌ Error checking user profile:", profileError)
        router.push("/onboarding")
        return
      }
      
      if (!userProfile) {
        console.log("🚫 User has no profile, redirecting to onboarding")
        router.push("/onboarding")
        return
      }

      // Para usuarios existentes con perfil, NO verificar preferencias
      // Solo permitir acceso directo al dashboard
      console.log("✅ User has profile, allowing access to dashboard")
    } catch (error) {
      console.error("❌ Error checking onboarding status:", error)
      router.push("/onboarding")
    } finally {
      setIsCheckingOnboarding(false)
    }
  }, [loading, user, isRedirecting, isPublicRoute, onboardingChecked, router])

  // Manejar redirecciones después del login/signup
  useEffect(() => {
    if (!loading && user && !isRedirecting && !isCheckingOnboarding) {
      const handleAuthRedirect = async () => {
        // Solo redirigir si estamos en una ruta de autenticación
        if (pathname === "/login" || pathname === "/signup" || pathname === "/auth/callback") {
          console.log("🔄 Starting auth redirect for user:", user.id, "from path:", pathname)
          setIsRedirecting(true)
          
          try {
            // Verificar si el usuario ya tiene perfil (solo para usuarios existentes)
            const { data: existingProfile, error: profileError } = await supabase
              .from("users")
              .select("id")
              .eq("id", user.id)
              .maybeSingle()
            
            if (profileError) {
              console.error("❌ Error checking existing profile:", profileError)
              router.push("/onboarding")
              setTimeout(() => setIsRedirecting(false), 100)
            } else if (existingProfile) {
              // Usuario existente con perfil - ir directamente al dashboard
              console.log("🏠 User has profile, redirecting to dashboard")
              router.push("/dashboard")
              // Resetear el estado de redirección después de un breve delay
              setTimeout(() => {
                setIsRedirecting(false)
                console.log("🔄 Reset redirecting state")
              }, 100)
            } else {
              // Usuario nuevo sin perfil - siempre ir al onboarding
              console.log("📝 New user without profile, redirecting to onboarding")
              router.push("/onboarding")
              setTimeout(() => setIsRedirecting(false), 100)
            }
          } catch (error) {
            console.error("❌ Error in auth redirect:", error)
            router.push("/onboarding")
            setTimeout(() => setIsRedirecting(false), 100)
          }
        }
      }

      handleAuthRedirect()
    }
  }, [user, loading, pathname, router, isRedirecting, isCheckingOnboarding])

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
    const result = user && !isPublicRoute && !isRedirecting && !isCheckingOnboarding
    console.log("🔍 Sidebar check:", {
      user: !!user,
      isPublicRoute,
      isRedirecting,
      isCheckingOnboarding,
      shouldShow: result,
      pathname
    })
    return result
  }, [user, isPublicRoute, isRedirecting, isCheckingOnboarding, pathname])

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