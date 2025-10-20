"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar, Home, Crown, Plus as PlusIcon } from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"
import { useLanguage } from "@/lib/i18n/context"
import { useAuthContext } from "@/components/auth/simple-auth-provider"
import { useUserProfile, useIsPremium } from "@/components/auth/user-profile-provider"
import { Badge } from "@/components/ui/badge"
import { DashboardSkeleton } from "@/components/loading-skeleton"
import { CaloriesIcon, WeightIcon, CarbsIcon, FatsIcon } from "@/components/icons-new"

export default function DashboardPage() {
  const { t } = useLanguage()
  const { user, loading: authLoading } = useAuthContext()
  const { userData, loading: profileLoading } = useUserProfile()
  const isPremium = useIsPremium()

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-pink-50">
        <div className="container mx-auto px-4 py-8">
          <DashboardSkeleton />
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
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-pink-50">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b">
        <div className="container mx-auto px-4 py-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col gap-6"
          >
            {/* Welcome Section */}
            <div className="text-center sm:text-left">
              <h1 className="text-2xl sm:text-3xl font-bold mb-2">{t("dashboard.welcome")}</h1>
              <p className="text-gray-600 dark:text-gray-400 text-base mb-3">{t("dashboard.subtitle")}</p>
              {userData?.profile?.full_name && (
                <p className="text-sm text-gray-500 mb-4">{t("dashboard.welcomeBack", { name: userData.profile.full_name })}</p>
              )}
              <div className="flex justify-center sm:justify-start">
                <Badge className={isPremium ? "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300 px-3 py-1" : "px-3 py-1"}>
                  {isPremium ? (
                    <>
                      <Crown className="h-3 w-3 mr-1" />
                      <span>{t("subscriptionStatus.premiumAccount")}</span>
                    </>
                  ) : (
                    <span>{t("subscriptionStatus.freeAccount")}</span>
                  )}
                </Badge>
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 w-full">
              <Link href="/food-diary?openAddDialog=true" className="flex-1">
                <Button className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white shadow-lg shadow-orange-500/30 px-6 py-3 text-base font-semibold w-full h-12">
                  <PlusIcon className="h-5 w-5 mr-2" />
                  {t("dashboard.registerFood")}
                </Button>
              </Link>
              <Link href="/calendar" className="flex-1">
                <Button variant="outline" className="px-6 py-3 text-base font-semibold border-2 border-orange-200 hover:border-orange-300 hover:bg-orange-50 w-full h-12">
                  <Calendar className="h-5 w-5 mr-2" />
                  {t("dashboard.viewCalendar")}
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="space-y-8">
          {/* Quick Stats Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="bg-white shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <CaloriesIcon className="w-6 h-6 text-orange-600" />
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-orange-600">0</div>
                    <div className="text-xs text-gray-500">kcal</div>
                  </div>
                </div>
                <div className="text-sm font-medium text-gray-700">Calorías Hoy</div>
                <div className="text-xs text-gray-500 mt-1">Meta: 2000 kcal</div>
              </CardContent>
            </Card>
            <Card className="bg-white shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <WeightIcon className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-blue-600">0.0g</div>
                    <div className="text-xs text-gray-500">proteína</div>
                  </div>
                </div>
                <div className="text-sm font-medium text-gray-700">Proteína</div>
                <div className="text-xs text-gray-500 mt-1">Meta: 150g</div>
              </CardContent>
            </Card>
            <Card className="bg-white shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <CarbsIcon className="w-6 h-6 text-green-600" />
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-green-600">0.0g</div>
                    <div className="text-xs text-gray-500">carbohidratos</div>
                  </div>
                </div>
                <div className="text-sm font-medium text-gray-700">Carbohidratos</div>
                <div className="text-xs text-gray-500 mt-1">Meta: 250g</div>
              </CardContent>
            </Card>
            <Card className="bg-white shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <FatsIcon className="w-6 h-6 text-purple-600" />
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-purple-600">0.0g</div>
                    <div className="text-xs text-gray-500">grasas</div>
                  </div>
                </div>
                <div className="text-sm font-medium text-gray-700">Grasas</div>
                <div className="text-xs text-gray-500 mt-1">Meta: 65g</div>
              </CardContent>
            </Card>
          </div>

          {/* Main Dashboard Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Calendar Widget */}
            <Card className="bg-white shadow-sm">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4">Octubre 2025</h3>
                <div className="space-y-2">
                  {/* Week Days Header */}
                  <div className="grid grid-cols-7 gap-1">
                    {['L', 'M', 'X', 'J', 'V', 'S', 'D'].map((day, index) => (
                      <div key={index} className="text-xs font-medium text-gray-500 py-2 text-center">
                        {day}
                      </div>
                    ))}
                  </div>
                  
                  {/* Calendar Grid */}
                  <div className="grid grid-cols-7 gap-1">
                    {/* Empty cells for days before the first day of the month */}
                    {Array.from({ length: 1 }, (_, i) => (
                      <div key={`empty-${i}`} className="h-8" />
                    ))}
                    
                    {/* Days of the month */}
                    {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
                      <div 
                        key={day} 
                        className={`text-sm py-2 rounded-lg text-center min-h-[2rem] flex items-center justify-center ${
                          day === 15 ? 'bg-orange-100 text-orange-800 font-semibold' : 
                          'hover:bg-gray-100 cursor-pointer'
                        }`}
                      >
                        {day}
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Today's Progress */}
            <Card className="bg-white shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Progreso de Hoy</h3>
                  <Badge className="bg-red-100 text-red-800">▲ Necesita atención</Badge>
                </div>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Calorías</span>
                      <span>0 / 2000</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-orange-500 h-2 rounded-full" style={{ width: '0%' }}></div>
                    </div>
                  </div>
                  <div className="text-sm text-gray-600">
                    <div>0 0.0g 0.0g</div>
                    <div>Comidas Proteína Carbohidratos registradas</div>
                  </div>
                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 text-sm text-orange-800">
                    Registra más comidas para alcanzar tu meta diaria.
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recent Entries */}
            <Card className="bg-white shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Entradas Recientes</h3>
                  <Calendar className="h-5 w-5 text-gray-400" />
                </div>
                <div className="text-center py-8">
                  <div className="text-gray-400 mb-2">No hay entradas recientes</div>
                  <Button variant="outline" size="sm" className="mt-2">
                    Ver Calendario
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Week Summary */}
          <Card className="bg-white shadow-sm">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4">Resumen de la Semana</h3>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600 mb-1">0</div>
                  <div className="text-sm text-gray-600">Calorías promedio</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600 mb-1">0g</div>
                  <div className="text-sm text-gray-600">Proteína total</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600 mb-1">0g</div>
                  <div className="text-sm text-gray-600">Carbohidrato total</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600 mb-1">0g</div>
                  <div className="text-sm text-gray-600">Grasas total</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}