"use client"

import { usePathname } from "next/navigation"
import { useAuthContext } from "@/components/auth/auth-provider"
import { Sidebar } from "@/components/sidebar"

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
  const { user, loading } = useAuthContext()

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