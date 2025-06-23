import type React from "react"
import type { Metadata } from "next"
import AuthLayout from "@/components/auth-layout"
import "../globals.css"

export const metadata: Metadata = {
  title: "Forgot Password - NutriMate",
  description: "Reset your password",
}

export default function ForgotPasswordLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AuthLayout title="Forgot Password - NutriMate" description="Reset your password">
      {children}
    </AuthLayout>
  )
} 