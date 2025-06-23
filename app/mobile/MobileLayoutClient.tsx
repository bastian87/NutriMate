"use client"
import { useState } from "react"
import { Menu } from "lucide-react"
import MobileNavigation from "@/components/mobile-navigation"

export default function MobileLayoutClient({ children }: { children: React.ReactNode }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <div className="min-h-screen">
      <header className="bg-white shadow-sm px-4 py-4 flex items-center justify-between">
        <div></div>
        <h1 className="text-lg font-bold">NutriMate</h1>
        <button onClick={() => setIsMenuOpen(true)} className="w-8 h-8 flex items-center justify-center">
          <Menu className="h-6 w-6 text-gray-600" />
        </button>
      </header>
      <main className="w-full">{children}</main>
      <MobileNavigation isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
    </div>
  )
} 