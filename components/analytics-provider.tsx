"use client"

import type React from "react"

import { useAnalytics } from "@/hooks/use-analytics"

export function AnalyticsProvider({ children }: { children: React.ReactNode }) {
  // Initialize analytics tracking
  useAnalytics()

  return <>{children}</>
}
