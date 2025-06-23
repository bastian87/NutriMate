import type React from "react"
import type { Metadata } from "next"
import AppLayout from "@/components/app-layout"
import "../globals.css"

export const metadata: Metadata = {
  title: "Admin - NutriMate",
  description: "Admin dashboard",
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AppLayout title="Admin - NutriMate" description="Admin dashboard">
      {children}
    </AppLayout>
  )
} 