"use client"

import { useState } from "react"
import Link from "next/link"
import { Plus, Calendar, Users, Trash2, ChefHat } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useMealPlans } from "@/hooks/use-meal-plans"
import { useAuthContext } from "@/components/auth/auth-provider"
import { motion, AnimatePresence } from "framer-motion"
import { format } from "date-fns"

// Make sure this is a default export
export default function MealPlansPage() {
  const { user } = useAuthContext()
  const { mealPlans, loading, error, deleteMealPlan, generateMealPlan } = useMealPlans()
  const [isGenerating, setIsGenerating] = useState(false)

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
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <ChefHat className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-4">Sign in to view your meal plans</h2>
          <p className="text-gray-600 mb-6">Create personalized meal plans and track your nutrition goals.</p>
          <Link href="/login">
            <Button className="bg-orange-600 hover:bg-orange-700">Sign In</Button>
          </Link>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading meal plans...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <p className="text-red-600 dark:text-red-400">Error loading meal plans: {error}</p>
          <Button onClick={() => window.location.reload()} className="mt-4">
            Try Again
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold mb-2">My Meal Plans</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Plan your meals for the week and stay on track with your nutrition goals
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={handleGenerateMealPlan}
            disabled={isGenerating}
            className="bg-orange-600 hover:bg-orange-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            {isGenerating ? "Generating..." : "Generate Meal Plan"}
          </Button>
        </div>
      </motion.div>

      {/* Meal Plans Grid */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        <AnimatePresence>
          {mealPlans.map((mealPlan, index) => (
            <motion.div
              key={mealPlan.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -5 }}
            >
              <Card className="h-full hover:shadow-lg transition-all duration-300">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{mealPlan.name}</CardTitle>
                      <CardDescription className="mt-1">
                        {format(new Date(mealPlan.start_date), "MMM d")} -{" "}
                        {format(new Date(mealPlan.end_date), "MMM d, yyyy")}
                      </CardDescription>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteMealPlan(mealPlan.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
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
                      <h4 className="font-medium text-sm">This week includes:</h4>
                      <div className="flex flex-wrap gap-1">
                        <Badge variant="outline" className="text-xs">
                          Breakfast
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          Lunch
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          Dinner
                        </Badge>
                      </div>
                    </div>

                    <div className="pt-4 border-t">
                      <Link href={`/meal-plans/${mealPlan.id}`}>
                        <Button className="w-full bg-orange-600 hover:bg-orange-700">View Meal Plan</Button>
                      </Link>
                    </div>
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
          className="text-center py-12 bg-gray-50 dark:bg-gray-800 rounded-lg"
        >
          <ChefHat className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">No meal plans yet</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
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
          className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4"
        >
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-orange-600">{mealPlans.length}</div>
              <div className="text-sm text-gray-600">Total Meal Plans</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-orange-600">{mealPlans.length * 21}</div>
              <div className="text-sm text-gray-600">Planned Meals</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-orange-600">{mealPlans.length * 7}</div>
              <div className="text-sm text-gray-600">Days Planned</div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  )
}
