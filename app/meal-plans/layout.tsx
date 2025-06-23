import type React from "react"
import type { Metadata } from "next"
import AppLayout from "@/components/app-layout"
import "../globals.css"

export const metadata: Metadata = {
  title: "Meal Plans - NutriMate",
  description: "Plan your meals and track nutrition",
}

export default function MealPlansLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AppLayout title="Meal Plans - NutriMate" description="Plan your meals and track nutrition">
      {children}
    </AppLayout>
  )
} 