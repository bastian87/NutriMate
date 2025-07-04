"use client"

import { usePathname, useRouter } from "next/navigation"
import { useAuthContext } from "@/components/auth/auth-provider"
import { Sidebar } from "@/components/sidebar"
import { useEffect, useState } from "react"
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

  // Manejar redirecciones después del login/signup
  useEffect(() => {
    if (!loading && user && !isRedirecting) {
      const handleAuthRedirect = async () => {
        // Solo redirigir si estamos en una ruta de autenticación
        if (pathname === "/login" || pathname === "/signup" || pathname === "/auth/callback") {
          setIsRedirecting(true)
          
          try {
            // Verificar si el usuario ya tiene perfil
            const { data } = await supabase
              .from("users")
              .select("id")
              .eq("id", user.id)
              .single()
            
            if (data) {
              router.push("/dashboard")
            } else {
              router.push("/onboarding")
            }
          } catch (error) {
            console.error("Error checking user profile:", error)
            // Si hay error, asumir que necesita onboarding
            router.push("/onboarding")
          }
        }
      }

      handleAuthRedirect()
    }
  }, [user, loading, pathname, router, isRedirecting])

  // Redirigir a landing si no hay usuario y está en ruta protegida
  useEffect(() => {
    if (!loading && !user && !PUBLIC_ROUTES.includes(pathname) && !isRedirecting) {
      router.push("/landing")
    }
  }, [user, loading, pathname, router, isRedirecting])

  // Si está cargando, mostrar solo el contenido sin sidebar
  if (loading) {
    return <main className="min-h-screen bg-background">{children}</main>
  }

  // Si es una ruta pública o no hay usuario autenticado, no mostrar sidebar
  const isPublicRoute = PUBLIC_ROUTES.includes(pathname)
  const shouldShowSidebar = user && !isPublicRoute

  if (shouldShowSidebar) {
    return (
      <div className="flex min-h-screen">
        <Sidebar />
        <main className="flex-1 p-4 lg:p-6 overflow-auto bg-background">
          {children}
        </main>
      </div>
    )
  }

  // Para rutas públicas o sin autenticación, mostrar solo el contenido
  return <main className="min-h-screen bg-background">{children}</main>
} 