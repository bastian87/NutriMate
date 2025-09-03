import type React from "react"
import type { Metadata } from "next"
import AuthLayout from "@/components/auth-layout"


export const metadata: Metadata = {
  title: "Mobile - NutriMate",
  description: "Mobile app interface",
}

export default function MobileLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AuthLayout title="Mobile - NutriMate" description="Mobile app interface">
      {children}
    </AuthLayout>
  )
}
