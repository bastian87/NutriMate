"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { useLanguage } from "@/lib/i18n/context"
import { LanguageSelector } from "./language-selector"
import { useAuthContext } from "@/components/auth/simple-auth-provider"
import { useUserProfile } from "@/components/auth/user-profile-provider"
import { cn } from "@/lib/utils"
import Image from "next/image"
import { ThemeToggle } from "./theme-toggle"
import { Button } from "./ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu"

// Icons
import {
  Home,
  ChefHat,
  ShoppingCart,
  Calendar,
  Heart,
  LogOut,
  LogIn,
  Menu,
  X,
  User,
  Calculator,
  Crown,
  Target,
  Flame,
  BarChart3,
  Apple,
  MoreHorizontal,
  Settings,
} from "lucide-react"

export function HorizontalNavigation() {
  const { user, signOut } = useAuthContext()
  const { t } = useLanguage()
  const pathname = usePathname()
  const router = useRouter()
  const { userData } = useUserProfile()
  const [isMobileOpen, setIsMobileOpen] = useState(false)

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileOpen(false)
  }, [pathname])

  // Categorías de navegación para mejor organización
  const navigationCategories = {
    main: [
      { name: t("navigation.dashboard"), href: "/dashboard", icon: Home },
      { name: t("navigation.recipes"), href: "/recipes", icon: ChefHat },
      { name: t("navigation.mealPlans"), href: "/meal-plans", icon: Calendar },
      { name: t("navigation.groceryList"), href: "/grocery-list", icon: ShoppingCart },
    ],
    nutrition: [
      { name: t("navigation.nutritionTracking"), href: "/calendar", icon: Calendar },
      { name: t("navigation.goals"), href: "/goals", icon: Target },
      { name: t("navigation.ingredients"), href: "/ingredients", icon: Apple },
      { name: t("navigation.calorieCalculator"), href: "/calorie-calculator", icon: Calculator },
    ],
    insights: [
      { name: t("navigation.gamification"), href: "/gamification", icon: Flame },
      { name: t("navigation.weeklySummary"), href: "/weekly-summary", icon: BarChart3 },
      { name: t("navigation.monthlySummary"), href: "/monthly-summary", icon: BarChart3 },
    ],
    saved: [
      { name: t("navigation.savedRecipes"), href: "/saved-recipes", icon: Heart },
    ]
  }

  // Elementos principales (siempre visibles)
  const mainItems = navigationCategories.main
  
  // Categorías con sus propios dropdowns
  const categoryButtons = [
    {
      name: t("navigation.nutrition"),
      icon: Target,
      items: navigationCategories.nutrition
    },
    {
      name: t("navigation.analysis"),
      icon: BarChart3,
      items: navigationCategories.insights
    },
    {
      name: t("navigation.saved"),
      icon: Heart,
      items: navigationCategories.saved
    }
  ]

  const toggleMobileMenu = () => {
    setIsMobileOpen(!isMobileOpen)
  }

  const NavItem = ({ item, isMobile = false }: { item: any; isMobile?: boolean }) => (
    <Link
      href={item.href}
      className={cn(
        "flex items-center gap-2 px-3 py-2 rounded-lg transition-colors text-sm font-medium",
        pathname === item.href 
          ? "bg-orange-600 text-white" 
          : "text-gray-600 hover:text-gray-900 hover:bg-orange-100",
        isMobile ? "w-full" : "whitespace-nowrap"
      )}
    >
      <item.icon size={18} />
      <span>{item.name}</span>
    </Link>
  )

  // Mostrar loading state mientras se cargan los datos
  if (userData === null) {
    return (
      <nav className="relative bg-orange-50 border-b border-orange-200 sticky top-0 z-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center">
              <Link href="/landing" className="flex items-center space-x-2">
                <div className="w-8 h-8 flex items-center justify-center">
                  <Image src="/logo-new.png" alt="NutriMate Logo" width={32} height={32} className="rounded-lg" />
                </div>
                <span className="text-xl font-bold text-gray-900">NutriMate</span>
              </Link>
            </div>

            {/* Desktop Navigation - Loading */}
            <div className="hidden lg:flex items-center gap-1">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="w-20 h-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
              ))}
            </div>

            {/* Mobile menu button */}
            <button
              onClick={toggleMobileMenu}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
              aria-label={t("navigation.openMenu")}
            >
              <Menu size={20} />
            </button>
          </div>
        </div>
      </nav>
    )
  }

  return (
    <>
      <nav className="relative bg-orange-50 border-b border-orange-200 sticky top-0 z-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center">
              <Link href="/landing" className="flex items-center space-x-2">
                <div className="w-8 h-8 flex items-center justify-center">
                  <Image src="/logo-new.png" alt="NutriMate Logo" width={32} height={32} className="rounded-lg" />
                </div>
                <span className="text-xl font-bold text-gray-900">NutriMate</span>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-1">
              {/* Elementos principales */}
              {mainItems.map((item) => (
                <NavItem key={item.href} item={item} />
              ))}

              {/* Botones de categorías */}
              {categoryButtons.map((category) => (
                <DropdownMenu key={category.name}>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="flex items-center gap-2 px-3 py-2">
                      <category.icon size={18} />
                      <span>{category.name}</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    {category.items.map((item) => (
                      <DropdownMenuItem key={item.href} asChild>
                        <Link href={item.href} className="flex items-center gap-2">
                          <item.icon size={16} />
                          <span>{item.name}</span>
                        </Link>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              ))}

              {/* Separador */}
              <div className="mx-2 h-6 w-px bg-gray-200 dark:bg-gray-700" />

              {/* Controles de usuario */}
              <div className="flex items-center gap-2">
                <LanguageSelector isCompact={true} />
                <ThemeToggle />
                
                {user ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="flex items-center gap-2">
                        <User size={18} />
                        <span className="hidden xl:inline">{t("navigation.myAccount")}</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                      <DropdownMenuItem asChild>
                        <Link href="/account" className="flex items-center gap-2">
                          <Settings size={16} />
                          <span>{t("navigation.settings")}</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        onClick={async () => {
                          await signOut()
                        }}
                        className="flex items-center gap-2 text-red-600 dark:text-red-400"
                      >
                        <LogOut size={16} />
                        <span>{t("auth.signOut")}</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : (
                  <div className="flex items-center space-x-4">
                    <Link href="/login">
                      <Button variant="outline">{t("auth.signIn")}</Button>
                    </Link>
                    <Link href="/signup">
                      <Button className="bg-orange-600 hover:bg-orange-700">{t("auth.signUp")}</Button>
                    </Link>
                  </div>
                )}
              </div>
            </div>

            {/* Mobile menu button */}
            <div className="lg:hidden flex items-center space-x-2">
              <LanguageSelector isCompact />
              <ThemeToggle />
              <button
                onClick={toggleMobileMenu}
                className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
                aria-label={isMobileOpen ? t("navigation.closeMenu") : t("navigation.openMenu")}
              >
                {isMobileOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        <AnimatePresence>
          {isMobileOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="lg:hidden border-t border-orange-200 bg-orange-50"
            >
              <div className="px-4 py-4 space-y-4">
                {/* Elementos principales */}
                <div className="space-y-2">
                  <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-2">
                    Principal
                  </div>
                  {navigationCategories.main.map((item) => (
                    <NavItem key={item.href} item={item} isMobile={true} />
                  ))}
                </div>

                {/* Categorías */}
                {categoryButtons.map((category) => (
                  <div key={category.name} className="space-y-2">
                    <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-2 flex items-center gap-2">
                      <category.icon size={14} />
                      {category.name}
                    </div>
                    {category.items.map((item) => (
                      <NavItem key={item.href} item={item} isMobile={true} />
                    ))}
                  </div>
                ))}

                {/* Separador */}
                <div className="my-4 h-px bg-gray-200 dark:bg-gray-700" />

                {/* Controles de usuario móvil */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <LanguageSelector isCompact={false} />
                    <ThemeToggle />
                  </div>
                  
                  {user ? (
                    <div className="space-y-2">
                      <Link href="/account" className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
                        <Settings size={18} />
                        <span>{t("navigation.settings")}</span>
                      </Link>
                      <button
                        onClick={async () => {
                          await signOut()
                        }}
                        className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 w-full text-left"
                      >
                        <LogOut size={18} />
                        <span>{t("auth.signOut")}</span>
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Link href="/login">
                        <Button variant="outline" className="w-full">{t("auth.signIn")}</Button>
                      </Link>
                      <Link href="/signup">
                        <Button className="w-full bg-orange-600 hover:bg-orange-700">{t("auth.signUp")}</Button>
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </>
  )
}
