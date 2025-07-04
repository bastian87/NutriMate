import type React from "react"

interface AuthLayoutProps {
  children: React.ReactNode
  title?: string
  description?: string
}

export default function AuthLayout({ 
  children, 
  title = "NutriMate", 
  description = "Your nutrition companion" 
}: AuthLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      {children}
    </div>
  )
} 