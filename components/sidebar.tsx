"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { useLanguage } from "@/lib/i18n/context"
import { LanguageSelector } from "./language-selector"
import useAuth from "@/hooks/use-auth"
import { useSubscription } from "@/hooks/use-subscription"
import { cn } from "@/lib/utils"
import Image from "next/image"

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
} from "lucide-react"

export function Sidebar() {
  const { t } = useLanguage()
  const pathname = usePathname()
  const router = useRouter()
  const { user, signOut } = useAuth()
  const { subscription } = useSubscription()
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

      {/* Sidebar for desktop */}
      <motion.aside
        variants={sidebarVariants}
        initial={false}
        animate={isCollapsed ? "collapsed" : "expanded"}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="hidden lg:flex flex-col sticky top-0 h-screen bg-orange-50 dark:bg-gray-900 border-r border-orange-200 dark:border-gray-800 shadow-sm overflow-hidden"
      >
        <div className="flex items-center justify-center h-16 border-b border-orange-200 dark:border-gray-800">
          <Link href="/" className="flex items-center gap-2">
            <Image src="/logo-new.png" alt="NutriMate" width={32} height={32} className="rounded-lg" />
            <AnimatePresence>
              {!isCollapsed && (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="font-bold text-xl"
                >
                  {t("navigation.brand")}
                </motion.span>
              )}
            </AnimatePresence>
          </Link>
        </div>

        <div className="flex flex-col flex-1 overflow-y-auto py-4 px-2 space-y-1">
          {navigationItems.map((item) => (
            <NavItem key={item.href} item={item} isCollapsed={isCollapsed} />
          ))}

          {user && accountItems.length > 0 && (
            <>
              <div className="h-px bg-orange-200 dark:bg-gray-800 my-2"></div>
              {accountItems.map((item) => (
                <NavItem key={item.href} item={item} isCollapsed={isCollapsed} />
              ))}
            </>
          )}
        </div>

        <div className="p-2 border-t border-orange-200 dark:border-gray-800">
          {user ? (
            <button
              onClick={async () => {
                await signOut()
                router.push("/landing")
              }}
              className="flex items-center gap-3 px-3 py-2 w-full rounded-lg hover:bg-orange-100 dark:hover:bg-orange-200 transition-colors"
            >
              <LogOut size={20} />
              <AnimatePresence>
                {!isCollapsed && (
                  <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
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
                  <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    {t("auth.signIn")}
                  </motion.span>
                )}
              </AnimatePresence>
            </Link>
          )}

          <div className={cn("mt-2", isCollapsed ? "flex justify-center" : "")}>
            <LanguageSelector isCompact={isCollapsed} />
          </div>

          <button
            onClick={toggleSidebar}
            className="flex items-center justify-center w-full mt-2 p-2 rounded-lg hover:bg-orange-100 dark:hover:bg-orange-200 transition-colors"
            aria-label={isCollapsed ? t("navigation.expandSidebar") : t("navigation.collapseSidebar")}
          >
            {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
          </button>
        </div>
      </motion.aside>

      {/* Mobile sidebar */}
      <AnimatePresence>
        {isMobileOpen && (
          <motion.aside
            initial="closed"
            animate="open"
            exit="closed"
            variants={mobileSidebarVariants}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="fixed top-0 left-0 z-50 w-64 h-screen bg-orange-50 dark:bg-gray-900 border-r border-orange-200 dark:border-gray-800 shadow-lg lg:hidden"
          >
            <div className="flex items-center justify-between h-16 px-4 border-b border-orange-200 dark:border-gray-800">
              <Link href="/" className="flex items-center gap-2">
                <Image src="/logo-new.png" alt="NutriMate" width={32} height={32} className="rounded-lg" />
                <span className="font-bold text-xl">NutriMate</span>
              </Link>
              <button
                onClick={() => setIsMobileOpen(false)}
                className="p-1 rounded-full hover:bg-orange-100 dark:hover:bg-orange-200"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex flex-col flex-1 overflow-y-auto py-4 px-2 space-y-1">
              {navigationItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors",
                    pathname === item.href ? "bg-primary text-white" : "hover:bg-orange-100 dark:hover:bg-orange-200",
                  )}
                >
                  <item.icon size={20} />
                  <span>{item.name}</span>
                </Link>
              ))}

              {user && accountItems.length > 0 && (
                <>
                  <div className="h-px bg-orange-200 dark:bg-gray-800 my-2"></div>
                  {accountItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors",
                        pathname === item.href
                          ? "bg-primary text-white"
                          : "hover:bg-orange-100 dark:hover:bg-orange-200",
                      )}
                    >
                      <item.icon size={20} />
                      <span>{item.name}</span>
                    </Link>
                  ))}
                </>
              )}
            </div>

            <div className="p-4 border-t border-orange-200 dark:border-gray-800">
              {user ? (
                <button
                  onClick={async () => {
                    await signOut()
                    router.push("/landing")
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
              </div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  )
}
