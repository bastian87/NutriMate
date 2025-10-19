import type React from "react"
import type { Metadata } from "next"
import MobileLayoutClient from "./MobileLayoutClient"

export const metadata: Metadata = {
  title: "NutriMate Mobile",
  description: "NutriMate mobile app - Your nutrition companion on the go",
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
  },
  themeColor: '#16a34a',
}

export default function MobileLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <MobileLayoutClient>
      {children}
    </MobileLayoutClient>
  )
}
