import type React from "react"
import type { Metadata } from "next"
import ClientLayout from "./ClientLayout"

export const metadata: Metadata = {
  title: "NutriMate - Your Nutrition Companion",
  description: "Plan meals, track nutrition, and discover recipes with NutriMate",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <ClientLayout>{children}</ClientLayout>
}


import './globals.css'