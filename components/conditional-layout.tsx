"use client"

import { usePathname, useRouter } from "next/navigation"
import { useAuthContext } from "@/components/auth/simple-auth-provider"
import { SidebarNew } from "@/components/sidebar-new"
import { MobileNavigationMenu } from "@/components/mobile-navigation"
import { useEffect, useState, useMemo, useCallback } from "react"
import { supabase } from "@/lib/supabase/client"
import Image from "next/image"

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
  const [hasRedirected, setHasRedirected] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  // Detectar si es móvil
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Cerrar menú móvil cuando cambie la ruta
  useEffect(() => {
    setIsMobileMenuOpen(false)
  }, [pathname])

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
    if (!loading && user && !isRedirecting && !isCheckingOnboarding && !hasRedirected) {
      const handleAuthRedirect = async () => {
        // Solo redirigir si estamos en una ruta de autenticación Y no hemos redirigido ya
        if ((pathname === "/login" || pathname === "/signup") && !isRedirecting) {
          console.log("🔄 Starting auth redirect for user:", user.id, "from path:", pathname)
          setIsRedirecting(true)
          setHasRedirected(true)
          
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
  }, [user, loading, pathname, router, isRedirecting, isCheckingOnboarding, hasRedirected])

  // Redirigir a landing si no hay usuario y está en ruta protegida
  useEffect(() => {
    if (!loading && !user && !isPublicRoute && !isRedirecting) {
      console.log("🔄 No user in protected route, redirecting to landing")
      router.push("/landing")
    }
  }, [user, loading, isPublicRoute, router, isRedirecting])

  // Evitar redirecciones innecesarias cuando ya estamos en la página correcta
  useEffect(() => {
    if (!loading && user && !isRedirecting && !isCheckingOnboarding) {
      // Si estamos en dashboard y el usuario tiene perfil, no hacer nada
      if (pathname === "/dashboard") {
        console.log("✅ Already on dashboard, no redirect needed")
        return
      }
      
      // Si estamos en onboarding y el usuario no tiene perfil completo, no hacer nada
      if (pathname === "/onboarding") {
        console.log("✅ Already on onboarding, no redirect needed")
        return
      }
    }
  }, [user, loading, pathname, isRedirecting, isCheckingOnboarding])

  // Verificar onboarding una sola vez cuando el usuario esté disponible
  useEffect(() => {
    handleUserVerification()
  }, [handleUserVerification])

  // Reset onboarding check cuando el usuario cambia
  useEffect(() => {
    setOnboardingChecked(false)
    setHasRedirected(false) // Reset redirect state when user changes
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
    // Layout responsive
    if (isMobile) {
      return (
        <div className="min-h-screen bg-background">
          {/* Header móvil */}
          <header className="bg-white shadow-sm px-4 py-3 flex items-center justify-between sticky top-0 z-50">
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setIsMobileMenuOpen(true)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <svg className="h-6 w-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <Image src="/logo-new.png" alt="NutriMate Logo" width={32} height={32} className="rounded-lg" />
              <h1 className="text-lg font-bold text-orange-600">NutriMate</h1>
            </div>
            <div></div>
          </header>

          {/* Contenido principal */}
          <main className="pb-20">
            {children}
          </main>

          {/* Menú móvil lateral */}
          {isMobileMenuOpen && (
            <div className="fixed inset-0 z-50">
              <div
                className="absolute inset-0 bg-black/50"
                onClick={() => setIsMobileMenuOpen(false)}
              />
              <div className="absolute top-0 left-0 w-80 h-full bg-white shadow-2xl">
                <div className="p-4 flex items-center justify-between border-b">
                  <h2 className="text-lg font-bold text-gray-900">Menú</h2>
                  <button
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <svg className="h-5 w-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <div className="p-4">
                  <MobileNavigationMenu onClose={() => setIsMobileMenuOpen(false)} />
                </div>
              </div>
            </div>
          )}
        </div>
      )
    }

    // Layout desktop
    return (
      <div className="min-h-screen bg-background flex">
        <SidebarNew />
        <main className="flex-1 overflow-x-hidden">
          <div className="p-4 lg:p-6">
            {children}
          </div>
        </main>
      </div>
    )
  }

  // Para rutas públicas o sin autenticación, mostrar solo el contenido
  return <main className="min-h-screen bg-background">{children}</main>
} 