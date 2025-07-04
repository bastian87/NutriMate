"use client"
import { useLanguage } from "@/lib/i18n/context"
import { ThemeToggle } from "./theme-toggle"
import { useAuthContext } from "@/components/auth/auth-provider"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function Header() {
  const { t } = useLanguage()
  const { user } = useAuthContext()
  const isLoggedIn = !!user

  return (
    <header className="w-full bg-white border-b border-gray-200">
      <nav className="max-w-7xl mx-auto flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-8">
          <a href="/" className="text-xl font-bold text-orange-600">NutriMate</a>
          <ul className="flex gap-6 items-center">
            <li>
              <a href="/recipes" className="hover:text-orange-600 font-medium transition-colors">Recetas</a>
            </li>
            <li>
              <a href="/calorie-calculator" className="hover:text-orange-600 font-medium transition-colors">Calculadora de Calorías</a>
            </li>
          </ul>
        </div>
        <div className="flex items-center gap-4">
          <ThemeToggle />
          {isLoggedIn ? (
            <Link href="/dashboard">
              <Button className="bg-orange-600 hover:bg-orange-700">Dashboard</Button>
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
      </nav>
    </header>
  )
}
