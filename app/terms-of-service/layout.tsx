import type React from "react"
import type { Metadata } from "next"
import AuthLayout from "@/components/auth-layout"
import "../globals.css"

export const metadata: Metadata = {
  title: "Terms of Service - NutriMate",
  description: "Terms and conditions of service",
}

export default function TermsOfServiceLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AuthLayout title="Terms of Service - NutriMate" description="Terms and conditions of service">
      {children}
    </AuthLayout>
  )
} 