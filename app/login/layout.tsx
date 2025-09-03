import type React from "react"
import type { Metadata } from "next"
import AuthLayout from "@/components/auth-layout"


export const metadata: Metadata = {
  title: "Login - NutriMate",
  description: "Sign in to your account",
}

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AuthLayout title="Login - NutriMate" description="Sign in to your account">
      {children}
    </AuthLayout>
  )
} 