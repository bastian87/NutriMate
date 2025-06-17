import type React from "react"
import { ThemeProvider } from "@/components/theme-provider"
import { AuthProvider } from "@/components/auth/auth-provider"
import { LanguageProvider } from "@/lib/i18n/context"

export default function LandingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <LanguageProvider>
        <AuthProvider>
          <div className="min-h-screen">{children}</div>
        </AuthProvider>
      </LanguageProvider>
    </ThemeProvider>
  )
}
