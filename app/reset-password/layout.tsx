import type React from "react"
import type { Metadata } from "next"
import AuthLayout from "@/components/auth-layout"
import "../globals.css"

export const metadata: Metadata = {
  title: "Reset Password - NutriMate",
  description: "Set your new password",
}

export default function ResetPasswordLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AuthLayout title="Reset Password - NutriMate" description="Set your new password">
      {children}
    </AuthLayout>
  )
} 