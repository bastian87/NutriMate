import type React from "react"
import type { Metadata } from "next"
import AuthLayout from "@/components/auth-layout"


export const metadata: Metadata = {
  title: "Checkout - NutriMate",
  description: "Complete your purchase",
}

export default function CheckoutLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AuthLayout title="Checkout - NutriMate" description="Complete your purchase">
      {children}
    </AuthLayout>
  )
} 