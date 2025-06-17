"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { translations } from "./translations"

type Language = "en" | "es" | "fr"

interface LanguageContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: string, fallback?: string) => string
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>("en")
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    // Load saved language from localStorage
    const savedLanguage = localStorage.getItem("nutrimate-language") as Language
    if (savedLanguage && (savedLanguage === "en" || savedLanguage === "es" || savedLanguage === "fr")) {
      setLanguage(savedLanguage)
    }
  }, [])

  const handleSetLanguage = (lang: Language) => {
    setLanguage(lang)
    if (mounted) {
      localStorage.setItem("nutrimate-language", lang)
    }
  }

  const t = (key: string, fallback?: string): string => {
    // Handle nested keys like "home.title"
    const keys = key.split(".")
    let value: any = translations[language] || translations.en

    for (const k of keys) {
      value = value?.[k]
      if (value === undefined) break
    }

    // If translation found, return it
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

    // If no translation found, return the fallback or the key itself
    return fallback || key
  }

  // Prevent hydration mismatch
  if (!mounted) {
    return <>{children}</>
  }

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
