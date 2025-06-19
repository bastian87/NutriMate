"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { feedbackService } from "@/lib/services/feedback-service"
import { useLanguage } from "@/lib/i18n/context"

export default function FeedbackForm() {
  const { toast } = useToast()
  const { t } = useLanguage()
  const [message, setMessage] = useState("")
  const [email, setEmail] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!message.trim()) {
      toast({
        title: t("feedback.errorTitle"),
        description: t("feedback.emptyMessage"),
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      const response = await feedbackService.submitFeedback({ message, email })

      if (response.success) {
        toast({
          title: t("feedback.successTitle"),
          description: t("feedback.successDesc"),
        })

        setMessage("")
        setEmail("")
      } else {
        throw new Error("Failed to submit feedback")
      }
    } catch (error) {
      toast({
        title: t("feedback.errorTitle"),
        description: t("feedback.errorDesc"),
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="feedback-message">{t("feedback.label")}</Label>
        <Textarea
          id="feedback-message"
          placeholder={t("feedback.placeholder")}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="mt-1"
          rows={4}
        />
      </div>

      <div>
        <Label htmlFor="feedback-email">{t("feedback.emailLabel")}</Label>
        <Input
          id="feedback-email"
          type="email"
          placeholder={t("feedback.emailPlaceholder")}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mt-1"
        />
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          {t("feedback.followUp")}
        </p>
      </div>

      <Button type="submit" className="bg-green-600 hover:bg-green-700" disabled={isSubmitting}>
        {isSubmitting ? t("feedback.submitting") : t("feedback.submit")}
      </Button>
    </form>
  )
}
