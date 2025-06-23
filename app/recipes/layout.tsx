import type React from "react"
import type { Metadata } from "next"
import AppLayout from "@/components/app-layout"
import "../globals.css"

export const metadata: Metadata = {
  title: "Recipes - NutriMate",
  description: "Discover and save delicious recipes",
}

export default function RecipesLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AppLayout title="Recipes - NutriMate" description="Discover and save delicious recipes">
      {children}
    </AppLayout>
  )
} 