"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar, Clock, RefreshCw, Info } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useLanguage } from "@/lib/i18n/context"
import { mealPlanService } from "@/lib/services/meal-plan-service"
import useAuth from "@/hooks/use-auth"

// Define types locally since we removed mock data
interface Recipe {
  id: string
  name: string
  calories: number
  protein: number
  carbs: number
  fat: number
  image_url?: string
  prep_time_minutes: number
  cook_time_minutes: number
}

interface Meal {
  id: string
  day: number
  meal_type: "breakfast" | "lunch" | "dinner" | "snack"
  recipe: Recipe
}

interface MealPlan {
  id: string
  name: string
  startDate: string
  endDate: string
  meals: Meal[]
}

interface MealPlanDisplayProps {
  mealPlan: MealPlan
}

export default function MealPlanDisplay({ mealPlan }: MealPlanDisplayProps) {
  const [activeDay, setActiveDay] = useState(1)
  const [regeneratingMealId, setRegeneratingMealId] = useState<string | null>(null)
  const { t } = useLanguage()
  const { user } = useAuth()

  // Format dates
  const startDate = new Date(mealPlan.startDate)
  const endDate = new Date(mealPlan.endDate)
  const dateRange = `${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`

  // Group meals by day
  const mealsByDay = (mealPlan.meals || []).reduce(
    (acc, meal) => {
      if (!acc[meal.day]) {
        acc[meal.day] = []
      }
      acc[meal.day].push(meal)
      return acc
    },
    {} as Record<number, Meal[]>,
  )

  // Get day names
  const dayNames = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]

  // Handle meal regeneration (placeholder for now)
  const handleRegenerateMeal = async (mealId: string, mealType: "breakfast" | "lunch" | "dinner" | "snack", caloriasObjetivo: number) => {
    setRegeneratingMealId(mealId)
    try {
      if (!user) throw new Error("Usuario no autenticado")
      await mealPlanService.regenerateMeal(user.id, mealType, caloriasObjetivo)
      window.location.reload()
    } catch (error) {
      console.error("Error regenerando la comida:", error)
      alert("Ocurrió un error al regenerar la comida. Intenta de nuevo.")
    } finally {
      setRegeneratingMealId(null)
    }
  }

  // Calculate daily calories
  const dailyCalories = mealsByDay[activeDay]?.reduce((sum, meal) => sum + meal.recipe.calories, 0) || 0
  const calorieTarget = 2000 // Default target, can be made dynamic later

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
            const mealOrder = { breakfast: 1, lunch: 2, dinner: 3, snack: 4 }
            return mealOrder[a.meal_type] - mealOrder[b.meal_type]
          })
          .map((meal) => (
            <Card key={meal.id} className="overflow-hidden border border-gray-200">
              <div className="relative h-48 w-full">
                <Image
                  src={meal.recipe.image_url || "/placeholder.svg?height=200&width=300&text=Recipe"}
                  alt={meal.recipe.name}
                  fill
                  className="object-cover"
                />
                <div className="absolute top-2 left-2 bg-white dark:bg-gray-900 rounded-full px-3 py-1 text-sm font-medium">
                  {meal.meal_type.charAt(0).toUpperCase() + meal.meal_type.slice(1)}
                </div>
              </div>
              <CardHeader>
                <CardTitle className="text-lg font-serif">{meal.recipe.name}</CardTitle>
                <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                  <Clock className="h-4 w-4 mr-1" /> {meal.recipe.prep_time_minutes + meal.recipe.cook_time_minutes} min
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
                      View Recipe
                    </Button>
                  </Link>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleRegenerateMeal(meal.id, meal.meal_type, meal.recipe.calories)}
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
            <span>Daily Nutrition Summary</span>
            <div className="text-sm font-normal flex items-center">
              <Info className="h-4 w-4 mr-1 text-gray-500" />
              <span className="text-gray-500">Target: {calorieTarget} calories</span>
            </div>
          </CardTitle>
          <p className="text-sm text-gray-600 dark:text-gray-400">Based on your selected meals</p>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <div className="flex justify-between mb-1">
              <span className="text-sm font-medium">Calorie Progress</span>
              <span className="text-sm font-medium">
                {dailyCalories.toFixed(2)} / {calorieTarget}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
              <div
                className="bg-orange-600 h-2.5 rounded-full"
                style={{ width: `${Math.min(Math.round((dailyCalories / calorieTarget) * 100), 100)}%` }}
              ></div>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
              <p className="text-sm text-gray-500 dark:text-gray-400">Total Calories</p>
              <p className="text-2xl font-bold">{dailyCalories.toFixed(2)}</p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
              <p className="text-sm text-gray-500 dark:text-gray-400">Protein</p>
              <p className="text-2xl font-bold">
                {(mealsByDay[activeDay]?.reduce((sum, meal) => sum + meal.recipe.protein, 0) || 0).toFixed(2)}g
              </p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
              <p className="text-sm text-gray-500 dark:text-gray-400">Carbs</p>
              <p className="text-2xl font-bold">
                {(mealsByDay[activeDay]?.reduce((sum, meal) => sum + meal.recipe.carbs, 0) || 0).toFixed(2)}g
              </p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
              <p className="text-sm text-gray-500 dark:text-gray-400">Fat</p>
              <p className="text-2xl font-bold">
                {(mealsByDay[activeDay]?.reduce((sum, meal) => sum + meal.recipe.fat, 0) || 0).toFixed(2)}g
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
