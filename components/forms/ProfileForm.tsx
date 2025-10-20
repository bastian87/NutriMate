"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { userService } from "@/lib/services/user-service"
import { useLanguage } from "@/lib/i18n/context"

interface ProfileFormProps {
  user: any
}

export default function ProfileForm({ user }: ProfileFormProps) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    username: "",
  })
  const [usernameError, setUsernameError] = useState<string | null>(null)
  const [checkingUsername, setCheckingUsername] = useState(false)
  const { toast } = useToast()
  const { t } = useLanguage()

  const checkUsernameAvailability = async (username: string) => {
    if (!username || username.length < 3) {
      setUsernameError("Username must be at least 3 characters long")
      return false
    }

    const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/
    if (!usernameRegex.test(username)) {
      setUsernameError("Username must be 3-20 characters long and contain only letters, numbers, and underscores")
      return false
    }

    setCheckingUsername(true)
    setUsernameError(null)

    try {
      const response = await fetch("/api/user/check-username", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username }),
      })

      const data = await response.json()

      if (!response.ok) {
        setUsernameError(data.error || "Error checking username availability")
        return false
      }

      if (!data.available) {
        setUsernameError("Username is already taken")
        return false
      }

      setUsernameError(null)
      return true
    } catch (error) {
      setUsernameError("Error checking username availability")
      return false
    } finally {
      setCheckingUsername(false)
    }
  }

  const handleUsernameChange = async (value: string) => {
    setFormData({ ...formData, username: value })
    setUsernameError(null)

    // Debounce the username check
    if (value.length >= 3) {
      const timeoutId = setTimeout(() => {
        checkUsernameAvailability(value)
      }, 500)
      return () => clearTimeout(timeoutId)
    }
  }

  // Load user data when component mounts
  useEffect(() => {
    const loadUserProfile = async () => {
      if (!user?.id) return
      
      try {
        const profile = await userService.getUserProfile(user.id)
        if (profile) {
          setFormData({
            full_name: profile.full_name || "",
            email: profile.email || "",
            username: profile.username || "",
          })
        }
      } catch (error) {
        console.error("Error loading user profile:", error)
      }
    }

    loadUserProfile()
  }, [user?.id])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user?.id) return
    
    setLoading(true)

    // Validate username if it has changed
    if (formData.username && formData.username !== user.username) {
      const isUsernameValid = await checkUsernameAvailability(formData.username)
      if (!isUsernameValid) {
        setLoading(false)
        return
      }
    }

    try {
      const updatedProfile = await userService.updateUserProfile(user.id, {
        full_name: formData.full_name,
        email: formData.email,
        username: formData.username,
      })

      if (updatedProfile) {
        toast({
          title: t("toast.updateProfileTitle"),
          description: t("toast.updateProfileDesc"),
        })
      } else {
        throw new Error("Failed to update profile")
      }
    } catch (error) {
      console.error("Error updating profile:", error)
      toast({
        title: t("toast.error"),
        description: t("toast.updateProfileError"),
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("account.profile")}</CardTitle>
        <CardDescription>{t("profileForm.updateProfileDesc")}</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="full_name">{t("account.name")}</Label>
              <Input
                id="full_name"
                name="full_name"
                value={formData.full_name}
                onChange={handleChange}
                placeholder={t("profileForm.fullNamePlaceholder")}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">{t("account.email")}</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder={t("profileForm.emailPlaceholder")}
                className="w-full"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="username">{t("account.username")}</Label>
            <Input
              id="username"
              name="username"
              value={formData.username}
              onChange={(e) => handleUsernameChange(e.target.value)}
              placeholder="Choose a username"
              className={usernameError ? "border-red-500" : ""}
            />
            {checkingUsername && (
              <p className="text-sm text-blue-600">Checking availability...</p>
            )}
            {usernameError && (
              <p className="text-sm text-red-600">{usernameError}</p>
            )}
            {formData.username && !usernameError && !checkingUsername && (
              <p className="text-sm text-green-600">✓ Username available</p>
            )}
          </div>

          <Button type="submit" disabled={loading}>
            {loading ? t("profileForm.updating") : t("account.updateProfile")}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
