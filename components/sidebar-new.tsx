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
import {
  NutrigoLogo,
  DashboardIcon,
  CalendarIcon,
  HealthyMenuIcon,
  GroceryListIcon,
  FoodDiaryIcon,
  IngredientsIcon,
  CalculatorIcon,
  TargetIcon,
  FlameIcon,
  BarChartIcon,
  HeartIcon,
  UserIcon,
  ChefHatIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  ChevronLeftIcon,
  LogOutIcon,
  LogInIcon,
  MenuIcon,
  XIcon,
} from "./icons-new"

interface NavigationItem {
  name: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  badge?: number | null
}

interface NavigationCategory {
  name: string
  icon: React.ComponentType<{ className?: string }>
  items: NavigationItem[]
  isCollapsible?: boolean
}

export function SidebarNew() {
  const { user, signOut } = useAuthContext()
  const { t } = useLanguage()
  const pathname = usePathname()
  const router = useRouter()
  const { userData } = useUserProfile()
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const [collapsedCategories, setCollapsedCategories] = useState<Set<string>>(new Set())

  // Check if screen is mobile on mount and when resized
  useEffect(() => {
    const checkIfMobile = () => {
      setIsCollapsed(window.innerWidth < 1024)
    }

    // Initial check
    checkIfMobile()

    // Add event listener
    window.addEventListener("resize", checkIfMobile)

    // Clean up
    return () => window.removeEventListener("resize", checkIfMobile)
  }, [])

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileOpen(false)
  }, [pathname])

  // Navigation categories
  const navigationCategories: NavigationCategory[] = [
          {
            name: "Principal",
            icon: DashboardIcon,
            items: [
              { name: t("navigation.dashboard"), href: "/dashboard", icon: DashboardIcon },
              { name: t("navigation.recipes"), href: "/recipes", icon: ChefHatIcon },
              { name: t("navigation.groceryList"), href: "/grocery-list", icon: GroceryListIcon },
            ],
            isCollapsible: false
          },
    {
      name: "Nutrición & Salud",
      icon: TargetIcon,
      items: [
        { name: t("navigation.nutritionTracking"), href: "/calendar", icon: CalendarIcon },
        { name: "Food Diary", href: "/food-diary", icon: FoodDiaryIcon },
        { name: "Ingredientes", href: "/ingredients", icon: IngredientsIcon },
        { name: "Objetivos", href: "/goals", icon: TargetIcon },
        { name: t("navigation.calorieCalculator"), href: "/calorie-calculator", icon: CalculatorIcon },
      ],
      isCollapsible: true
    },
    {
      name: "Análisis & Progreso",
      icon: BarChartIcon,
      items: [
        { name: "Resumen Semanal", href: "/weekly-summary", icon: BarChartIcon },
        { name: "Resumen Mensual", href: "/monthly-summary", icon: BarChartIcon },
        { name: "Gamificación", href: "/gamification", icon: FlameIcon },
      ],
      isCollapsible: true
    },
    {
      name: "Guardado",
      icon: HeartIcon,
      items: [
        { name: t("navigation.savedRecipes"), href: "/saved-recipes", icon: HeartIcon },
      ],
      isCollapsible: false
    }
  ]

  const accountItems: NavigationItem[] = user ? [
    { name: t("navigation.account"), href: "/account", icon: UserIcon }
  ] : []

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed)
  }

  const toggleMobileMenu = () => {
    setIsMobileOpen(!isMobileOpen)
  }

  const toggleCategory = (categoryName: string) => {
    setCollapsedCategories(prev => {
      const newSet = new Set(prev)
      if (newSet.has(categoryName)) {
        newSet.delete(categoryName)
      } else {
        newSet.add(categoryName)
      }
      return newSet
    })
  }

  const isCategoryCollapsed = (categoryName: string) => collapsedCategories.has(categoryName)

  // Mobile menu button (only visible on mobile)
  const MobileMenuButton = () => (
    <button
      onClick={toggleMobileMenu}
      className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-full bg-primary text-white shadow-md"
      aria-label={isMobileOpen ? t("navigation.closeMenu") : t("navigation.openMenu")}
    >
      {isMobileOpen ? <XIcon className="w-5 h-5" /> : <MenuIcon className="w-5 h-5" />}
    </button>
  )

  // Sidebar variants for animations
  const sidebarVariants = {
    expanded: { width: "280px" },
    collapsed: { width: "72px" },
  }

  // Overlay for mobile
  const overlayVariants = {
    open: { opacity: 0.5 },
    closed: { opacity: 0 },
  }

  // Mobile sidebar variants
  const mobileSidebarVariants = {
    open: { x: 0 },
    closed: { x: "-100%" },
  }

  const NavItem = ({ item, isCollapsed }: { item: NavigationItem; isCollapsed: boolean }) => {
    const isActive = pathname === item.href
    return (
      <Link
        href={item.href}
        className={cn(
          "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-sm font-medium group",
          isActive 
            ? "bg-orange-600 text-white shadow-sm" 
            : "text-gray-700 hover:bg-orange-100 hover:text-orange-700 dark:text-gray-300 dark:hover:bg-orange-200 dark:hover:text-orange-600",
          isCollapsed ? "justify-center" : ""
        )}
      >
        <item.icon className="w-5 h-5 flex-shrink-0" />
        <AnimatePresence>
          {!isCollapsed && (
            <motion.div
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: "auto" }}
              exit={{ opacity: 0, width: 0 }}
              className="flex items-center justify-between w-full overflow-hidden"
            >
              <span className="whitespace-nowrap">{item.name}</span>
              {item.badge && (
                <span className="ml-auto bg-orange-500 text-white text-xs px-2 py-0.5 rounded-full min-w-[20px] h-5 flex items-center justify-center">
                  {item.badge}
                </span>
              )}
            </motion.div>
          )}
        </AnimatePresence>
        {isCollapsed && item.badge && (
          <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-xs px-1.5 py-0.5 rounded-full min-w-[18px] h-5 flex items-center justify-center">
            {item.badge}
          </span>
        )}
      </Link>
    )
  }

  const CategoryHeader = ({ category, isCollapsed }: { category: NavigationCategory; isCollapsed: boolean }) => {
    const isCollapsedCategory = isCategoryCollapsed(category.name)
    
    if (isCollapsed) {
      return (
        <div className="flex items-center justify-center py-2">
          <category.icon className="w-5 h-5 text-gray-500" />
        </div>
      )
    }

    if (!category.isCollapsible) {
      return (
        <div className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
          <category.icon className="w-4 h-4" />
          <span>{category.name}</span>
        </div>
      )
    }

    return (
      <button
        onClick={() => toggleCategory(category.name)}
        className="flex items-center justify-between w-full px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
      >
        <div className="flex items-center gap-2">
          <category.icon className="w-4 h-4" />
          <span>{category.name}</span>
        </div>
        <motion.div
          animate={{ rotate: isCollapsedCategory ? 0 : 90 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronRightIcon className="w-3 h-3" />
        </motion.div>
      </button>
    )
  }

  // Mostrar loading state mientras se cargan los datos
  if (userData === null) {
    return (
      <>
        <MobileMenuButton />
        <motion.aside
          variants={sidebarVariants}
          initial={false}
          animate={isCollapsed ? "collapsed" : "expanded"}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className="hidden lg:flex flex-col sticky top-0 h-screen bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden"
        >
          <div className="flex items-center justify-center h-16 border-b border-gray-200 dark:border-gray-800">
            <div className="flex items-center gap-2">
              <Image src="/logo-new.png" alt="NutriMate Logo" width={32} height={32} className="rounded-lg" />
              <AnimatePresence>
                {!isCollapsed && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="font-bold text-lg text-gray-900 dark:text-white"
                  >
                    NutriMate
                  </motion.span>
                )}
              </AnimatePresence>
            </div>
          </div>
          <div className="flex flex-col flex-1 overflow-y-auto py-4 px-2 space-y-1">
            {navigationCategories.map((category, categoryIndex) => (
              <div key={categoryIndex} className="space-y-1">
                <div className="flex items-center gap-3 px-3 py-2 rounded-lg">
                  <div className="w-5 h-5 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                  <AnimatePresence>
                    {!isCollapsed && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="w-20 h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"
                      />
                    )}
                  </AnimatePresence>
                </div>
              </div>
            ))}
          </div>
        </motion.aside>
      </>
    )
  }

  return (
    <>
      <MobileMenuButton />

      {/* Mobile overlay */}
      <AnimatePresence>
        {isMobileOpen && (
          <motion.div
            initial="closed"
            animate="open"
            exit="closed"
            variants={overlayVariants}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-black z-40 lg:hidden"
            onClick={() => setIsMobileOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Desktop Sidebar */}
      <motion.aside
        variants={sidebarVariants}
        initial={false}
        animate={isCollapsed ? "collapsed" : "expanded"}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="hidden lg:flex flex-col sticky top-0 h-screen bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200 dark:border-gray-800">
          <Link href="/dashboard" className="flex items-center gap-2">
            <Image src="/logo-new.png" alt="NutriMate Logo" width={32} height={32} className="rounded-lg" />
            <AnimatePresence>
              {!isCollapsed && (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="font-bold text-lg text-gray-900 dark:text-white"
                >
                  NutriMate
                </motion.span>
              )}
            </AnimatePresence>
          </Link>
          <button
            onClick={toggleSidebar}
            className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            {isCollapsed ? <ChevronRightIcon className="w-4 h-4" /> : <ChevronLeftIcon className="w-4 h-4" />}
          </button>
        </div>

        {/* Navigation */}
        <div className="flex flex-col flex-1 overflow-y-auto py-4 px-2 space-y-2">
          {navigationCategories.map((category, categoryIndex) => (
            <div key={categoryIndex} className="space-y-1">
              <CategoryHeader category={category} isCollapsed={isCollapsed} />
              
              <AnimatePresence>
                {(!category.isCollapsible || !isCategoryCollapsed(category.name)) && (
                  <motion.div
                    initial={false}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-1"
                  >
                    {category.items.map((item, itemIndex) => (
                      <div key={itemIndex} className="relative">
                        <NavItem item={item} isCollapsed={isCollapsed} />
                      </div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>

        {/* Account Section */}
        <div className="border-t border-gray-200 dark:border-gray-800 p-2 flex flex-col h-auto">
          {accountItems.map((item, index) => (
            <div key={index} className="relative">
              <NavItem item={item} isCollapsed={isCollapsed} />
            </div>
          ))}
          
          {/* Selectores de idioma y tema */}
          <div className="px-3 pb-2 flex flex-col gap-2 mt-auto">
            <LanguageSelector isCompact={false} />
            <div>
              <ThemeToggle className="w-full h-10 rounded-md border bg-white dark:bg-gray-800 flex items-center justify-center" />
            </div>
          </div>

          {/* Logout/Login al fondo */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-800 mt-2">
            {user ? (
              <button
                onClick={async () => {
                  await signOut()
                  // La redirección se maneja automáticamente en ConditionalLayout
                }}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 w-full rounded-lg transition-colors text-sm font-medium",
                  isCollapsed ? "justify-center" : "",
                  "text-gray-700 hover:bg-orange-100 hover:text-orange-700 dark:text-gray-300 dark:hover:bg-orange-200 dark:hover:text-orange-600"
                )}
              >
                <LogOutIcon className="w-5 h-5" />
                <AnimatePresence>
                  {!isCollapsed && (
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    >
                      {t("auth.signOut")}
                    </motion.span>
                  )}
                </AnimatePresence>
              </button>
            ) : (
              <Link
                href="/login"
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 w-full rounded-lg transition-colors text-sm font-medium",
                  isCollapsed ? "justify-center" : "",
                  "text-gray-700 hover:bg-orange-100 hover:text-orange-700 dark:text-gray-300 dark:hover:bg-orange-200 dark:hover:text-orange-600"
                )}
              >
                <LogInIcon className="w-5 h-5" />
                <AnimatePresence>
                  {!isCollapsed && (
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    >
                      {t("auth.signIn")}
                    </motion.span>
                  )}
                </AnimatePresence>
              </Link>
            )}
          </div>
        </div>
      </motion.aside>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {isMobileOpen && (
          <motion.aside
            initial="closed"
            animate="open"
            exit="closed"
            variants={mobileSidebarVariants}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="fixed top-0 left-0 z-50 h-full w-80 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 shadow-lg lg:hidden"
          >
            {/* Mobile Header */}
            <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200 dark:border-gray-800">
              <Link href="/dashboard" className="flex items-center gap-2">
                <Image src="/logo-new.png" alt="NutriMate Logo" width={32} height={32} className="rounded-lg" />
                <span className="font-bold text-lg text-gray-900 dark:text-white">NutriMate</span>
              </Link>
              <button
                onClick={() => setIsMobileOpen(false)}
                className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <XIcon className="w-5 h-5" />
              </button>
            </div>

            {/* Mobile Navigation */}
            <div className="flex flex-col flex-1 overflow-y-auto py-4 px-2 space-y-2">
              {navigationCategories.map((category, categoryIndex) => (
                <div key={categoryIndex} className="space-y-1">
                  <CategoryHeader category={category} isCollapsed={false} />
                  
                  <AnimatePresence>
                    {(!category.isCollapsible || !isCategoryCollapsed(category.name)) && (
                      <motion.div
                        initial={false}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="space-y-1"
                      >
                        {category.items.map((item, itemIndex) => (
                          <div key={itemIndex} className="relative">
                            <NavItem item={item} isCollapsed={false} />
                          </div>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
              
              {accountItems.map((item, index) => (
                <div key={index} className="relative">
                  <NavItem item={item} isCollapsed={false} />
                </div>
              ))}
            </div>

            {/* Mobile Logout/Login */}
            <div className="p-4 border-t border-gray-200 dark:border-gray-800">
              {user ? (
                <button
                  onClick={async () => {
                    await signOut()
                    // La redirección se maneja automáticamente en ConditionalLayout
                  }}
                  className="flex items-center gap-3 px-3 py-2.5 w-full rounded-lg transition-colors text-sm font-medium text-gray-700 hover:bg-orange-100 hover:text-orange-700 dark:text-gray-300 dark:hover:bg-orange-200 dark:hover:text-orange-600"
                >
                  <LogOutIcon className="w-5 h-5" />
                  <span>{t("auth.signOut")}</span>
                </button>
              ) : (
                <Link
                  href="/login"
                  className="flex items-center gap-3 px-3 py-2.5 w-full rounded-lg transition-colors text-sm font-medium text-gray-700 hover:bg-orange-100 hover:text-orange-700 dark:text-gray-300 dark:hover:bg-orange-200 dark:hover:text-orange-600"
                >
                  <LogInIcon className="w-5 h-5" />
                  <span>{t("auth.signIn")}</span>
                </Link>
              )}

              <div className="mt-2">
                <LanguageSelector isCompact={false} />
                <div className="mt-2">
                  <ThemeToggle />
                </div>
              </div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  )
}
