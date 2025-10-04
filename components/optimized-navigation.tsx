"use client"

import { useOptimizedNavigation } from "@/hooks/use-optimized-navigation"
import { Button } from "@/components/ui/button"
import { 
  Home, 
  ChefHat, 
  ShoppingCart, 
  Calendar, 
  Apple, 
  Target,
  User
} from "lucide-react"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

const navigationItems = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: Home,
    description: "Resumen general"
  },
  {
    name: "Recetas",
    href: "/recipes",
    icon: ChefHat,
    description: "Explorar recetas"
  },
  {
    name: "Ingredientes",
    href: "/ingredients",
    icon: Apple,
    description: "Base de datos"
  },
  {
    name: "Lista de Compras",
    href: "/grocery-list",
    icon: ShoppingCart,
    description: "Compras inteligentes"
  },
  {
    name: "Calendario",
    href: "/calendar",
    icon: Calendar,
    description: "Vista mensual"
  },
  {
    name: "Cuenta",
    href: "/account",
    icon: User,
    description: "Configuración"
  }
]

export function OptimizedNavigation() {
  const pathname = usePathname()
  const {
    navigateToDashboard,
    navigateToRecipes,
    navigateToIngredients,
    navigateToGroceryList,
    navigateToCalendar,
    navigateToAccount,
    isNavigating
  } = useOptimizedNavigation()

  const handleNavigation = (href: string, navigateFn: () => void) => {
    if (isNavigating) return
    navigateFn()
  }

  return (
    <nav className="space-y-2">
      {navigationItems.map((item) => {
        const isActive = pathname === item.href
        const Icon = item.icon

        const getNavigationHandler = () => {
          switch (item.href) {
            case "/dashboard":
              return () => handleNavigation(item.href, navigateToDashboard)
            case "/recipes":
              return () => handleNavigation(item.href, navigateToRecipes)
            case "/ingredients":
              return () => handleNavigation(item.href, navigateToIngredients)
            case "/grocery-list":
              return () => handleNavigation(item.href, navigateToGroceryList)
            case "/calendar":
              return () => handleNavigation(item.href, navigateToCalendar)
            case "/account":
              return () => handleNavigation(item.href, navigateToAccount)
            default:
              return () => {}
          }
        }

        return (
          <Button
            key={item.name}
            variant={isActive ? "default" : "ghost"}
            className={cn(
              "w-full justify-start h-auto p-3 transition-all duration-200",
              isActive 
                ? "bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg shadow-orange-500/30" 
                : "hover:bg-orange-50 hover:text-orange-600",
              isNavigating && "opacity-50 cursor-not-allowed"
            )}
            onClick={getNavigationHandler()}
            disabled={isNavigating}
          >
            <div className="flex items-center gap-3 w-full">
              <Icon className="h-5 w-5 flex-shrink-0" />
              <div className="flex-1 text-left">
                <div className="font-medium">{item.name}</div>
                <div className={cn(
                  "text-xs",
                  isActive ? "text-orange-100" : "text-gray-500"
                )}>
                  {item.description}
                </div>
              </div>
              {isActive && (
                <div className="w-2 h-2 bg-white rounded-full flex-shrink-0" />
              )}
            </div>
          </Button>
        )
      })}
    </nav>
  )
}
