import type React from "react"

/**
 * Layout for calendar page - bypasses conditional layout
 */
export default function CalendarLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <main className="min-h-screen bg-background">
      {children}
    </main>
  )
}
