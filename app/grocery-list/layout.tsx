import type React from "react"
import type { Metadata } from "next"
import AppLayout from "@/components/app-layout"
import "../globals.css"

export const metadata: Metadata = {
  title: "Grocery List - NutriMate",
  description: "Manage your grocery shopping list",
}

export default function GroceryListLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AppLayout title="Grocery List - NutriMate" description="Manage your grocery shopping list">
      {children}
    </AppLayout>
  )
} 