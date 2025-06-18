"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect, useCallback } from "react"
import { translations } from "./translations"

type Language = "en" | "es" | "fr"

interface LanguageContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: string, fallback?: string) => string
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  // Initialize with a default language. 'en' is a safe default.
  const [language, setLanguageState] = useState<Language>("en")
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
    // Load saved language from localStorage only on the client-side after mount
    const savedLanguage = localStorage.getItem("nutrimate-language") as Language
    if (savedLanguage && (savedLanguage === "en" || savedLanguage === "es" || savedLanguage === "fr")) {
      setLanguageState(savedLanguage)
    }
  }, [])

  const handleSetLanguage = useCallback(
    (lang: Language) => {
      setLanguageState(lang)
      if (isMounted) {
        // Only interact with localStorage on the client
        localStorage.setItem("nutrimate-language", lang)
      }
    },
    [isMounted],
  )

  const t = useCallback(
    (key: string, fallback?: string): string => {
      const keys = key.split(".")
      const currentTranslations = translations[language] || translations.en
      let value: any = currentTranslations

      for (const k of keys) {
        value = value?.[k]
        if (value === undefined) break
      }

      if (typeof value === "string") {
        return value
      }

      // Fallback to English if current language doesn't have the key
      let englishValue: any = translations.en
      for (const k of keys) {
        englishValue = englishValue?.[k]
        if (englishValue === undefined) break
      }

      if (typeof englishValue === "string") {
        return englishValue
      }

      return fallback || key
    },
    [language],
  )

  // Always render the Provider.
  // The language value will be the default ('en') until localStorage is read on the client.
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
