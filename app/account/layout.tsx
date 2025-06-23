import type React from "react"
import type { Metadata } from "next"
import AppLayout from "@/components/app-layout"
import "../globals.css"

export const metadata: Metadata = {
  title: "Account - NutriMate",
  description: "Manage your account settings",
}

export default function AccountLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AppLayout title="Account - NutriMate" description="Manage your account settings">
      {children}
    </AppLayout>
  )
} 