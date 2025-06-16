"use client"

import { useState, useEffect } from "react"
import { mealPlanService } from "@/lib/services/meal-plan-service"
import { createClient } from "@/lib/supabase/client"

interface MealPlan {
  id: string
  name: string
  start_date: string
  end_date: string
  user_id: string
  created_at: string
}

interface MealPlanWithMeals extends MealPlan {
  meals: Array<{
    id: string
    meal_type: string
    day_number: number
    recipe: {
      id: string
      name: string
      image_url: string
      prep_time_minutes: number
      cook_time_minutes: number
      calories: number
      protein: number
      carbs: number
      fat: number
    }
  }>
}

interface UseMealPlansReturn {
  mealPlans: MealPlan[]
  loading: boolean
  error: string | null
  generateMealPlan: () => Promise<void>
  deleteMealPlan: (id: string) => Promise<void>
  refreshMealPlans: () => Promise<void>
}

interface UseMealPlanReturn {
  mealPlan: MealPlanWithMeals | null
  loading: boolean
  error: string | null
  regenerateMeal: (mealId: string) => Promise<void>
}

// Hook for multiple meal plans
export const useMealPlans = (): UseMealPlansReturn => {
  const [mealPlans, setMealPlans] = useState<MealPlan[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  const loadMealPlans = async () => {
    try {
      setLoading(true)
      setError(null)

      // Get current user
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser()

      if (authError) {
        throw new Error(`Authentication error: ${authError.message}`)
      }

      if (!user) {
        console.log("No authenticated user found")
        setMealPlans([])
        return
      }

      console.log("Loading meal plans for user:", user.id)
      const plans = await mealPlanService.getUserMealPlans(user.id)
      setMealPlans(plans)
    } catch (err) {
      console.error("Error loading meal plans:", err)
      setError(err instanceof Error ? err.message : "Failed to load meal plans")
    } finally {
      setLoading(false)
    }
  }

  const generateMealPlan = async () => {
    try {
      setError(null)

      // Get current user
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser()

      if (authError) {
        throw new Error(`Authentication error: ${authError.message}`)
      }

      if (!user) {
        throw new Error("You must be logged in to generate meal plans")
      }

      console.log("Generating meal plan for user:", user.id)
      const newPlan = await mealPlanService.generateMealPlan(user.id)
      setMealPlans((prev) => [newPlan, ...prev])
    } catch (err) {
      console.error("Error generating meal plan:", err)
      setError(err instanceof Error ? err.message : "Failed to generate meal plan")
      throw err
    }
  }

  const deleteMealPlan = async (id: string) => {
    try {
      setError(null)
      await mealPlanService.deleteMealPlan(id)
      setMealPlans((prev) => prev.filter((plan) => plan.id !== id))
    } catch (err) {
      console.error("Error deleting meal plan:", err)
      setError(err instanceof Error ? err.message : "Failed to delete meal plan")
      throw err
    }
  }

  const refreshMealPlans = async () => {
    await loadMealPlans()
  }

  useEffect(() => {
    loadMealPlans()
  }, [])

  return {
    mealPlans,
    loading,
    error,
    generateMealPlan,
    deleteMealPlan,
    refreshMealPlans,
  }
}

// Hook for single meal plan (the missing one!)
export const useMealPlan = (id: string): UseMealPlanReturn => {
  const [mealPlan, setMealPlan] = useState<MealPlanWithMeals | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  const loadMealPlan = async () => {
    if (!id) return

    try {
      setLoading(true)
      setError(null)

      // Get current user
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser()

      if (authError) {
        throw new Error(`Authentication error: ${authError.message}`)
      }

      if (!user) {
        throw new Error("You must be logged in to view meal plans")
      }

      console.log("Loading meal plan:", id, "for user:", user.id)
      const plan = await mealPlanService.getMealPlanById(id)

      // Verify user owns this meal plan
      if (plan && plan.user_id !== user.id) {
        throw new Error("You don't have permission to view this meal plan")
      }

      setMealPlan(plan)
    } catch (err) {
      console.error("Error loading meal plan:", err)
      setError(err instanceof Error ? err.message : "Failed to load meal plan")
    } finally {
      setLoading(false)
    }
  }

  const regenerateMeal = async (mealId: string) => {
    try {
      setError(null)

      // Get current user
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser()

      if (authError || !user) {
        throw new Error("Authentication required")
      }

      console.log("Regenerating meal:", mealId)
      await mealPlanService.regenerateMeal(mealId, user.id)

      // Reload the meal plan
      await loadMealPlan()
    } catch (err) {
      console.error("Error regenerating meal:", err)
      setError(err instanceof Error ? err.message : "Failed to regenerate meal")
    }
  }

  useEffect(() => {
    loadMealPlan()
  }, [id])

  return {
    mealPlan,
    loading,
    error,
    regenerateMeal,
  }
}

// Default export for compatibility
export default useMealPlans
