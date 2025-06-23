"use client"

import type React from "react"
import type { Metadata } from "next"
import { useState } from "react"
import { Menu } from "lucide-react"
import MobileNavigation from "@/components/mobile-navigation"

export const metadata: Metadata = {
  title: "NutriMate Mobile",
  description: "Mobile version of NutriMate",
}

export default function MobileLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <div className="min-h-screen">
      {/* Header móvil reutilizable */}
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
