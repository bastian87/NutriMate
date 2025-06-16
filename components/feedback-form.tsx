"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { submitFeedback } from "@/lib/mock-services"

export default function FeedbackForm() {
  const { toast } = useToast()
  const [message, setMessage] = useState("")
  const [email, setEmail] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!message.trim()) {
      toast({
        title: "Error",
        description: "Please enter a message",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      const response = await submitFeedback({ message, email })

      if (response.success) {
        toast({
          title: "Thank you!",
          description: "Your feedback has been submitted successfully.",
        })

        setMessage("")
        setEmail("")
      } else {
        throw new Error("Failed to submit feedback")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit feedback. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="feedback-message">How can we improve NutriMate?</Label>
        <Textarea
          id="feedback-message"
          placeholder="Share your thoughts, suggestions, or report issues..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="mt-1"
          rows={4}
        />
      </div>

      <div>
        <Label htmlFor="feedback-email">Email (optional)</Label>
        <Input
          id="feedback-email"
          type="email"
          placeholder="your@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mt-1"
        />
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          If you'd like us to follow up with you about your feedback
        </p>
      </div>

      <Button type="submit" className="bg-green-600 hover:bg-green-700" disabled={isSubmitting}>
        {isSubmitting ? "Submitting..." : "Submit Feedback"}
      </Button>
    </form>
  )
}
