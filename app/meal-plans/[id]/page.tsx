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
import { useLanguage } from "@/lib/i18n/context"

const MEAL_TYPES = ["breakfast", "lunch", "dinner", "snack"] as const
const DAYS_ES = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"]

export default function MealPlanDetailPage({ params }: { params: { id: string } }) {
  const { mealPlan, loading, error, regenerateMeal } = useMealPlan(params.id)
  const { addAllMealPlanIngredients } = useGroceryList()
  const [isAddingToGrocery, setIsAddingToGrocery] = useState(false)
  const { t } = useLanguage()

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
          <p className="mt-4 text-gray-600">{t("mealPlans.loadingMealPlan")}</p>
        </div>
      </div>
    )
  }

  if (error || !mealPlan) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{t("mealPlans.errorLoadingMealPlan")} {error}</p>
          <Link href="/meal-plans">
            <Button>{t("mealPlans.backToMealPlans")}</Button>
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
          Volver a mis planes
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4"
        >
          <div>
            <h1 className="text-3xl font-bold mb-2">{mealPlan.name}</h1>
            {mealPlan.name.toLowerCase().includes("personalizado") && (
              <span className="inline-block bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-xs font-semibold mb-2">Plan personalizado</span>
            )}
            <p className="text-gray-600">
              {format(new Date(mealPlan.start_date), "d 'de' MMMM")} - {format(new Date(mealPlan.end_date), "d 'de' MMMM, yyyy")}
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={addAllToGroceryList}
              disabled={isAddingToGrocery}
              className="bg-orange-600 hover:bg-orange-700"
            >
              <ShoppingCart className="h-4 w-4 mr-2" />
              {isAddingToGrocery ? "Agregando..." : "Agregar todo a la lista de compras"}
            </Button>
          </div>
        </motion.div>

        {/* Meal Plan Grid */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="space-y-8">
          {DAYS_ES.map((day, dayIndex) => (
            <Card key={day} className="overflow-hidden">
              <CardHeader className="bg-gray-50 dark:bg-gray-800">
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  {day}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  {MEAL_TYPES.map((mealType) => {
                    const meal = getMealForDayAndType(dayIndex + 1, mealType)

                    return (
                      <div key={mealType} className="space-y-3">
                        <h4 className="font-semibold text-lg capitalize">
                          {mealType === "breakfast" && "Desayuno"}
                          {mealType === "lunch" && "Comida"}
                          {mealType === "dinner" && "Cena"}
                          {mealType === "snack" && "Snack"}
                        </h4>
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
                                  {(meal.recipe.prep_time_minutes ?? 0) + (meal.recipe.cook_time_minutes ?? 0)}m
                                </span>
                                <span>{meal.recipe.calories} cal</span>
                              </div>
                              <div className="flex gap-1">
                                <Link href={`/recipes/${meal.recipe.id}`}>
                                  <Button size="sm" variant="outline" className="text-xs">
                                    Ver receta
                                  </Button>
                                </Link>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => regenerateMeal(meal.id)}
                                  className="text-xs"
                                >
                                  <RefreshCw className="h-3 w-3" />
                                  Cambiar
                                </Button>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-lg p-6 text-center">
                            <p className="text-gray-500 text-sm">No hay receta seleccionada</p>
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
              <CardTitle>Resumen nutricional semanal</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">
                    {mealPlan.meals.reduce((sum, meal) => sum + (meal.recipe.calories ?? 0), 0)}
                  </div>
                  <div className="text-sm text-gray-600">Calorías totales</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">
                    {mealPlan.meals.reduce((sum, meal) => sum + (meal.recipe.protein ?? 0), 0)}g
                  </div>
                  <div className="text-sm text-gray-600">Proteína</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">
                    {mealPlan.meals.reduce((sum, meal) => sum + (meal.recipe.carbs ?? 0), 0)}g
                  </div>
                  <div className="text-sm text-gray-600">Carbohidratos</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">
                    {mealPlan.meals.reduce((sum, meal) => sum + (meal.recipe.fat ?? 0), 0)}g
                  </div>
                  <div className="text-sm text-gray-600">Grasa</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
