import type React from "react"
import type { Metadata } from "next"
import AuthLayout from "@/components/auth-layout"
import "../globals.css"

export const metadata: Metadata = {
  title: "Privacy Policy - NutriMate",
  description: "Privacy policy and data protection",
}

export default function PrivacyPolicyLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AuthLayout title="Privacy Policy - NutriMate" description="Privacy policy and data protection">
      {children}
    </AuthLayout>
  )
} 