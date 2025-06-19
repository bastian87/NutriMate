"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { Key, Loader2 } from "lucide-react"
import { authService } from "@/lib/services/auth-service"
import { useLanguage } from "@/lib/i18n/context"

interface SecurityFormProps {
  user: any // Replace 'any' with a proper user type if available
}

export default function SecurityForm({ user }: SecurityFormProps) {
  const [loading, setLoading] = useState(false)
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })
  const { toast } = useToast()
  const { t } = useLanguage()

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({
        title: t("toast.error"),
        description: t("toast.passwordMismatch"),
        variant: "destructive",
      })
      setLoading(false)
      return
    }

    if (!passwordData.currentPassword || !passwordData.newPassword) {
      toast({
        title: t("toast.error"),
        description: t("toast.requiredFields"),
        variant: "destructive",
      })
      setLoading(false)
      return
    }

    try {
      const { error } = await authService.updateUserPassword(passwordData.newPassword) // Supabase handles current password verification implicitly if needed by RLS or specific function logic

      if (error) {
        throw error
      }

      toast({
        title: t("toast.updatePasswordTitle"),
        description: t("toast.updatePasswordDesc"),
      })

      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      })
    } catch (error: any) {
      console.error("Password update error:", error)
      toast({
        title: t("toast.error"),
        description: error.message || t("toast.updatePasswordError"),
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handlePasswordInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPasswordData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Key className="h-5 w-5" />
          {t("securityForm.changePassword")}
        </CardTitle>
        <CardDescription>
          {t("securityForm.changePasswordDesc")}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handlePasswordChange} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="currentPassword">{t("securityForm.currentPassword")}</Label>
            <Input
              id="currentPassword"
              name="currentPassword"
              type="password"
              value={passwordData.currentPassword}
              onChange={handlePasswordInputChange}
              placeholder={t("securityForm.currentPasswordPlaceholder")}
              required
              autoComplete="current-password"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="newPassword">{t("securityForm.newPassword")}</Label>
            <Input
              id="newPassword"
              name="newPassword"
              type="password"
              value={passwordData.newPassword}
              onChange={handlePasswordInputChange}
              placeholder={t("securityForm.newPasswordPlaceholder")}
              required
              autoComplete="new-password"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">{t("securityForm.confirmNewPassword")}</Label>
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              value={passwordData.confirmPassword}
              onChange={handlePasswordInputChange}
              placeholder={t("securityForm.confirmNewPasswordPlaceholder")}
              required
              autoComplete="new-password"
            />
          </div>

          <Button type="submit" disabled={loading} className="w-full sm:w-auto">
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            {loading ? t("securityForm.updating") : t("securityForm.updatePassword")}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
