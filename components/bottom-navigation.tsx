"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, Plus, Trophy, User } from "lucide-react"
import { cn } from "@/lib/utils"

const navigationItems = [
  {
    name: "Home",
    href: "/dashboard",
    icon: Home,
  },
  {
    name: "Add Meal",
    href: "/food-diary?openAddDialog=true",
    icon: Plus,
  },
  {
    name: "Achievements",
    href: "/gamification",
    icon: Trophy,
  },
  {
    name: "Profile",
    href: "/account",
    icon: User,
  },
]

export function BottomNavigation() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 md:hidden">
      <div className="grid grid-cols-4 h-16">
        {navigationItems.map((item) => {
          const Icon = item.icon
          // Check if current path matches (handle query params for Add Meal)
          const isActive = 
            item.href === "/food-diary?openAddDialog=true" 
              ? pathname === "/food-diary"
              : pathname === item.href || pathname?.startsWith(item.href + "/")

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center gap-1 transition-colors",
                isActive
                  ? "text-orange-600 dark:text-orange-400"
                  : "text-gray-500 dark:text-gray-400 hover:text-orange-600 dark:hover:text-orange-400"
              )}
            >
              <Icon className={cn(
                "w-5 h-5 transition-transform",
                isActive && "scale-110"
              )} />
              <span className={cn(
                "text-xs font-medium",
                isActive && "font-semibold"
              )}>
                {item.name}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}

