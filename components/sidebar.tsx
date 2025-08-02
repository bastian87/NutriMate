"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { useLanguage } from "@/lib/i18n/context"
import { LanguageSelector } from "./language-selector"
import { useAuthContext } from "@/components/auth/auth-provider"
import { useUserProfile } from "@/components/auth/user-profile-provider"
import { cn } from "@/lib/utils"
import Image from "next/image"
import { ThemeToggle } from "./theme-toggle"

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
  ChevronLeft,
  ChevronRight,
  User,
  Calculator,
  Crown,
} from "lucide-react"

export function Sidebar() {
  const { user, signOut } = useAuthContext()
  const { t } = useLanguage()
  const pathname = usePathname()
  const router = useRouter()
  const { userData } = useUserProfile()
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isMobileOpen, setIsMobileOpen] = useState(false)

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

  const navigationItems = [
    { name: t("navigation.dashboard"), href: "/dashboard", icon: Home },
    { name: t("navigation.recipes"), href: "/recipes", icon: ChefHat },
    { name: t("navigation.groceryList"), href: "/grocery-list", icon: ShoppingCart },
    { name: t("navigation.mealPlans"), href: "/meal-plans", icon: Calendar },
    { name: t("navigation.savedRecipes"), href: "/saved-recipes", icon: Heart },
    { name: t("navigation.calorieCalculator"), href: "/calorie-calculator", icon: Calculator },
  ]

  const accountItems = user ? [{ name: t("navigation.account"), href: "/account", icon: User }] : []

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed)
  }

  const toggleMobileMenu = () => {
    setIsMobileOpen(!isMobileOpen)
  }

  // Mobile menu button (only visible on mobile)
  const MobileMenuButton = () => (
    <button
      onClick={toggleMobileMenu}
      className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-full bg-primary text-white shadow-md"
      aria-label={isMobileOpen ? t("navigation.closeMenu") : t("navigation.openMenu")}
    >
      {isMobileOpen ? <X size={20} /> : <Menu size={20} />}
    </button>
  )

  // Sidebar variants for animations
  const sidebarVariants = {
    expanded: { width: "240px" },
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

  const NavItem = ({ item, isCollapsed }: { item: any; isCollapsed: boolean }) => (
    <Link
      href={item.href}
      className={cn(
        "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors",
        pathname === item.href ? "bg-primary text-white" : "hover:bg-orange-100 dark:hover:bg-orange-200",
      )}
    >
      <item.icon size={20} />
      <AnimatePresence>
        {!isCollapsed && (
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="whitespace-nowrap"
          >
            {item.name}
          </motion.span>
        )}
      </AnimatePresence>
    </Link>
  )

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
          className="hidden lg:flex flex-col sticky top-0 h-screen bg-orange-50 dark:bg-gray-900 border-r border-orange-200 dark:border-gray-800 shadow-sm overflow-hidden"
        >
          <div className="flex items-center justify-center h-16 border-b border-orange-200 dark:border-gray-800">
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
            {navigationItems.map((item) => (
              <div key={item.href} className="flex items-center gap-3 px-3 py-2 rounded-lg">
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
        className="hidden lg:flex flex-col sticky top-0 h-screen bg-orange-50 dark:bg-gray-900 border-r border-orange-200 dark:border-gray-800 shadow-sm overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between h-16 px-3 border-b border-orange-200 dark:border-gray-800">
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
            className="p-1 rounded-lg hover:bg-orange-100 dark:hover:bg-gray-800 transition-colors"
          >
            {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
        </div>

        {/* Navigation */}
        <div className="flex flex-col flex-1 overflow-y-auto py-4 px-2 space-y-1">
          {navigationItems.map((item) => (
            <NavItem key={item.href} item={item} isCollapsed={isCollapsed} />
          ))}
        </div>

        {/* Account Section */}
        <div className="border-t border-orange-200 dark:border-gray-800 p-2 flex flex-col h-auto">
          {accountItems.map((item) => (
            <NavItem key={item.href} item={item} isCollapsed={isCollapsed} />
          ))}
          
          {/* Selectores de idioma y tema */}
          <div className="px-3 pb-2 flex flex-col gap-2 mt-auto">
            <LanguageSelector isCompact={false} />
            <div>
              <ThemeToggle className="w-full h-10 rounded-md border bg-white dark:bg-gray-800 flex items-center justify-center" />
            </div>
          </div>

          {/* Logout/Login al fondo */}
          <div className="p-4 border-t border-orange-200 dark:border-gray-800 mt-2">
            {user ? (
              <button
                onClick={async () => {
                  await signOut()
                  // La redirección se maneja automáticamente en ConditionalLayout
                }}
                className="flex items-center gap-3 px-3 py-2 w-full rounded-lg hover:bg-orange-100 dark:hover:bg-orange-200 transition-colors"
              >
                <LogOut size={20} />
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
                className="flex items-center gap-3 px-3 py-2 w-full rounded-lg hover:bg-orange-100 dark:hover:bg-orange-200 transition-colors"
              >
                <LogIn size={20} />
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
            className="fixed top-0 left-0 z-50 h-full w-64 bg-orange-50 dark:bg-gray-900 border-r border-orange-200 dark:border-gray-800 shadow-lg lg:hidden"
          >
            {/* Mobile Header */}
            <div className="flex items-center justify-between h-16 px-4 border-b border-orange-200 dark:border-gray-800">
              <Link href="/dashboard" className="flex items-center gap-2">
                <Image src="/logo-new.png" alt="NutriMate Logo" width={32} height={32} className="rounded-lg" />
                <span className="font-bold text-lg text-gray-900 dark:text-white">NutriMate</span>
              </Link>
              <button
                onClick={() => setIsMobileOpen(false)}
                className="p-1 rounded-lg hover:bg-orange-100 dark:hover:bg-gray-800 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Mobile Navigation */}
            <div className="flex flex-col flex-1 overflow-y-auto py-4 px-2 space-y-1">
              {navigationItems.map((item) => (
                <NavItem key={item.href} item={item} isCollapsed={false} />
              ))}
              {accountItems.map((item) => (
                <NavItem key={item.href} item={item} isCollapsed={false} />
              ))}
            </div>

            {/* Mobile Logout/Login */}
            <div className="p-4 border-t border-orange-200 dark:border-gray-800">
              {user ? (
                <button
                  onClick={async () => {
                    await signOut()
                    // La redirección se maneja automáticamente en ConditionalLayout
                  }}
                  className="flex items-center gap-3 px-3 py-2 w-full rounded-lg hover:bg-orange-100 dark:hover:bg-orange-200 transition-colors"
                >
                  <LogOut size={20} />
                  <span>{t("auth.signOut")}</span>
                </button>
              ) : (
                <Link
                  href="/login"
                  className="flex items-center gap-3 px-3 py-2 w-full rounded-lg hover:bg-orange-100 dark:hover:bg-orange-200 transition-colors"
                >
                  <LogIn size={20} />
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
