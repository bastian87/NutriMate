import type React from "react"
import type { Metadata } from "next"
import AppLayout from "@/components/app-layout"
import "../globals.css"

export const metadata: Metadata = {
  title: "Dashboard - NutriMate",
  description: "Your nutrition dashboard",
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AppLayout title="Dashboard - NutriMate" description="Your nutrition dashboard">
      {children}
    </AppLayout>
  )
} 