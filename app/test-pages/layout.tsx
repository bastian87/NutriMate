import type React from "react"
import type { Metadata } from "next"
import AuthLayout from "@/components/auth-layout"


export const metadata: Metadata = {
  title: "Test Pages - NutriMate",
  description: "Testing pages",
}

export default function TestPagesLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AuthLayout title="Test Pages - NutriMate" description="Testing pages">
      {children}
    </AuthLayout>
  )
} 