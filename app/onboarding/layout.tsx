import type React from "react"
import type { Metadata } from "next"
import AuthLayout from "@/components/auth-layout"
import "../globals.css"

export const metadata: Metadata = {
  title: "Onboarding - NutriMate",
  description: "Set up your profile",
}

export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AuthLayout title="Onboarding - NutriMate" description="Set up your profile">
      {children}
    </AuthLayout>
  )
} 