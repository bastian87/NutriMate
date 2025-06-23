import type React from "react"
import { Sidebar } from "@/components/sidebar"

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
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 p-4 lg:p-6 overflow-auto bg-cream-50">
        {children}
      </main>
    </div>
  )
} 