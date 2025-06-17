"use client"

import { useState } from "react"
import { Check, Globe } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useLanguage } from "@/lib/i18n/context"

interface LanguageSelectorProps {
  isCompact?: boolean
}

export function LanguageSelector({ isCompact = false }: LanguageSelectorProps) {
  const { language, setLanguage, t } = useLanguage()
  const [open, setOpen] = useState(false)

  const languages = [
    { code: "en", name: t("language.english") },
    { code: "es", name: t("language.spanish") },
    { code: "fr", name: t("language.french") },
  ]

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size={isCompact ? "icon" : "default"} className="gap-2">
          <Globe className="h-4 w-4" />
          {!isCompact && <span>{t("language.select")}</span>}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {languages.map((lang) => (
          <DropdownMenuItem
            key={lang.code}
            onClick={() => {
              setLanguage(lang.code as "en" | "es" | "fr")
              setOpen(false)
            }}
            className="flex items-center gap-2"
          >
            {language === lang.code && <Check className="h-4 w-4" />}
            <span className={language === lang.code ? "font-medium" : ""}>{lang.name}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
