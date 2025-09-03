import type React from "react"
import type { Metadata } from "next"
import AuthLayout from "@/components/auth-layout"


export const metadata: Metadata = {
  title: "Pricing - NutriMate",
  description: "Choose your plan",
}

export default function PricingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AuthLayout title="Pricing - NutriMate" description="Choose your plan">
      {children}
    </AuthLayout>
  )
} 