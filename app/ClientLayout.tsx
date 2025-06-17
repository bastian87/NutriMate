"use client"

import type React from "react"
import "./globals.css"
import { Inter } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import { AuthProvider } from "@/components/auth/auth-provider"
import { LanguageProvider } from "@/lib/i18n/context"
import { Sidebar } from "@/components/sidebar"
import Script from "next/script"
import { usePathname } from "next/navigation"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
})

function LayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isLandingPage = pathname === "/landing"

  if (isLandingPage) {
    return <div className="min-h-screen">{children}</div>
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 p-4 lg:p-6 overflow-auto">{children}</main>
    </div>
  )
}

export default function ClientLayout({
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
              <LayoutContent>{children}</LayoutContent>
            </AuthProvider>
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
