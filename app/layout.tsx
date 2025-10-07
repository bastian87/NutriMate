import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import { SimpleAuthProvider as AuthProvider } from "@/components/auth/simple-auth-provider"
import { UserProfileProvider } from "@/components/auth/user-profile-provider"
import { LanguageProvider } from "@/lib/i18n/context"
import Script from "next/script"
import "./globals.css"
import { Toaster } from "@/components/ui/toaster"
import { UserPreferencesProvider } from "@/components/auth/user-preferences-provider"
import { ConditionalLayout } from "@/components/conditional-layout"
import { OnboardingGuard } from "@/components/onboarding-guard"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
})

export const metadata: Metadata = {
  title: "NutriMate - Your Nutrition Companion",
  description: "Plan meals, track nutrition, and discover recipes with NutriMate",
  generator: 'v0.dev',
  manifest: '/manifest.webmanifest',
  themeColor: '#16a34a',
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'NutriMate',
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    type: 'website',
    siteName: 'NutriMate',
    title: 'NutriMate - Your Nutrition Companion',
    description: 'Plan meals, track nutrition, and discover recipes with NutriMate',
  },
  twitter: {
    card: 'summary',
    title: 'NutriMate - Your Nutrition Companion',
    description: 'Plan meals, track nutrition, and discover recipes with NutriMate',
  },
  icons: {
    icon: [
      { url: '/icons/icon-192x192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icons/icon-512x512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [
      { url: '/icons/icon-152x152.png', sizes: '152x152', type: 'image/png' },
    ],
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="application-name" content="NutriMate" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="NutriMate" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="msapplication-config" content="/browserconfig.xml" />
        <meta name="msapplication-TileColor" content="#16a34a" />
        <meta name="msapplication-tap-highlight" content="no" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
        <link rel="apple-touch-icon" sizes="152x152" href="/icons/icon-152x152.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/icons/icon-192x192.png" />
        <link rel="apple-touch-icon" sizes="167x167" href="/icons/icon-192x192.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/icons/icon-192x192.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/icons/icon-192x192.png" />
        <link rel="mask-icon" href="/icons/icon-192x192.png" color="#16a34a" />
        <link rel="shortcut icon" href="/icons/icon-192x192.png" />
      </head>
      <body className={`${inter.variable} font-sans antialiased min-h-screen bg-background text-foreground`}>
        <Script src="/scripts/error-handler.js" strategy="beforeInteractive" />
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
                </UserPreferencesProvider>
              </UserProfileProvider>
            </AuthProvider>
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
