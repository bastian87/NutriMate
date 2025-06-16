import { createClient } from "@/lib/supabase/client"
import type { Database } from "@/lib/types/database"
import { recipeService } from "./recipe-service"

type MealPlan = Database["public"]["Tables"]["meal_plans"]["Row"]
type MealPlanMeal = Database["public"]["Tables"]["meal_plan_meals"]["Row"]

export interface MealPlanWithMeals extends MealPlan {
  meals: (MealPlanMeal & {
    recipe: {
      id: string
      name: string
      calories: number
      protein: number
      carbs: number
      fat: number
      image_url: string | null
      prep_time_minutes: number
      cook_time_minutes: number
    }
  })[]
}

export class MealPlanService {
  private supabase = createClient()

  async getUserMealPlans(userId?: string): Promise<MealPlan[]> {
    try {
      // If no userId provided, try to get current user
      if (!userId) {
        const {
          data: { user },
        } = await this.supabase.auth.getUser()
        if (!user) {
          console.log("No authenticated user found")
          return []
        }
        userId = user.id
      }

      console.log("Fetching meal plans for user:", userId)

      const { data, error } = await this.supabase
        .from("meal_plans")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })

      if (error) {
        console.error("Error fetching meal plans:", error)
        throw error
      }

      return data || []
    } catch (error) {
      console.error("Error in getUserMealPlans:", error)
      throw error
    }
  }

  async getMealPlanById(id: string): Promise<MealPlanWithMeals | null> {
    try {
      const { data: mealPlan, error: mealPlanError } = await this.supabase
        .from("meal_plans")
        .select("*")
        .eq("id", id)
        .single()

      if (mealPlanError) throw mealPlanError

      const { data: meals, error: mealsError } = await this.supabase
        .from("meal_plan_meals")
        .select(`
          *,
          recipes(
            id,
            name,
            calories,
            protein,
            carbs,
            fat,
            image_url,
            prep_time_minutes,
            cook_time_minutes
          )
        `)
        .eq("meal_plan_id", id)
        .order("day_number")
        .order("meal_type")

      if (mealsError) throw mealsError

      return {
        ...mealPlan,
        meals: meals.map((meal) => ({
          ...meal,
          recipe: meal.recipes as any,
        })),
      }
    } catch (error) {
      console.error("Error in getMealPlanById:", error)
      throw error
    }
  }

  async createMealPlan(
    userId: string,
    name: string,
    startDate: string,
    endDate: string,
    meals: {
      recipeId: string
      dayNumber: number
      mealType: "breakfast" | "lunch" | "dinner" | "snack"
    }[],
  ): Promise<MealPlan> {
    try {
      const { data: mealPlan, error: mealPlanError } = await this.supabase
        .from("meal_plans")
        .insert({
          user_id: userId,
          name,
          start_date: startDate,
          end_date: endDate,
        })
        .select()
        .single()

      if (mealPlanError) throw mealPlanError

      if (meals.length > 0) {
        const { error: mealsError } = await this.supabase.from("meal_plan_meals").insert(
          meals.map((meal) => ({
            meal_plan_id: mealPlan.id,
            recipe_id: meal.recipeId,
            day_number: meal.dayNumber,
            meal_type: meal.mealType,
          })),
        )

        if (mealsError) throw mealsError
      }

      return mealPlan
    } catch (error) {
      console.error("Error in createMealPlan:", error)
      throw error
    }
  }

  async generateMealPlan(
    userId?: string,
    preferences?: {
      dietaryPreferences?: string[]
      excludedIngredients?: string[]
      calorieTarget?: number
    },
  ): Promise<MealPlanWithMeals> {
    try {
      // If no userId provided, try to get current user
      if (!userId) {
        const {
          data: { user },
        } = await this.supabase.auth.getUser()
        if (!user) {
          throw new Error("No authenticated user found")
        }
        userId = user.id
      }

      console.log("Generating meal plan for user:", userId)

      // Get available recipes based on preferences
      const recipes = await recipeService.getRecipes({
        tags: preferences?.dietaryPreferences,
        userId,
      })

      if (recipes.length === 0) {
        throw new Error("No recipes available for your preferences")
      }

      // Simple meal plan generation logic
      const mealTypes: ("breakfast" | "lunch" | "dinner")[] = ["breakfast", "lunch", "dinner"]
      const meals: {
        recipeId: string
        dayNumber: number
        mealType: "breakfast" | "lunch" | "dinner" | "snack"
      }[] = []

      for (let day = 1; day <= 7; day++) {
        for (const mealType of mealTypes) {
          // Simple random selection - in production, you'd want more sophisticated logic
          const randomRecipe = recipes[Math.floor(Math.random() * recipes.length)]
          meals.push({
            recipeId: randomRecipe.id,
            dayNumber: day,
            mealType,
          })
        }
      }

      const startDate = new Date().toISOString().split("T")[0]
      const endDate = new Date(Date.now() + 6 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]

      const mealPlan = await this.createMealPlan(
        userId,
        `Meal Plan - ${new Date().toLocaleDateString()}`,
        startDate,
        endDate,
        meals,
      )

      return this.getMealPlanById(mealPlan.id) as Promise<MealPlanWithMeals>
    } catch (error) {
      console.error("Error in generateMealPlan:", error)
      throw error
    }
  }

  async regenerateMeal(mealId: string, userId?: string): Promise<void> {
    try {
      // If no userId provided, try to get current user
      if (!userId) {
        const {
          data: { user },
        } = await this.supabase.auth.getUser()
        if (!user) {
          throw new Error("No authenticated user found")
        }
        userId = user.id
      }

      // Get current meal
      const { data: currentMeal, error: currentMealError } = await this.supabase
        .from("meal_plan_meals")
        .select("*")
        .eq("id", mealId)
        .single()

      if (currentMealError) throw currentMealError

      // Get alternative recipes
      const recipes = await recipeService.getRecipes({ userId })
      const alternativeRecipes = recipes.filter((r) => r.id !== currentMeal.recipe_id)

      if (alternativeRecipes.length === 0) {
        throw new Error("No alternative recipes available")
      }

      const newRecipe = alternativeRecipes[Math.floor(Math.random() * alternativeRecipes.length)]

      // Update the meal
      const { error: updateError } = await this.supabase
        .from("meal_plan_meals")
        .update({ recipe_id: newRecipe.id })
        .eq("id", mealId)

      if (updateError) throw updateError
    } catch (error) {
      console.error("Error in regenerateMeal:", error)
      throw error
    }
  }

  async deleteMealPlan(id: string): Promise<void> {
    try {
      const { error } = await this.supabase.from("meal_plans").delete().eq("id", id)

      if (error) throw error
    } catch (error) {
      console.error("Error in deleteMealPlan:", error)
      throw error
    }
  }
}

export const mealPlanService = new MealPlanService()
