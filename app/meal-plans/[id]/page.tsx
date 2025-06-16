"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { ArrowLeft, Clock, RefreshCw, ShoppingCart, Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useMealPlan } from "@/hooks/use-meal-plans"
import { useGroceryList } from "@/hooks/use-grocery-list"
import { motion } from "framer-motion"
import { format } from "date-fns"

const MEAL_TYPES = ["breakfast", "lunch", "dinner"] as const
const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]

export default function MealPlanDetailPage({ params }: { params: { id: string } }) {
  const { mealPlan, loading, error, regenerateMeal } = useMealPlan(params.id)
  const { addAllMealPlanIngredients } = useGroceryList()
  const [isAddingToGrocery, setIsAddingToGrocery] = useState(false)

  const addAllToGroceryList = async () => {
    if (!mealPlan) return

    setIsAddingToGrocery(true)
    try {
      await addAllMealPlanIngredients(mealPlan.id)
      alert("All ingredients added to grocery list!")
    } catch (error) {
      console.error("Error adding to grocery list:", error)
      alert("Failed to add ingredients to grocery list")
    } finally {
      setIsAddingToGrocery(false)
    }
  }

  const getMealsForDay = (dayNumber: number) => {
    if (!mealPlan) return []
    return mealPlan.meals.filter((meal) => meal.day_number === dayNumber)
  }

  const getMealForDayAndType = (dayNumber: number, mealType: string) => {
    return getMealsForDay(dayNumber).find((meal) => meal.meal_type === mealType)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading meal plan...</p>
        </div>
      </div>
    )
  }

  if (error || !mealPlan) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">Error loading meal plan: {error}</p>
          <Link href="/meal-plans">
            <Button>Back to Meal Plans</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="container mx-auto px-4 py-6">
        <Link href="/meal-plans" className="inline-flex items-center text-gray-600 hover:text-orange-600 mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Meal Plans
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4"
        >
          <div>
            <h1 className="text-3xl font-serif font-bold mb-2">{mealPlan.name}</h1>
            <p className="text-gray-600">
              {format(new Date(mealPlan.start_date), "MMMM d")} - {format(new Date(mealPlan.end_date), "MMMM d, yyyy")}
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={addAllToGroceryList}
              disabled={isAddingToGrocery}
              className="bg-orange-600 hover:bg-orange-700"
            >
              <ShoppingCart className="h-4 w-4 mr-2" />
              {isAddingToGrocery ? "Adding..." : "Add All to Grocery List"}
            </Button>
          </div>
        </motion.div>

        {/* Meal Plan Grid */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="space-y-8">
          {DAYS.map((day, dayIndex) => (
            <Card key={day} className="overflow-hidden">
              <CardHeader className="bg-gray-50 dark:bg-gray-800">
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  {day}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {MEAL_TYPES.map((mealType) => {
                    const meal = getMealForDayAndType(dayIndex + 1, mealType)

                    return (
                      <div key={mealType} className="space-y-3">
                        <h4 className="font-semibold text-lg capitalize">{mealType}</h4>
                        {meal ? (
                          <div className="bg-white border rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                            <div className="relative h-32">
                              <Image
                                src={meal.recipe.image_url || "/placeholder.svg?height=128&width=200"}
                                alt={meal.recipe.name}
                                fill
                                className="object-cover"
                              />
                            </div>
                            <div className="p-3">
                              <h5 className="font-medium text-sm mb-2 line-clamp-2">{meal.recipe.name}</h5>
                              <div className="flex justify-between items-center text-xs text-gray-600 mb-2">
                                <span className="flex items-center">
                                  <Clock className="h-3 w-3 mr-1" />
                                  {meal.recipe.prep_time_minutes + meal.recipe.cook_time_minutes}m
                                </span>
                                <span>{meal.recipe.calories} cal</span>
                              </div>
                              <div className="flex gap-1">
                                <Link href={`/recipes/${meal.recipe.id}`}>
                                  <Button size="sm" variant="outline" className="text-xs">
                                    View Recipe
                                  </Button>
                                </Link>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => regenerateMeal(meal.id)}
                                  className="text-xs"
                                >
                                  <RefreshCw className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-lg p-6 text-center">
                            <p className="text-gray-500 text-sm">No meal planned</p>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          ))}
        </motion.div>

        {/* Nutrition Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-8"
        >
          <Card>
            <CardHeader>
              <CardTitle>Weekly Nutrition Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">
                    {mealPlan.meals.reduce((sum, meal) => sum + meal.recipe.calories, 0)}
                  </div>
                  <div className="text-sm text-gray-600">Total Calories</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">
                    {mealPlan.meals.reduce((sum, meal) => sum + meal.recipe.protein, 0)}g
                  </div>
                  <div className="text-sm text-gray-600">Protein</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">
                    {mealPlan.meals.reduce((sum, meal) => sum + meal.recipe.carbs, 0)}g
                  </div>
                  <div className="text-sm text-gray-600">Carbs</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">
                    {mealPlan.meals.reduce((sum, meal) => sum + meal.recipe.fat, 0)}g
                  </div>
                  <div className="text-sm text-gray-600">Fat</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
