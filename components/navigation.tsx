"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, BookOpen, ShoppingCart, User, Sparkles } from "lucide-react"
import Image from "next/image"
import { useLanguage } from "@/lib/i18n/context"

export function Navigation() {
  const pathname = usePathname()
  const { t } = useLanguage()

  const navItems = [
    { href: "/", label: t("navigation.home"), icon: Home },
    { href: "/recipes", label: t("navigation.recipes"), icon: BookOpen },
    { href: "/grocery-list", label: t("navigation.groceryList"), icon: ShoppingCart },
    { href: "/ai-assistant", label: t("navigation.aiAssistant"), icon: Sparkles },
    { href: "/profile", label: t("navigation.profile"), icon: User },
  ]

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <Image src="/logo-new.png" alt="NutriMate Logo" width={32} height={32} className="rounded-lg" />
              <span className="text-2xl font-bold text-orange-600">{t("navigation.brand")}</span>
            </Link>
          </div>

          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive ? "text-orange-600 bg-orange-50" : "text-gray-700 hover:text-orange-600 hover:bg-orange-50"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              )
            })}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button className="text-gray-700 hover:text-orange-600">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div className="md:hidden border-t border-gray-200">
        <div className="px-2 pt-2 pb-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2 px-3 py-2 rounded-md text-base font-medium transition-colors ${
                  isActive ? "text-orange-600 bg-orange-50" : "text-gray-700 hover:text-orange-600 hover:bg-orange-50"
                }`}
              >
                <Icon className="h-5 w-5" />
                {item.label}
              </Link>
            )
          })}
        </div>
      </div>
    </nav>
  )
}
