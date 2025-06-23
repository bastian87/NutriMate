"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect, useCallback } from "react"
import { translations } from "./translations"

const availableLanguages = ["en", "es", "fr"] as const

type Language = typeof availableLanguages[number]

interface LanguageContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: TFunction
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export type TFunction = (key: string, options?: Record<string, any>) => string

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
    (key: string, options?: Record<string, any>): any => {
      const keys = key.split(".")
      const currentTranslations = translations[language] || translations.en
      let value: any = currentTranslations

      for (const k of keys) {
        value = value?.[k]
        if (value === undefined) break
      }

      // Si es array y se pide returnObjects, devolver el array
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

      // Fallback a inglés
      let englishValue: any = translations.en
      for (const k of keys) {
        englishValue = englishValue?.[k]
        if (englishValue === undefined) break
      }

      if (Array.isArray(englishValue) && options?.returnObjects) {
        return englishValue
      }

      if (typeof englishValue === "string") {
        if (options) {
          Object.entries(options).forEach(([k, v]) => {
            englishValue = englishValue.replace(new RegExp(`{${k}}`, "g"), String(v))
          })
        }
        return englishValue
      }

      return key
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
