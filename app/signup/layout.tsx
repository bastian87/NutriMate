import type React from "react"
import type { Metadata } from "next"
import AuthLayout from "@/components/auth-layout"
import "../globals.css"

export const metadata: Metadata = {
  title: "Sign Up - NutriMate",
  description: "Create your account",
}

export default function SignupLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AuthLayout title="Sign Up - NutriMate" description="Create your account">
      {children}
    </AuthLayout>
  )
} 