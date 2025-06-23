import type React from "react"
import type { Metadata } from "next"
import "../globals.css"

export const metadata: Metadata = {
  title: "NutriMate - Your Nutrition Companion",
  description: "Plan meals, track nutrition, and discover recipes with NutriMate",
  generator: 'v0.dev'
}

export default function LandingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-cream-50">
      {children}
    </div>
  )
}
