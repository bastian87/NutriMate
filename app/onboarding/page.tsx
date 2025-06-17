"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import OnboardingForm from "@/components/onboarding-form"
import { saveUserPreferences } from "@/lib/mock-services"
import { useLanguage } from "@/lib/i18n/context"

export default function OnboardingPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { t } = useLanguage()

  const handleComplete = async (data: any) => {
    setIsSubmitting(true)

    try {
      await saveUserPreferences(data)
      router.push("/dashboard")
    } catch (error) {
      console.error("Error saving preferences:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-3xl">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold mb-2">Welcome to NutriMate</h1>
        <p className="text-gray-600 dark:text-gray-400">Let's personalize your nutrition journey</p>
      </div>

      <OnboardingForm onComplete={handleComplete} />
    </div>
  )
}
