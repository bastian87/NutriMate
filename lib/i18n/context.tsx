"use client"

import type React from "react"
import { createContext, useContext, useCallback } from "react"
import { translations } from "./translations"

// Simplified: Only English is active, but structure kept for future re-enablement
const availableLanguages = ["en", "es"] as const

type Language = typeof availableLanguages[number]

interface LanguageContextType {
  language: Language
  setLanguage: (lang: Language) => void // Kept for API compatibility, but no-op
  t: TFunction
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export type TFunction = (key: string, options?: Record<string, any>) => string

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  // Always use English - language switching disabled
  const language: Language = "en"

  // No-op function to maintain API compatibility
  const handleSetLanguage = useCallback((lang: Language) => {
    // Language switching disabled - do nothing
    // This keeps the API compatible for future re-enablement
  }, [])

  const t = useCallback(
    (key: string, options?: Record<string, any>): any => {
      const keys = key.split(".")
      // Always use English translations
      const currentTranslations = translations.en
      let value: any = currentTranslations

      for (const k of keys) {
        value = value?.[k]
        if (value === undefined) break
      }

      // If array and returnObjects requested, return the array
      if (Array.isArray(value) && options?.returnObjects) {
        return value
      }

      if (typeof value === "string") {
        if (options) {
          Object.entries(options).forEach(([k, v]) => {
            value = value.replace(new RegExp(`{${k}}`, "g"), String(v))
          })
        }
        return value
      }

      // Fallback to key if translation not found
      return key
    },
    [], // No dependencies - always uses English
  )

  return (
    <LanguageContext.Provider value={{ language, setLanguage: handleSetLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider")
  }
  return context
}
