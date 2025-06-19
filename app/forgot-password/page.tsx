"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ArrowLeft, Mail } from "lucide-react"
import Link from "next/link"
import { supabase } from "@/lib/supabase/client"
import { useLanguage } from "@/lib/i18n/context"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")
  const { t } = useLanguage()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")
    setMessage("")

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      })

      if (error) {
        setError(t("forgotPassword.unexpectedError"))
      } else {
        setMessage(t("forgotPassword.checkEmail"))
      }
    } catch (err) {
      setError(t("forgotPassword.unexpectedError"))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-cream-50 px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center">{t("forgotPassword.resetYourPassword")}</CardTitle>
          <p className="text-center text-sm text-gray-600 mt-2">
            {t("forgotPassword.enterEmail")}
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {message && (
              <Alert className="border-green-200 bg-green-50">
                <Mail className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">{message}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">{t("forgotPassword.emailAddress")}</Label>
              <Input
                id="email"
                type="email"
                placeholder={t("forgotPassword.enterYourEmail")}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>

            <Button type="submit" className="w-full bg-orange-500 hover:bg-orange-600" disabled={isLoading}>
              {isLoading ? t("forgotPassword.sending") : t("forgotPassword.sendResetLink")}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <Link href="/login" className="inline-flex items-center text-sm text-orange-600 hover:text-orange-700">
              <ArrowLeft className="h-4 w-4 mr-1" />
              {t("forgotPassword.backToSignIn")}
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
