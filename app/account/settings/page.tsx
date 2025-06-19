"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Trash2, Loader2, ArrowLeft } from "lucide-react"
import Link from "next/link"

import { useToast } from "@/components/ui/use-toast"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuthContext } from "@/components/auth/auth-provider"
import { userService } from "@/lib/services/user-service"
import type { UserPreferences } from "@/lib/types/database"
import { useLanguage } from "@/lib/i18n/context"

import ProfileForm from "@/components/forms/ProfileForm"
import HealthForm from "@/components/forms/HealthForm"
import DietForm from "@/components/forms/DietForm"
import SecurityForm from "@/components/forms/SecurityForm"

const AccountSettingsPage = () => {
  const router = useRouter()
  const { toast } = useToast()
  const { user } = useAuthContext()
  const { t } = useLanguage()

  const [preferences, setPreferences] = useState<UserPreferences | null>(null)
  const [loadingPreferences, setLoadingPreferences] = useState(true)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)

  const fetchUserPreferences = useCallback(async () => {
    if (!user) return
    setLoadingPreferences(true)
    try {
      const data = await userService.getUserPreferences(user.id)
      if (!data) throw new Error("Could not load preferences")
      setPreferences(data as UserPreferences)
    } catch (error) {
      console.error("Failed to fetch user preferences:", error)
      toast({
        title: "Error",
        description: "Could not load your preferences. Please try again later.",
        variant: "destructive",
      })
    } finally {
      setLoadingPreferences(false)
    }
  }, [user, toast])

  useEffect(() => {
    fetchUserPreferences()
  }, [fetchUserPreferences])

  const handleUpdatePreferences = async (updatedPrefs: Partial<UserPreferences>) => {
    if (!user) return
    try {
      const newPreferences = { ...preferences, ...updatedPrefs } as UserPreferences
      const result = await userService.saveUserPreferences(user.id, newPreferences)
      if (!result) throw new Error("Could not save preferences")

      setPreferences(newPreferences)
      toast({
        title: "Preferences Updated",
        description: "Your settings have been successfully saved.",
      })
    } catch (error) {
      console.error("Failed to update preferences:", error)
      toast({
        title: "Update Failed",
        description: "Could not save your changes. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleDeleteAccount = async () => {
    if (!user) return
    setDeleteLoading(true)
    try {
      const { error } = await userService.deleteUserAccount()
      if (error) throw error

      toast({
        title: "Account Deleted",
        description: "Your account has been permanently deleted.",
      })
      // Redirigir al landing page
      router.push("/")
    } catch (error) {
      console.error("Error deleting account:", error)
      toast({
        title: "Deletion Failed",
        description: error instanceof Error ? error.message : "Failed to delete account. Please try again.",
        variant: "destructive",
      })
    } finally {
      setDeleteLoading(false)
      setShowDeleteDialog(false)
    }
  }

  if (loadingPreferences) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="container mx-auto py-10 font-sans">
      {/* Back Button */}
      <div className="mb-6">
        <Link href="/account" className="inline-flex items-center text-gray-600 hover:text-orange-600">
          <ArrowLeft className="mr-2 h-4 w-4" />
          {t("accountSettings.backToAccount")}
        </Link>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold tracking-tight">Account Settings</h1>
        <p className="text-muted-foreground">Manage your account settings and update your profile information.</p>
      </motion.div>

      <div className="space-y-8 mb-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <ProfileForm user={user} />
        </motion.div>
        
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <SecurityForm user={user} />
        </motion.div>
      </div>

      {/* Danger Zone */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="mt-8"
      >
        <Card className="border-red-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600">
              <Trash2 className="h-5 w-5" />
              {t("accountSettings.dangerZone")}
            </CardTitle>
            <CardDescription>{t("accountSettings.dangerZoneDesc")}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="p-4 bg-red-50 rounded-lg border border-red-200">
              <h3 className="font-medium text-red-800 mb-2">Delete Account</h3>
              <p className="text-sm text-red-700 mb-4">
                {t("accountSettings.deleteWarning")} <strong>{t("accountSettings.deleteWarningStrong")}</strong>
              </p>
              <Button
                variant="destructive"
                onClick={() => setShowDeleteDialog(true)}
                className="bg-red-600 hover:bg-red-700"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                {t("accountSettings.deleteAccount")}
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Delete Confirmation Dialog */}
      {showDeleteDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md mx-4 font-sans">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-red-100 rounded-full">
                <Trash2 className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold">Delete Account</h3>
            </div>

            <div className="mb-6">
              <p className="text-gray-600 mb-4">
                {t("accountSettings.deleteConfirm")}
              </p>
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-sm text-red-800 font-medium mb-2">This will permanently delete:</p>
                <ul className="text-sm text-red-700 space-y-1">
                  <li>• {t("accountSettings.deleteProfile")}</li>
                  <li>• All saved recipes and meal plans</li>
                  <li>• Your subscription and billing history</li>
                  <li>• All preferences and settings</li>
                  <li>• <strong>{t("accountSettings.deleteSignIn")}</strong></li>
                </ul>
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setShowDeleteDialog(false)}
                disabled={deleteLoading}
                className="flex-1"
              >
                {t("accountSettings.cancel")}
              </Button>
              <Button
                variant="destructive"
                onClick={handleDeleteAccount}
                disabled={deleteLoading}
                className="flex-1 bg-red-600 hover:bg-red-700"
              >
                {deleteLoading ? t("accountSettings.deleting") : t("accountSettings.deleteForever")}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AccountSettingsPage
