"use client"

// Language selector is hidden in single-language mode
// Structure kept for future re-enablement of multi-language support
import { useLanguage } from "@/lib/i18n/context"

interface LanguageSelectorProps {
  isCompact?: boolean
}

/**
 * LanguageSelector component - Hidden in single-language mode
 * 
 * This component is kept for API compatibility but returns null.
 * To re-enable multi-language support:
 * 1. Restore the original implementation below
 * 2. Update lib/i18n/context.tsx to support language switching
 * 3. Add language switcher back to navigation components
 */
export function LanguageSelector({ isCompact = false }: LanguageSelectorProps) {
  // Component is hidden - single language mode active
  // Always returns null to maintain API compatibility
  return null
}
