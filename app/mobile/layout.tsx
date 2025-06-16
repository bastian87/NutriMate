import type React from "react"
import type { Metadata } from "next"
import { Sidebar } from "@/components/sidebar"

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
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 p-4 overflow-auto">{children}</main>
    </div>
  )
}
