import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import { AuthProvider } from "@/components/auth/auth-provider"
import { UserProfileProvider } from "@/components/auth/user-profile-provider"
import { LanguageProvider } from "@/lib/i18n/context"
import Script from "next/script"
import "./globals.css"
import { Toaster } from "@/components/ui/toaster"
import { UserPreferencesProvider } from "@/components/auth/user-preferences-provider"
import { Sidebar } from "@/components/sidebar"
import { ConditionalLayout } from "@/components/conditional-layout"
import { AuthDebug } from "@/components/auth/auth-debug"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
})

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
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans`}>
        <Script src="https://www.googletagmanager.com/gtag/js?id=G-SCX9Q55CJF" strategy="afterInteractive" />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-SCX9Q55CJF');
          `}
        </Script>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <LanguageProvider>
            <AuthProvider>
              <UserProfileProvider>
                <UserPreferencesProvider>
                  <ConditionalLayout>
                    {children}
                  </ConditionalLayout>
                  <Toaster />
                  <AuthDebug />
                </UserPreferencesProvider>
              </UserProfileProvider>
            </AuthProvider>
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}