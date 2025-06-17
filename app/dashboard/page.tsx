"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, RefreshCw, Heart, History, TrendingUp } from "lucide-react"
import Link from "next/link"
import { mockMealPlan } from "@/lib/mock-data"
import { generateMealPlan } from "@/lib/mock-services"
import MealPlanDisplay from "@/components/meal-plan-display"
import { NutritionSummary } from "@/components/nutrition-summary"
import { useFavorites } from "@/hooks/use-favorites"
import { useMealPlanHistory } from "@/hooks/use-meal-plan-history"
import { motion } from "framer-motion"
import { useLanguage } from "@/lib/i18n/context"

export default function DashboardPage() {
  const [currentMealPlan, setCurrentMealPlan] = useState(mockMealPlan)
  const [isGenerating, setIsGenerating] = useState(false)
  const { favorites } = useFavorites()
  const { history, saveMealPlan } = useMealPlanHistory()
  const { t } = useLanguage()

  // Calculate today's nutrition from current meal plan
  const todaysMeals = currentMealPlan.meals.filter((meal) => meal.day === 1)
  const todaysNutrition = todaysMeals.reduce(
    (acc, meal) => ({
      calories: acc.calories + meal.recipe.calories,
      protein: acc.protein + meal.recipe.protein,
      carbs: acc.carbs + meal.recipe.carbs,
      fat: acc.fat + meal.recipe.fat,
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 },
  )

  const handleGenerateNewPlan = async () => {
    setIsGenerating(true)
    try {
      const newMealPlan = await generateMealPlan()
      setCurrentMealPlan(newMealPlan)
      saveMealPlan(newMealPlan)
    } catch (error) {
      console.error("Error generating meal plan:", error)
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold mb-2">{t("dashboard.welcome")}</h1>
          <p className="text-gray-600 dark:text-gray-400">{t("dashboard.subtitle")}</p>
        </div>
        <div className="flex items-center gap-4">
          <Badge variant="secondary" className="bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200">
            <Heart className="h-3 w-3 mr-1" />
            {favorites.length} {t("recipes.favorites")}
          </Badge>
          <Badge variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
            <History className="h-3 w-3 mr-1" />
            {history.length} {t("dashboard.savedPlans")}
          </Badge>
        </div>
      </motion.div>

      {/* Quick Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-4 gap-4"
      >
        <Card>
          <CardContent className="p-4 text-center">
            <TrendingUp className="h-8 w-8 text-orange-600 mx-auto mb-2" />
            <div className="text-2xl font-bold">{todaysNutrition.calories}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">{t("dashboard.caloriesToday")}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{todaysNutrition.protein}g</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">{t("common.protein")}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{todaysNutrition.carbs}g</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">{t("common.carbs")}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">{todaysNutrition.fat}g</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">{t("common.fat")}</div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Nutrition Summary */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <NutritionSummary
          data={todaysNutrition}
          title={t("dashboard.todaysNutrition")}
          period="Based on your current meal plan"
        />
      </motion.div>

      {/* Current Meal Plan */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="font-bold">{t("dashboard.currentMealPlan")}</CardTitle>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={handleGenerateNewPlan}
                  disabled={isGenerating}
                  className="flex items-center gap-2"
                >
                  <RefreshCw className={`h-4 w-4 ${isGenerating ? "animate-spin" : ""}`} />
                  {isGenerating ? t("common.loading") : t("dashboard.generateNew")}
                </Button>
                <Link href="/meal-plans">
                  <Button variant="outline">
                    <Calendar className="h-4 w-4 mr-2" />
                    {t("dashboard.viewFullPlan")}
                  </Button>
                </Link>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <MealPlanDisplay mealPlan={currentMealPlan} />
          </CardContent>
        </Card>
      </motion.div>

      {/* Recent Activity */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="grid grid-cols-1 md:grid-cols-2 gap-6"
      >
        {/* Meal Plan History */}
        <Card>
          <CardHeader>
            <CardTitle className="font-bold flex items-center gap-2">
              <History className="h-5 w-5" />
              {t("dashboard.recentMealPlans")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {history.length > 0 ? (
              <div className="space-y-3">
                {history.slice(0, 3).map((item) => (
                  <div
                    key={item.id}
                    className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                  >
                    <div>
                      <div className="font-medium">{item.name}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {new Date(item.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                    <Button variant="ghost" size="sm">
                      View
                    </Button>
                  </div>
                ))}
                {history.length > 3 && (
                  <div className="text-center pt-2">
                    <Link href="/meal-plans/history">
                      <Button variant="ghost" size="sm">
                        View All ({history.length})
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-6 text-gray-500 dark:text-gray-400">
                <History className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>No meal plans saved yet</p>
                <p className="text-sm">Generate your first meal plan to get started!</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Favorite Recipes */}
        <Card>
          <CardHeader>
            <CardTitle className="font-bold flex items-center gap-2">
              <Heart className="h-5 w-5" />
              {t("dashboard.favoriteRecipes")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {favorites.length > 0 ? (
              <div className="space-y-3">
                {favorites.slice(0, 3).map((recipeId) => (
                  <div
                    key={recipeId}
                    className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                  >
                    <div>
                      <div className="font-medium">Recipe #{recipeId}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Saved to favorites</div>
                    </div>
                    <Link href={`/recipes`}>
                      <Button variant="ghost" size="sm">
                        View
                      </Button>
                    </Link>
                  </div>
                ))}
                {favorites.length > 3 && (
                  <div className="text-center pt-2">
                    <Link href="/recipes?filter=favorites">
                      <Button variant="ghost" size="sm">
                        View All ({favorites.length})
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-6 text-gray-500 dark:text-gray-400">
                <Heart className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>No favorite recipes yet</p>
                <p className="text-sm">Heart recipes you love to save them here!</p>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
