import type React from "react"
import type { Metadata } from "next"
import AppLayout from "@/components/app-layout"
import "../globals.css"

export const metadata: Metadata = {
  title: "Saved Recipes - NutriMate",
  description: "Your saved favorite recipes",
}

export default function SavedRecipesLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AppLayout title="Saved Recipes - NutriMate" description="Your saved favorite recipes">
      {children}
    </AppLayout>
  )
} 