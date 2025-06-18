"use client"

import { useState } from "react"
import Link from "next/link"
import { Plus, Calendar, Users, Trash2, ChefHat, Loader2, Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useMealPlans } from "@/hooks/use-meal-plans"
import { useAuthContext } from "@/components/auth/auth-provider"
import { motion, AnimatePresence } from "framer-motion"
import { format } from "date-fns"
import { useToast } from "@/hooks/use-toast"
import type { ExportFormat } from "@/lib/services/meal-plan-service"

export default function MealPlansPage() {
  const { user } = useAuthContext()
  const { mealPlans, loading, error, deleteMealPlan, generateMealPlan, exportMealPlan } = useMealPlans()
  const [isGenerating, setIsGenerating] = useState(false)
  const [isExporting, setIsExporting] = useState<string | null>(null) // Store ID of plan being exported
  const { toast } = useToast()

  const handleGenerateMealPlan = async () => {
    if (!user) return

    setIsGenerating(true)
    try {
      await generateMealPlan()
      toast({
        title: "Meal Plan Generated!",
        description: "Your new meal plan has been added.",
      })
    } catch (err: any) {
      console.error("Error generating meal plan:", err)
      toast({
        title: "Generation Failed",
        description: err.message || "Failed to generate meal plan. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsGenerating(false)
    }
  }

  const handleDeleteMealPlan = async (id: string) => {
    if (confirm("Are you sure you want to delete this meal plan?")) {
      try {
        await deleteMealPlan(id)
        toast({
          title: "Meal Plan Deleted",
          description: "The meal plan has been removed.",
        })
      } catch (err: any) {
        console.error("Error deleting meal plan:", err)
        toast({
          title: "Deletion Failed",
          description: err.message || "Failed to delete meal plan. Please try again.",
          variant: "destructive",
        })
      }
    }
  }

  const handleExportMealPlan = async (id: string, formatType: ExportFormat["format"]) => {
    setIsExporting(id)
    try {
      const result = await exportMealPlan(id, { format: formatType, includeNutrition: true })

      const filename = `meal-plan-${id}.${formatType}`
      let mimeType = ""
      let content: string | Blob = ""

      if (typeof result === "string") {
        // For JSON or simple text from PDF mock
        content = result
        if (formatType === "json") mimeType = "application/json"
        else if (formatType === "csv") mimeType = "text/csv"
        else mimeType = "text/plain" // Fallback for PDF mock
      } else if (result instanceof Blob) {
        // For actual PDF Blob if implemented
        content = result
        mimeType = result.type
      }

      const blob = new Blob([content], { type: mimeType })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = filename
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      a.remove()

      toast({
        title: "Export Successful",
        description: `Meal plan exported as ${formatType.toUpperCase()}.`,
      })
    } catch (err: any) {
      console.error("Error exporting meal plan:", err)
      toast({
        title: "Export Failed",
        description: err.message || "Could not export meal plan.",
        variant: "destructive",
      })
    } finally {
      setIsExporting(null)
    }
  }

  if (!user && !loading) {
    // Avoid showing login prompt while initial auth check might be loading
    return (
      <div className="container mx-auto px-4 py-8 font-sans">
        <div className="text-center py-12">
          <ChefHat className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-4">Sign in to view your meal plans</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Create personalized meal plans and track your nutrition goals.
          </p>
          <Link href="/login">
            <Button className="bg-orange-600 hover:bg-orange-700">Sign In</Button>
          </Link>
        </div>
      </div>
    )
  }

  if (loading && mealPlans.length === 0) {
    // Show full page loader only on initial load
    return (
      <div className="container mx-auto px-4 py-8 flex justify-center items-center min-h-[calc(100vh-200px)]">
        <Loader2 className="h-12 w-12 animate-spin text-orange-600" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8 font-sans">
        <div className="text-center py-12">
          <p className="text-red-600 dark:text-red-400 mb-4">Error loading meal plans: {error}</p>
          <Button onClick={() => window.location.reload()} className="bg-orange-600 hover:bg-orange-700">
            Try Again
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 font-sans">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold mb-2">My Meal Plans</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Plan your meals for the week and stay on track with your nutrition goals.
          </p>
        </div>
        <Button
          onClick={handleGenerateMealPlan}
          disabled={isGenerating || loading}
          className="bg-orange-600 hover:bg-orange-700 min-w-[180px]"
        >
          {isGenerating ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Plus className="h-4 w-4 mr-2" />}
          {isGenerating ? "Generating..." : "Generate Meal Plan"}
        </Button>
      </motion.div>

      <AnimatePresence>
        {mealPlans.length === 0 && !loading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="text-center py-12 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
          >
            <ChefHat className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No meal plans yet</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Click the button above to generate your first personalized meal plan!
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {mealPlans.length > 0 && (
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
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20, transition: { duration: 0.2 } }}
                transition={{ delay: index * 0.05, duration: 0.3 }}
                whileHover={{ y: -5 }}
                className="flex" // Ensure cards in a row take full height
              >
                <Card className="h-full hover:shadow-lg transition-all duration-300 border border-gray-200 dark:border-gray-700 flex flex-col w-full">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg line-clamp-2">{mealPlan.name}</CardTitle>
                        <CardDescription className="mt-1 text-xs">
                          {format(new Date(mealPlan.start_date), "MMM d, yyyy")} -{" "}
                          {format(new Date(mealPlan.end_date), "MMM d, yyyy")}
                        </CardDescription>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteMealPlan(mealPlan.id)}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 w-8 h-8"
                        aria-label="Delete meal plan"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3 flex-grow flex flex-col">
                    <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1 text-orange-600" />
                        {Math.round(
                          (new Date(mealPlan.end_date).getTime() - new Date(mealPlan.start_date).getTime()) /
                            (1000 * 60 * 60 * 24),
                        ) + 1}{" "}
                        days
                      </div>
                      <div className="flex items-center">
                        <Users className="h-4 w-4 mr-1 text-orange-600" />
                        {(mealPlan as any).meals?.length || 0} meals
                      </div>
                    </div>

                    <div className="space-y-1">
                      <h4 className="font-medium text-xs text-gray-500 dark:text-gray-400">Meal Types:</h4>
                      <div className="flex flex-wrap gap-1">
                        {/* This is a simplified view. Actual meal types would come from mealPlan.meals */}
                        <Badge variant="outline" className="text-xs border-gray-300 dark:border-gray-600">
                          Breakfast
                        </Badge>
                        <Badge variant="outline" className="text-xs border-gray-300 dark:border-gray-600">
                          Lunch
                        </Badge>
                        <Badge variant="outline" className="text-xs border-gray-300 dark:border-gray-600">
                          Dinner
                        </Badge>
                      </div>
                    </div>

                    <div className="mt-auto space-y-2 pt-3 border-t border-gray-200 dark:border-gray-700">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleExportMealPlan(mealPlan.id, "pdf")}
                        disabled={isExporting === mealPlan.id}
                        className="w-full text-xs"
                      >
                        {isExporting === mealPlan.id ? (
                          <Loader2 className="h-3 w-3 mr-1.5 animate-spin" />
                        ) : (
                          <Download className="h-3 w-3 mr-1.5" />
                        )}
                        Export PDF
                      </Button>
                      <Link href={`/meal-plans/${mealPlan.id}`} legacyBehavior>
                        <Button asChild className="w-full bg-orange-600 hover:bg-orange-700 text-sm py-2">
                          <a>View Details</a>
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  )
}
