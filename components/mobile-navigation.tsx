"use client"

import type React from "react"
import Image from "next/image"
import Link from "next/link"
import { useLanguage } from "@/lib/i18n/context"
import { useAuthContext } from "@/components/auth/simple-auth-provider"
import { usePathname } from "next/navigation"
import { 
  Home, 
  ChefHat, 
  BookOpen, 
  Target, 
  Flame, 
  BarChart3, 
  Apple, 
  Heart, 
  Calculator, 
  User 
} from "lucide-react"

interface MobileNavigationMenuProps {
  onClose: () => void
}

export const MobileNavigationMenu: React.FC<MobileNavigationMenuProps> = ({ onClose }) => {
  const { t } = useLanguage()
  const { user, signOut } = useAuthContext()
  const pathname = usePathname()

  // Simplified navigation - only 4 main tabs: Home, Add Meal, Achievements, Profile
  const navigationItems = [
    { name: "Home", href: "/dashboard", icon: Home },
    { name: "Add Meal", href: "/food-diary?openAddDialog=true", icon: BookOpen },
    { name: "Achievements", href: "/gamification", icon: Flame },
    { name: "Profile", href: "/account", icon: User },
  ]

  // Profile is already in navigationItems, no separate account items needed

  const NavItem = ({ item }: { item: { name: string; href: string; icon: any } }) => {
    const Icon = item.icon
    const isActive = pathname === item.href

    return (
      <Link
        href={item.href}
        onClick={onClose}
        className={`flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-colors ${
          isActive 
            ? "bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300" 
            : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
        }`}
      >
        <Icon className="h-5 w-5" />
        {item.name}
      </Link>
    )
  }

  return (
    <div className="flex flex-col h-full">
      {/* Logo Header */}
      <div className="px-3 py-4 border-b border-gray-200 dark:border-gray-700">
        <Link href="/" onClick={onClose} className="flex items-center space-x-2">
          <Image src="/logo-new.png" alt="NutriMate Logo" width={32} height={32} className="rounded-lg" />
          <span className="text-lg font-bold text-orange-600">NutriMate</span>
        </Link>
      </div>
      
      {/* Navigation Items */}
      <div className="flex-1 overflow-y-auto py-2 space-y-1">
        {navigationItems.map((item) => (
          <NavItem key={item.href} item={item} />
        ))}
      </div>

      {/* Logout/Login */}
      <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
        {user ? (
          <button
            onClick={() => {
              signOut()
              onClose()
            }}
            className="flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20 transition-colors w-full"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            {t("navigation.signOut")}
          </button>
        ) : (
          <div className="space-y-2">
            <Link
              href="/login"
              onClick={onClose}
              className="flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800 transition-colors"
            >
              {t("navigation.signIn")}
            </Link>
            <Link
              href="/signup"
              onClick={onClose}
              className="flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium bg-orange-600 text-white hover:bg-orange-700 transition-colors"
            >
              {t("navigation.getStarted")}
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}

export default MobileNavigationMenu
