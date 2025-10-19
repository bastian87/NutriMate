"use client"
import { useState, useEffect } from "react"
import { Menu, Home, ChefHat, ShoppingCart, Calendar, Target, User, Heart } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useAuthContext } from "@/components/auth/simple-auth-provider"
import { useLanguage } from "@/lib/i18n/context"

export default function MobileLayoutClient({ children }: { children: React.ReactNode }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const pathname = usePathname()
  const { user } = useAuthContext()
  const { t } = useLanguage()

  // Detectar scroll para cambiar el header
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Cerrar menú cuando cambie la ruta
  useEffect(() => {
    setIsMenuOpen(false)
  }, [pathname])

  const navigationItems = [
    { name: t("navigation.dashboard"), href: "/mobile", icon: Home, current: pathname === "/mobile" },
    { name: t("navigation.recipes"), href: "/mobile/recipes", icon: ChefHat, current: pathname.startsWith("/mobile/recipes") },
    { name: t("navigation.groceryList"), href: "/mobile/grocery-list", icon: ShoppingCart, current: pathname.startsWith("/mobile/grocery-list") },
    { name: t("navigation.nutritionTracking"), href: "/mobile/calendar", icon: Calendar, current: pathname.startsWith("/mobile/calendar") },
    { name: t("navigation.goals"), href: "/mobile/goals", icon: Target, current: pathname.startsWith("/mobile/goals") },
    { name: t("navigation.savedRecipes"), href: "/mobile/saved-recipes", icon: Heart, current: pathname.startsWith("/mobile/saved-recipes") },
    { name: t("navigation.account"), href: "/mobile/account", icon: User, current: pathname.startsWith("/mobile/account") },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header dinámico */}
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-200 ${
        isScrolled 
          ? 'bg-white/95 backdrop-blur-md shadow-lg' 
          : 'bg-white shadow-sm'
      }`}>
        <div className="px-4 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">N</span>
            </div>
            <h1 className="text-lg font-bold text-gray-900">NutriMate</h1>
          </div>
          <button 
            onClick={() => setIsMenuOpen(true)} 
            className="w-10 h-10 flex items-center justify-center rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
          >
            <Menu className="h-5 w-5 text-gray-700" />
          </button>
        </div>
      </header>

      {/* Contenido principal con padding para el header */}
      <main className="pt-16 pb-20">
        {children}
      </main>

      {/* Navegación móvil mejorada */}
      <div
        className={`fixed top-0 left-0 w-full h-full bg-black/50 z-50 transition-opacity duration-300 ${
          isMenuOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setIsMenuOpen(false)}
      >
        <div
          className={`fixed top-0 right-0 w-80 h-full bg-white shadow-2xl transform transition-transform duration-300 ${
            isMenuOpen ? "translate-x-0" : "translate-x-full"
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header del menú */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-green-600 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold">N</span>
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">NutriMate</h2>
                <p className="text-sm text-gray-500">Mobile App</p>
              </div>
            </div>
          </div>

          {/* Navegación */}
          <nav className="p-4">
            <ul className="space-y-2">
              {navigationItems.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-colors ${
                      item.current
                        ? 'bg-green-50 text-green-700 border border-green-200'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <item.icon className={`h-5 w-5 ${item.current ? 'text-green-600' : 'text-gray-500'}`} />
                    <span className="font-medium">{item.name}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Footer del menú */}
          <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200">
            <div className="text-center">
              <p className="text-sm text-gray-500">
                {user ? `Welcome, ${user.user_metadata?.full_name || user.email?.split('@')[0] || 'User'}` : 'Not logged in'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 
