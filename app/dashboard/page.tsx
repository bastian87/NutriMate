"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar, Home, Crown } from "lucide-react"
import Link from "next/link"
import { DashboardFoodDiary } from "@/components/dashboard-food-diary"
import { motion } from "framer-motion"
import { useLanguage } from "@/lib/i18n/context"
import { useAuthContext } from "@/components/auth/simple-auth-provider"
import { useUserProfile, useIsPremium } from "@/components/auth/user-profile-provider"
import { Badge } from "@/components/ui/badge"

export default function DashboardPage() {
  const { t } = useLanguage()
  const { user, loading: authLoading } = useAuthContext()
  const { userData, loading: profileLoading } = useUserProfile()
  const isPremium = useIsPremium()

  if (authLoading || profileLoading) {
    return (
      <div className="container mx-auto px-4 py-8 flex items-center justify-center min-h-[calc(100vh-200px)]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">{t("dashboard.loading")}</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <Card className="w-full max-w-md">
            <CardContent className="p-8 text-center">
              <Home className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">{t("dashboard.accessRequired")}</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">{t("dashboard.pleaseSignIn")}</p>
              <div className="space-y-3">
                <Link href="/login" className="w-full">
                  <Button className="w-full">{t("dashboard.signIn")}</Button>
                </Link>
                <Link href="/signup" className="w-full">
                  <Button variant="outline" className="w-full">
                    {t("dashboard.createAccount")}
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }


  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b">
        <div className="container mx-auto px-4 py-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
          >
            <div>
              <h1 className="text-3xl font-bold mb-2">{t("dashboard.welcome")}</h1>
              <p className="text-gray-600 dark:text-gray-400 mb-2">{t("dashboard.subtitle")}</p>
              {userData?.profile?.full_name && (
                <p className="text-sm text-gray-500">¡Bienvenido de vuelta, {userData.profile.full_name}!</p>
              )}
              <div className="flex items-center gap-2 mt-2">
                <Badge variant={isPremium ? "default" : "secondary"} className={isPremium ? "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300" : ""}>
                  {isPremium ? (
                    <>
                      <Crown className="h-3 w-3 mr-1" />
                      Cuenta Premium
                    </>
                  ) : (
                    "Cuenta Gratuita"
                  )}
                </Badge>
                {userData?.usage && (
                  <div className="text-xs text-gray-500">
                    {userData.usage.mealPlans.created}/{userData.usage.mealPlans.maxCreated} planes de comida
                  </div>
                )}
              </div>
            </div>
            <div className="flex gap-2">
              <Link href="/food-diary">
                <Button className="bg-green-600 hover:bg-green-700">
                  <Calendar className="h-4 w-4 mr-2" />
                  Registrar Comida
                </Button>
              </Link>
              <Link href="/calendar">
                <Button variant="outline">
                  <Calendar className="h-4 w-4 mr-2" />
                  Ver Calendario
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Food Diary Dashboard Content */}
      <DashboardFoodDiary />
    </div>
  )
}
