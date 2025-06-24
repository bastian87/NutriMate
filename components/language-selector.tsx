"use client"

import { useState, useEffect } from "react"
import { Check, Globe } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useLanguage } from "@/lib/i18n/context"

interface LanguageSelectorProps {
  isCompact?: boolean
}

// Componente de bandera usando imágenes SVG desde CDN
function Flag({ country }: { country: string }) {
  // flagcdn usa códigos en minúsculas
  return (
    <img
      src={`https://flagcdn.com/24x18/${country}.png`}
      alt={`${country.toUpperCase()} flag`}
      className="w-5 h-5 rounded-sm shadow border"
      style={{ minWidth: 20, minHeight: 20, objectFit: 'cover' }}
    />
  );
}

export function LanguageSelector({ isCompact = false }: LanguageSelectorProps) {
  const { language, setLanguage, t } = useLanguage()
  const [open, setOpen] = useState(false)

  const languages = [
    { code: "en", name: t("language.english"), flag: "us" },
    { code: "es", name: t("language.spanish"), flag: "ar" },
    { code: "fr", name: t("language.french"), flag: "fr" },
  ]

  const currentLanguage = languages.find(lang => lang.code === language)

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size={isCompact ? "icon" : "default"} className="gap-2">
          {isCompact ? (
            <Flag country={currentLanguage?.flag || "us"} />
          ) : (
            <>
              <Globe className="h-4 w-4" />
              <span>{t("language.select")}</span>
            </>
          )}
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
            className="flex items-center gap-3"
          >
            <Flag country={lang.flag} />
            <span className={language === lang.code ? "font-medium" : ""}>{lang.name}</span>
            {language === lang.code && <Check className="h-4 w-4 ml-auto" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
