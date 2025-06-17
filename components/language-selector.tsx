"use client"

import { useState, useEffect, useContext } from "react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Globe } from "lucide-react"
import { LanguageContext } from "@/lib/i18n/context"

// Safe language context hook
function useSafeLanguage() {
  try {
    const context = useContext(LanguageContext)
    if (!context) {
      throw new Error("useLanguage must be used within a LanguageProvider")
    }
    return context
  } catch (error) {
    // Return fallback if context is not available
    return {
      language: "en",
      setLanguage: () => {},
      t: (key: string, fallback?: string) => fallback || key,
    }
  }
}

interface LanguageSelectorProps {
  isCompact?: boolean
}

export function LanguageSelector({ isCompact = false }: LanguageSelectorProps) {
  const { language, setLanguage } = useSafeLanguage()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  const languages = [
    { code: "en", name: "English", flag: "🇺🇸" },
    { code: "es", name: "Español", flag: "🇪🇸" },
    { code: "fr", name: "Français", flag: "🇫🇷" },
  ]

  const currentLanguage = languages.find((lang) => lang.code === language) || languages[0]

  if (isCompact) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <Globe className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {languages.map((lang) => (
            <DropdownMenuItem
              key={lang.code}
              onClick={() => setLanguage(lang.code as any)}
              className={language === lang.code ? "bg-accent" : ""}
            >
              <span className="mr-2">{lang.flag}</span>
              {lang.name}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="w-full justify-start">
          <Globe className="mr-2 h-4 w-4" />
          <span className="mr-2">{currentLanguage.flag}</span>
          {currentLanguage.name}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {languages.map((lang) => (
          <DropdownMenuItem
            key={lang.code}
            onClick={() => setLanguage(lang.code as any)}
            className={language === lang.code ? "bg-accent" : ""}
          >
            <span className="mr-2">{lang.flag}</span>
            {lang.name}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
