"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar, Clock, RefreshCw, Info } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import type { MealPlan } from "@/lib/mock-data"
import { regenerateMeal } from "@/lib/mock-services"
import { getUserPreferences } from "@/lib/mock-services"
import { useEffect } from "react"
import { useLanguage } from "@/lib/i18n/context"

interface MealPlanDisplayProps {
  mealPlan: MealPlan
}

export default function MealPlanDisplay({ mealPlan }: MealPlanDisplayProps) {
  const [activeDay, setActiveDay] = useState(1)
  const [currentMealPlan, setCurrentMealPlan] = useState(mealPlan)
  const [regeneratingMealId, setRegeneratingMealId] = useState<string | null>(null)
  const [userPreferences, setUserPreferences] = useState<any>(null)
  const { t } = useLanguage()

  // Format dates
  const startDate = new Date(mealPlan.startDate)
  const endDate = new Date(mealPlan.endDate)
  const dateRange = `${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`

  // Fetch user preferences
  useEffect(() => {
    const fetchUserPreferences = async () => {
      try {
        const preferences = await getUserPreferences()
        setUserPreferences(preferences)
      } catch (error) {
        console.error("Error fetching user preferences:", error)
      }
    }

    fetchUserPreferences()
  }, [])

  // Group meals by day
  const mealsByDay = currentMealPlan.meals.reduce(
    (acc, meal) => {
      if (!acc[meal.day]) {
        acc[meal.day] = []
      }
      acc[meal.day].push(meal)
      return acc
    },
    {} as Record<number, typeof currentMealPlan.meals>,
  )

  // Get day names
  const dayNames = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]

  // Handle meal regeneration
  const handleRegenerateMeal = async (mealId: string) => {
    setRegeneratingMealId(mealId)
    try {
      const updatedMealPlan = await regenerateMeal(mealId)
      setCurrentMealPlan(updatedMealPlan)
    } catch (error) {
      console.error("Error regenerating meal:", error)
    } finally {
      setRegeneratingMealId(null)
    }
  }

  // Calculate daily calorie progress
  const dailyCalories = mealsByDay[activeDay]?.reduce((sum, meal) => sum + meal.recipe.calories, 0) || 0
  const calorieTarget = userPreferences?.calorieTarget || 2000
  const caloriePercentage = Math.min(Math.round((dailyCalories / calorieTarget) * 100), 100)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-4">
        <Button variant="outline" className="flex items-center">
          <Calendar className="mr-2 h-4 w-4" />
          {dateRange}
        </Button>
      </div>

      {/* Day Selection */}
      <div className="flex overflow-x-auto pb-2 space-x-2">
        {Array.from({ length: 7 }, (_, i) => i + 1).map((day) => (
          <Button
            key={day}
            variant={day === activeDay ? "default" : "outline"}
            className={`rounded-full px-6 ${day === activeDay ? "bg-orange-600 hover:bg-orange-700" : ""}`}
            onClick={() => setActiveDay(day)}
          >
            {dayNames[day - 1]}
          </Button>
        ))}
      </div>

      {/* Meals for the day */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {mealsByDay[activeDay]
          ?.sort((a, b) => {
            const mealOrder = { breakfast: 1, lunch: 2, dinner: 3 }
            return mealOrder[a.mealType as keyof typeof mealOrder] - mealOrder[b.mealType as keyof typeof mealOrder]
          })
          .map((meal) => (
            <Card key={meal.id} className="overflow-hidden border border-gray-200">
              <div className="relative h-48 w-full">
                <Image
                  src={meal.recipe.imageUrl || "/placeholder.svg?height=200&width=300"}
                  alt={meal.recipe.name}
                  fill
                  className="object-cover"
                />
                <div className="absolute top-2 left-2 bg-white dark:bg-gray-900 rounded-full px-3 py-1 text-sm font-medium">
                  {meal.mealType.charAt(0).toUpperCase() + meal.mealType.slice(1)}
                </div>
              </div>
              <CardHeader>
                <CardTitle className="text-lg font-serif">{meal.recipe.name}</CardTitle>
                <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                  <Clock className="h-4 w-4 mr-1" /> {meal.recipe.prepTimeMinutes + meal.recipe.cookTimeMinutes} min
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-4 gap-2 mb-4">
                  <div className="text-center">
                    <p className="text-xs text-gray-500 dark:text-gray-400">Calories</p>
                    <p className="font-semibold">{meal.recipe.calories}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-gray-500 dark:text-gray-400">Protein</p>
                    <p className="font-semibold">{meal.recipe.protein}g</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-gray-500 dark:text-gray-400">Carbs</p>
                    <p className="font-semibold">{meal.recipe.carbs}g</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-gray-500 dark:text-gray-400">Fat</p>
                    <p className="font-semibold">{meal.recipe.fat}g</p>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Link
                    href={`/recipes/${encodeURIComponent(meal.recipe.name.toLowerCase().replace(/\s+/g, "-"))}`}
                    className="flex-1"
                  >
                    <Button variant="default" className="w-full bg-orange-600 hover:bg-orange-700">
                      {t("common.viewRecipe")}
                    </Button>
                  </Link>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleRegenerateMeal(meal.id)}
                    disabled={regeneratingMealId === meal.id}
                    className="border-orange-600 text-orange-600 hover:bg-orange-50"
                  >
                    <RefreshCw className={`h-4 w-4 ${regeneratingMealId === meal.id ? "animate-spin" : ""}`} />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
      </div>

      {/* Daily Nutrition Summary */}
      <Card className="border border-gray-200">
        <CardHeader>
          <CardTitle className="flex items-center justify-between font-serif">
            <span>{t("dashboard.nutritionSummary.title")}</span>
            {userPreferences && (
              <div className="text-sm font-normal flex items-center">
                <Info className="h-4 w-4 mr-1 text-gray-500" />
                <span className="text-gray-500">Target: {calorieTarget} calories</span>
              </div>
            )}
          </CardTitle>
          <p className="text-sm text-gray-600 dark:text-gray-400">Based on your selected meals</p>
        </CardHeader>
        <CardContent>
          {userPreferences && (
            <div className="mb-4">
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium">Calorie Progress</span>
                <span className="text-sm font-medium">
                  {dailyCalories} / {calorieTarget}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                <div className="bg-orange-600 h-2.5 rounded-full" style={{ width: `${caloriePercentage}%` }}></div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
              <p className="text-sm text-gray-500 dark:text-gray-400">Total Calories</p>
              <p className="text-2xl font-bold">
                {mealsByDay[activeDay]?.reduce((sum, meal) => sum + meal.recipe.calories, 0) || 0}
              </p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
              <p className="text-sm text-gray-500 dark:text-gray-400">Protein</p>
              <p className="text-2xl font-bold">
                {mealsByDay[activeDay]?.reduce((sum, meal) => sum + meal.recipe.protein, 0) || 0}g
              </p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
              <p className="text-sm text-gray-500 dark:text-gray-400">Carbs</p>
              <p className="text-2xl font-bold">
                {mealsByDay[activeDay]?.reduce((sum, meal) => sum + meal.recipe.carbs, 0) || 0}g
              </p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
              <p className="text-sm text-gray-500 dark:text-gray-400">Fat</p>
              <p className="text-2xl font-bold">
                {mealsByDay[activeDay]?.reduce((sum, meal) => sum + meal.recipe.fat, 0) || 0}g
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
