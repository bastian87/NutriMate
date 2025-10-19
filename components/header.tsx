"use client"
import { useLanguage } from "@/lib/i18n/context"
import { ThemeToggle } from "./theme-toggle"
import { useAuthContext } from "@/components/auth/simple-auth-provider"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Menu, X } from "lucide-react"
import { useState } from "react"

export default function Header() {
  const { t } = useLanguage()
  const { user } = useAuthContext()
  const isLoggedIn = !!user
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  return (
    <header className="w-full bg-white border-b border-gray-200">
      <nav className="max-w-7xl mx-auto flex items-center justify-between px-4 py-3">
        {/* Logo */}
        <a href="/" className="text-xl font-bold text-orange-600">NutriMate</a>
        
        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-8">
          <ul className="flex gap-6 items-center">
            <li>
              <a href="/recipes" className="hover:text-orange-600 font-medium transition-colors">Recetas</a>
            </li>
            <li>
              <a href="/calorie-calculator" className="hover:text-orange-600 font-medium transition-colors">Calculadora de Calorías</a>
            </li>
          </ul>
        </div>

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center gap-4">
          <ThemeToggle />
          {isLoggedIn ? (
            <Link href="/dashboard">
              <Button className="bg-orange-600 hover:bg-orange-700">{t("navigation.dashboard")}</Button>
            </Link>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/login">
                <Button variant="outline">Sign In</Button>
              </Link>
              <Link href="/signup">
                <Button className="bg-orange-600 hover:bg-orange-700">Get Started</Button>
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Menu Button */}
        <div className="md:hidden flex items-center gap-2">
          <ThemeToggle />
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2"
          >
            {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </nav>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-gray-200 bg-white">
          <div className="px-4 py-4 space-y-4">
            <a 
              href="/recipes" 
              className="block py-2 text-gray-700 hover:text-orange-600 font-medium transition-colors"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Recetas
            </a>
            <a 
              href="/calorie-calculator" 
              className="block py-2 text-gray-700 hover:text-orange-600 font-medium transition-colors"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Calculadora de Calorías
            </a>
            <div className="pt-4 border-t border-gray-200">
              {isLoggedIn ? (
                <Link href="/dashboard" onClick={() => setIsMobileMenuOpen(false)}>
                  <Button className="w-full bg-orange-600 hover:bg-orange-700">{t("navigation.dashboard")}</Button>
                </Link>
              ) : (
                <div className="space-y-2">
                  <Link href="/login" onClick={() => setIsMobileMenuOpen(false)}>
                    <Button variant="outline" className="w-full">Sign In</Button>
                  </Link>
                  <Link href="/signup" onClick={() => setIsMobileMenuOpen(false)}>
                    <Button className="w-full bg-orange-600 hover:bg-orange-700">Get Started</Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
