"use client"

/**
 * Home Screen - Fast Daily Logging with Gamification
 * 
 * This screen is the main entry point for users and focuses on:
 * 1. Today's calories and macros (minimal display)
 * 2. XP gained today and current streak (gamification)
 * 3. Today's logged meals (simple list)
 * 4. Clear call to action to add a meal
 * 
 * Layout:
 * - Header: "Today" with user greeting
 * - Calories Card: Large, prominent display with progress
 * - Quick Stats: XP Today and Streak side-by-side
 * - Macros: Simple percentage display
 * - Meals List: Today's logged meals with name, kcal, time
 * - Floating Action Button: "Add Meal" (always visible)
 */

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useLanguage } from "@/lib/i18n/context"
import { useAuthContext } from "@/components/auth/simple-auth-provider"
import { useUserProfile, useIsPremium } from "@/components/auth/user-profile-provider"
import { DashboardSkeleton } from "@/components/loading-skeleton"
import { useActiveGoal } from "@/hooks/useActiveGoal"
import { Plus, Zap, Flame, Clock } from "lucide-react"
import { ImageWithFallback } from "@/components/image-with-fallback"
import Link from "next/link"
import { motion } from "framer-motion"

interface TodayData {
  calories: number
  protein: number
  carbs: number
  fat: number
  xpToday: number
  streak: number
  mealsCount: number
  meals: Array<{
    id: string
    category: string
    menu?: string
    calories?: number
    time: string
    image_url?: string | null
  }>
  mealsWithoutCalories: number
}

