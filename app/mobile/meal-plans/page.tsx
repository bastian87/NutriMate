"use client"

import { useState } from "react"
import Link from "next/link"
import { Plus, Calendar, Users, Trash2, ChefHat, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useMealPlans } from "@/hooks/use-meal-plans"
import { useAuthContext } from "@/components/auth/auth-provider"
import { motion, AnimatePresence } from "framer-motion"
import { format } from "date-fns"
import { useLanguage } from "@/lib/i18n/context"

export default function MobileMealPlansPage() {
  const { user } = useAuthContext()
  const { mealPlans, loading, error, deleteMealPlan, generateMealPlan } = useMealPlans()
  const [isGenerating, setIsGenerating] = useState(false)
  const { t } = useLanguage()

  const handleGenerateMealPlan = async () => {
    if (!user) return

    setIsGenerating(true)
    try {
      await generateMealPlan()
    } catch (error) {
      console.error("Error generating meal plan:", error)
      alert("Failed to generate meal plan. Please try again.")
    } finally {
      setIsGenerating(false)
    }
  }

  const handleDeleteMealPlan = async (id: string) => {
    if (confirm("Are you sure you want to delete this meal plan?")) {
      try {
        await deleteMealPlan(id)
      } catch (error) {
        console.error("Error deleting meal plan:", error)
        alert("Failed to delete meal plan. Please try again.")
      }
    }
  }

  if (!user) {
    return (
      <div className="bg-background min-h-screen pb-20">
        {/* Mobile Header */}
        <div className="bg-white shadow-sm px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/mobile" className="flex items-center text-gray-600">
              <ArrowLeft className="h-5 w-5 mr-2" />
              {t("mobileMealPlans.back")}
            </Link>
            <h1 className="text-lg font-bold">{t("mobileMealPlans.mealPlans")}</h1>
            <div className="w-8"></div>
          </div>
        </div>

        <div className="text-center py-12 px-4">
          <ChefHat className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-4">{t("mobileMealPlans.signInToView")}</h2>
          <p className="text-gray-600 mb-6">{t("mobileMealPlans.createPersonalized")}</p>
          <Link href="/login">
            <Button className="bg-orange-600 hover:bg-orange-700">{t("mobileMealPlans.signIn")}</Button>
          </Link>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="bg-background min-h-screen pb-20">
        {/* Mobile Header */}
        <div className="bg-white shadow-sm px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/mobile" className="flex items-center text-gray-600">
              <ArrowLeft className="h-5 w-5 mr-2" />
              {t("mobileMealPlans.back")}
            </Link>
            <h1 className="text-lg font-bold">{t("mobileMealPlans.mealPlans")}</h1>
            <div className="w-8"></div>
          </div>
        </div>

        <div className="text-center py-12 px-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">{t("mobileMealPlans.loading")}</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-background min-h-screen pb-20">
        {/* Mobile Header */}
        <div className="bg-white shadow-sm px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/mobile" className="flex items-center text-gray-600">
              <ArrowLeft className="h-5 w-5 mr-2" />
              {t("mobileMealPlans.back")}
            </Link>
            <h1 className="text-lg font-bold">{t("mobileMealPlans.mealPlans")}</h1>
            <div className="w-8"></div>
          </div>
        </div>

        <div className="text-center py-12 px-4">
          <p className="text-red-600 mb-4">{t("mobileMealPlans.errorLoading")} {error}</p>
          <Button onClick={() => window.location.reload()}>{t("mobileMealPlans.tryAgain")}</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-background min-h-screen pb-20">
      {/* Mobile Header */}
      <div className="bg-white shadow-sm px-4 py-4">
        <div className="flex items-center justify-between">
          <Link href="/mobile" className="flex items-center text-gray-600">
            <ArrowLeft className="h-5 w-5 mr-2" />
            {t("mobileMealPlans.back")}
          </Link>
          <h1 className="text-lg font-bold">{t("mobileMealPlans.mealPlans")}</h1>
          <div className="w-8"></div>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 py-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <p className="text-gray-600 mb-4">{t("mobileMealPlans.planYourMeals")}</p>
          <Button
            onClick={handleGenerateMealPlan}
            disabled={isGenerating}
            className="w-full bg-orange-600 hover:bg-orange-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            {isGenerating ? t("mobileMealPlans.generating") : t("mobileMealPlans.generate")}
          </Button>
        </motion.div>

        {/* Meal Plans Grid */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="space-y-4">
          <AnimatePresence>
            {mealPlans.map((mealPlan, index) => (
              <motion.div
                key={mealPlan.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="hover:shadow-lg transition-all duration-300">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <CardTitle className="text-lg">{mealPlan.name}</CardTitle>
                        <CardDescription className="mt-1">
                          {format(new Date(mealPlan.start_date), "MMM d")} -{" "}
                          {format(new Date(mealPlan.end_date), "MMM d, yyyy")}
                        </CardDescription>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteMealPlan(mealPlan.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between text-sm text-gray-600">
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1" />7 days
                        </div>
                        <div className="flex items-center">
                          <Users className="h-4 w-4 mr-1" />
                          21 meals
                        </div>
                      </div>

                      <div className="space-y-2">
                        <h4 className="font-medium text-sm">{t("mobileMealPlans.thisWeekIncludes")}</h4>
                        <div className="flex flex-wrap gap-1">
                          <Badge variant="outline" className="text-xs">
                            {t("mobileMealPlans.breakfast")}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {t("mobileMealPlans.lunch")}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {t("mobileMealPlans.dinner")}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {t("mobileMealPlans.snack")}
                          </Badge>
                        </div>
                      </div>

                      <Link href={`/meal-plans/${mealPlan.id}`}>
                        <Button className="w-full bg-orange-600 hover:bg-orange-700">View Meal Plan</Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        {/* Empty State */}
        {mealPlans.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-12 bg-white rounded-lg"
          >
            <ChefHat className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No meal plans yet</h3>
            <p className="text-gray-600 mb-6 px-4">
              Create your first meal plan to start planning your weekly meals and nutrition.
            </p>
            <Button
              onClick={handleGenerateMealPlan}
              disabled={isGenerating}
              className="bg-orange-600 hover:bg-orange-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              {isGenerating ? "Generating..." : "Create Your First Meal Plan"}
            </Button>
          </motion.div>
        )}

        {/* Quick Stats */}
        {mealPlans.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-8 grid grid-cols-3 gap-4"
          >
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-orange-600">{mealPlans.length}</div>
                <div className="text-xs text-gray-600">Total Plans</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-orange-600">{mealPlans.length * 21}</div>
                <div className="text-xs text-gray-600">Planned Meals</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-orange-600">{mealPlans.length * 7}</div>
                <div className="text-xs text-gray-600">Days Planned</div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  )
}
