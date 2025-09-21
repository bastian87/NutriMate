import type React from "react"
import { HorizontalNavigation } from "@/components/horizontal-navigation"

interface AppLayoutProps {
  children: React.ReactNode
  title?: string
  description?: string
}

export default function AppLayout({ 
  children, 
  title = "NutriMate", 
  description = "Your nutrition companion" 
}: AppLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <HorizontalNavigation />
      <main className="p-4 lg:p-6">
        {children}
      </main>
    </div>
  )
} 