export default function DashboardPage() {
  const { t } = useLanguage()
  const { user, loading: authLoading } = useAuthContext()
  const { userData, loading: profileLoading } = useUserProfile()
  const isPremium = useIsPremium()
  const { activeGoal } = useActiveGoal()
  const [todayData, setTodayData] = useState<TodayData>({
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
    xpToday: 0,
    streak: 0,
    mealsCount: 0,
    meals: [],
    mealsWithoutCalories: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user?.id || authLoading) {
      if (!authLoading) setLoading(false)
      return
    }

    const fetchTodayData = async () => {
      try {
        setLoading(true)
        const today = new Date().toISOString().split('T')[0]

        // Fetch food entries for today
        const entriesRes = await fetch(`/api/food-entries?date=${today}`)
        const entriesData = await entriesRes.json()
        const entries = entriesData.entries || []

        // Calculate nutrition totals
        const nutrition = entries.reduce((acc: any, entry: any) => ({
          calories: acc.calories + (entry.calories || 0),
          protein: acc.protein + (entry.protein || 0),
          carbs: acc.carbs + (entry.carb || 0),
          fat: acc.fat + (entry.fats || 0)
        }), { calories: 0, protein: 0, carbs: 0, fat: 0 })

        // Fetch gamification data (XP and streak)
        const gamificationRes = await fetch('/api/gamification')
        const gamificationData = await gamificationRes.json()
        const xpToday = gamificationData.todayXp || 0
        const streak = gamificationData.currentStreak || 0

        // Format meals
        const meals = entries.map((entry: any) => ({
          id: entry.id,
          category: entry.category,
          menu: entry.menu,
          calories: entry.calories,
          time: entry.time,
          image_url: entry.image_url || null
        }))

        // Count meals without calories
        const mealsWithoutCalories = entries.filter((entry: any) => 
          !entry.calories || entry.calories === null
        ).length

        setTodayData({
          calories: nutrition.calories,
          protein: nutrition.protein,
          carbs: nutrition.carbs,
          fat: nutrition.fat,
          xpToday: xpToday,
          streak: streak,
          mealsCount: entries.length,
          meals: meals,
          mealsWithoutCalories: mealsWithoutCalories
        })
      } catch (error) {
        console.error('Error fetching today data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchTodayData()
  }, [user?.id, authLoading])

  // Calculate macro percentages (for display only)
  const totalMacros = todayData.protein + todayData.carbs + todayData.fat
  const proteinPercent = totalMacros > 0 ? Math.round((todayData.protein / totalMacros) * 100) : 0
  const carbsPercent = totalMacros > 0 ? Math.round((todayData.carbs / totalMacros) * 100) : 0
  const fatPercent = totalMacros > 0 ? Math.round((todayData.fat / totalMacros) * 100) : 0

  const targetCalories = activeGoal?.targetKcalDay || 2000
  const calorieProgress = Math.min((todayData.calories / targetCalories) * 100, 100)

  if (authLoading || loading) {
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
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-pink-50 pb-24">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Today</h1>
              {userData?.profile?.full_name && (
                <p className="text-sm text-gray-500">Welcome back, {userData.profile.full_name}</p>
              )}
            </div>
            {isPremium && (
              <Badge className="bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300">
                Premium
              </Badge>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6 space-y-4">
        {/* Calories Card - Large and Prominent */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white shadow-lg border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-orange-100 text-sm font-medium mb-1">Calories Today</p>
                  <h2 className="text-5xl font-bold">{Math.round(todayData.calories)}</h2>
                  <p className="text-orange-100 text-sm mt-1">of {targetCalories} kcal</p>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold">{Math.round(calorieProgress)}%</div>
                  <p className="text-orange-100 text-xs">Progress</p>
                </div>
              </div>
              {/* Progress Bar */}
              <div className="w-full bg-orange-400/30 rounded-full h-3">
                <div
                  className="bg-white rounded-full h-3 transition-all duration-500"
                  style={{ width: `${calorieProgress}%` }}
                />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* XP Today and Streak - Side by Side */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <div className="grid grid-cols-2 gap-4">
            <Card className="bg-white shadow-sm border-0">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
                    <Zap className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">XP Today</p>
                    <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{todayData.xpToday}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-white shadow-sm border-0">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                    <Flame className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Streak</p>
                    <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">{todayData.streak} days</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </motion.div>

        {/* Macros - Simple Percentage Display */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.15 }}
        >
          <Card className="bg-white shadow-sm border-0">
            <CardContent className="p-4">
              <h3 className="text-sm font-semibold mb-3 text-gray-700 dark:text-gray-300">Macros</h3>
              <div className="grid grid-cols-3 gap-3">
                <div className="text-center">
                  <div className="text-xl font-bold text-blue-600 dark:text-blue-400">{proteinPercent}%</div>
                  <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">Protein</div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-bold text-green-600 dark:text-green-400">{carbsPercent}%</div>
                  <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">Carbs</div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-bold text-purple-600 dark:text-purple-400">{fatPercent}%</div>
                  <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">Fat</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Today's Logged Meals - Simple List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <Card className="bg-white shadow-sm border-0">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Meals Today</h3>
                <div className="flex items-center gap-2">
                  {todayData.mealsWithoutCalories > 0 && (
                    <Badge variant="outline" className="text-xs text-gray-500 dark:text-gray-400">
                      {todayData.mealsWithoutCalories} without calories
                    </Badge>
                  )}
                  <Badge variant="secondary" className="bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300">
                    {todayData.mealsCount}
                  </Badge>
                </div>
              </div>
              {todayData.meals.length === 0 ? (
                <div className="text-center py-8 text-gray-400 dark:text-gray-500">
                  <p className="text-sm font-medium mb-1">No meals logged yet</p>
                  <p className="text-xs">Tap the button below to add your first meal</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {todayData.meals.map((meal) => (
                    <div
                      key={meal.id}
                      className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        {/* Thumbnail or Icon */}
                        {meal.image_url ? (
                          <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 border border-gray-200 dark:border-gray-700">
                            <ImageWithFallback
                              src={meal.image_url}
                              alt={meal.menu || meal.category}
                              className="w-full h-full object-cover"
                              style={{ width: '100%', height: '100%' }}
                            />
                          </div>
                        ) : (
                          <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                            <Clock className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm capitalize text-gray-900 dark:text-gray-100 truncate">
                            {meal.menu || meal.category}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{meal.time}</p>
                        </div>
                      </div>
                      {meal.calories && (
                        <div className="text-right flex-shrink-0 ml-3">
                          <p className="text-sm font-semibold text-orange-600 dark:text-orange-400">
                            {Math.round(meal.calories)} kcal
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Floating Add Meal Button - Always Visible */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3, delay: 0.3 }}
        className="fixed bottom-20 right-4 md:bottom-6 md:right-6 z-50"
      >
        <Link href="/food-diary?openAddDialog=true">
          <Button
            size="lg"
            className="h-14 w-14 md:h-16 md:w-16 rounded-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white shadow-2xl shadow-orange-500/50 hover:shadow-orange-600/60 transition-all"
            aria-label="Add Meal"
          >
            <Plus className="w-6 h-6 md:w-8 md:h-8" />
          </Button>
        </Link>
      </motion.div>
    </div>
  )
}
