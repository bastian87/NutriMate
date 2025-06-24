"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar, RefreshCw, TrendingUp, Home, AlertCircle } from "lucide-react"
import Link from "next/link"
import MealPlanDisplay from "@/components/meal-plan-display"
import { NutritionSummary } from "@/components/nutrition-summary"
import { motion } from "framer-motion"
import { useLanguage } from "@/lib/i18n/context"
import useAuth from "@/hooks/use-auth"
import { useMealPlans } from "@/hooks/use-meal-plans"
import { useToast } from "@/hooks/use-toast"
import { mealPlanService } from "@/lib/services/meal-plan-service"

interface MappedMealPlan {
  id: string
  name: string
  startDate: string
  endDate: string
  meals: Array<{
    id: string
    day: number
    meal_type: "breakfast" | "lunch" | "dinner" | "snack"
    recipe: {
      id: string
      name: string
      calories: number
      protein: number
      carbs: number
      fat: number
      image_url: string | undefined
      prep_time_minutes: number
      cook_time_minutes: number
    }
  }>
}

export default function DashboardPage() {
  const { t } = useLanguage()
  const { toast } = useToast()
  const { user, loading: authLoading } = useAuth()
  const { mealPlans, loading: mealPlansLoading, error: mealPlansError, generateMealPlan } = useMealPlans()

  const [currentMealPlan, setCurrentMealPlan] = useState<MappedMealPlan | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)

  useEffect(() => {
    const fetchFullMealPlan = async () => {
      if (mealPlans && mealPlans.length > 0) {
        const fullPlan = await mealPlanService.getMealPlanById(mealPlans[0].id) as any
        if (fullPlan) {
          const mappedPlan = {
            id: fullPlan.id,
            name: fullPlan.name,
            startDate: fullPlan.start_date as string,
            endDate: fullPlan.end_date as string,
            meals: (fullPlan.meals || []).map((meal: any) => ({
              id: meal.id,
              day: meal.day_number,
              meal_type: meal.meal_type,
              recipe: {
                id: meal.recipe.id,
                name: meal.recipe.name,
                calories: meal.recipe.calories,
                protein: meal.recipe.protein,
                carbs: meal.recipe.carbs,
                fat: meal.recipe.fat,
                image_url: meal.recipe.image_url,
                prep_time_minutes: meal.recipe.prep_time_minutes,
                cook_time_minutes: meal.recipe.cook_time_minutes,
              },
            })),
          }
          setCurrentMealPlan(mappedPlan)
        } else {
          setCurrentMealPlan(null)
        }
      } else {
        setCurrentMealPlan(null)
      }
    }
    fetchFullMealPlan()
  }, [mealPlans])

  const handleGenerateNewPlan = async () => {
    setIsGenerating(true)
    try {
      await generateMealPlan()
      toast({
        title: "Success!",
        description: "A new meal plan has been generated for you.",
      })
    } catch (error) {
      console.error("Error generating meal plan:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not generate a new meal plan. Please try again.",
      })
    } finally {
      setIsGenerating(false)
    }
  }

  if (authLoading || mealPlansLoading) {
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

  const todaysMeals = currentMealPlan?.meals?.filter((meal) => meal.day === 1) || []
  const todaysNutrition = todaysMeals.reduce(
    (acc, meal) => ({
      calories: acc.calories + (meal.recipe?.calories || 0),
      protein: acc.protein + (meal.recipe?.protein || 0),
      carbs: acc.carbs + (meal.recipe?.carbs || 0),
      fat: acc.fat + (meal.recipe?.fat || 0),
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 },
  )

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold mb-2">{t("dashboard.welcome")}</h1>
          <p className="text-gray-600 dark:text-gray-400">{t("dashboard.subtitle")}</p>
        </div>
      </motion.div>

      {mealPlansError && (
        <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded-md flex items-center gap-2">
          <AlertCircle className="h-5 w-5" />
          <p>{t("dashboard.error")}: {mealPlansError}</p>
        </div>
      )}

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
            <div className="text-sm text-gray-600 dark:text-gray-400">{t("recipes.protein")}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{todaysNutrition.carbs}g</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">{t("recipes.carbs")}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">{todaysNutrition.fat}g</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">{t("recipes.fat")}</div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <NutritionSummary
          data={todaysNutrition}
          title={t("dashboard.todaysNutrition")}
          period="Based on your current meal plan"
        />
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="font-bold">{t("dashboard.currentMealPlan")}</CardTitle>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={handleGenerateNewPlan}
                  disabled={isGenerating || !!currentMealPlan}
                  className="flex items-center gap-2"
                >
                  <RefreshCw className={`h-4 w-4 ${isGenerating ? "animate-spin" : ""}`} />
                  {isGenerating ? t("common.loading") : t("dashboard.generateNew")}
                </Button>
                <Link href="/meal-plans">
                  <Button variant="outline">
                    <Calendar className="h-4 w-4 mr-2" />
                    {t("dashboard.viewAllPlans")}
                  </Button>
                </Link>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {currentMealPlan ? (
              <MealPlanDisplay mealPlan={currentMealPlan} />
            ) : (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium mb-2">No meal plan yet</p>
                <p className="text-sm mb-4">Generate your first meal plan to get started!</p>
                <Button
                  onClick={handleGenerateNewPlan}
                  disabled={isGenerating}
                  className="bg-orange-600 hover:bg-orange-700"
                >
                  <RefreshCw className={`h-4 w-4 mr-2 ${isGenerating ? "animate-spin" : ""}`} />
                  {isGenerating ? "Generating..." : "Generate Meal Plan"}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
