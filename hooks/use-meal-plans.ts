"use client"

import { useState, useEffect, useCallback } from "react"
import { mealPlanService } from "@/lib/services/meal-plan-service"
import type { ExportFormat } from "@/lib/services/meal-plan-service"
import { createClient } from "@/lib/supabase/client"

// Types based on your database schema
export interface MealPlan {
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
      image_url: string | null
      prep_time_minutes: number | null
      cook_time_minutes: number | null
      calories: number | null
      protein: number | null
      carbs: number | null
      fat: number | null
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
export const useMealPlans = (): UseMealPlansReturn & { exportMealPlan: typeof mealPlanService.exportMealPlan } => {
  const [mealPlans, setMealPlans] = useState<MealPlan[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  const loadMealPlans = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) {
        setMealPlans([])
        return
      }
      const plans = await mealPlanService.getUserMealPlans(user.id)
      setMealPlans(plans)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load meal plans")
    } finally {
      setLoading(false)
    }
  }, [supabase])

  const generateMealPlan = async () => {
    try {
      setLoading(true)
      setError(null)
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) throw new Error("You must be logged in to generate meal plans")

      const newPlan = await mealPlanService.generateMealPlan(user.id)
      setMealPlans((prev) => [newPlan, ...prev])
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to generate meal plan"
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const deleteMealPlan = async (id: string) => {
    try {
      setError(null)
      await mealPlanService.deleteMealPlan(id)
      setMealPlans((prev) => prev.filter((plan) => plan.id !== id))
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to delete meal plan"
      setError(errorMessage)
      throw new Error(errorMessage)
    }
  }

  const refreshMealPlans = useCallback(async () => {
    await loadMealPlans()
  }, [loadMealPlans])

  const exportMealPlan = async (id: string, options: ExportFormat) => {
    return mealPlanService.exportMealPlan(id, options)
  }

  useEffect(() => {
    loadMealPlans()
  }, [loadMealPlans])

  return { mealPlans, loading, error, generateMealPlan, deleteMealPlan, refreshMealPlans, exportMealPlan }
}

// Hook for a single meal plan
export const useMealPlan = (id: string | null): UseMealPlanReturn => {
  const [mealPlan, setMealPlan] = useState<MealPlanWithMeals | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  const loadMealPlan = useCallback(async () => {
    if (!id) {
      setLoading(false)
      return
    }
    try {
      setLoading(true)
      setError(null)
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) throw new Error("You must be logged in to view meal plans")

      const plan = await mealPlanService.getMealPlanById(id)
      if (plan && plan.user_id !== user.id) {
        throw new Error("You don't have permission to view this meal plan")
      }
      setMealPlan(plan)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load meal plan")
    } finally {
      setLoading(false)
    }
  }, [id, supabase])

  const regenerateMeal = async (mealId: string) => {
    try {
      setError(null)
      setLoading(true)
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) throw new Error("Authentication required")

      await mealPlanService.regenerateMeal(mealId, user.id)
      await loadMealPlan()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to regenerate meal")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadMealPlan()
  }, [id, loadMealPlan])

  return { mealPlan, loading, error, regenerateMeal }
}
