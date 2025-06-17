import type React from "react"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "NutriMate Mobile",
  description: "Mobile version of NutriMate",
}

export default function MobileLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen">
      <main className="w-full">{children}</main>
    </div>
  )
}
