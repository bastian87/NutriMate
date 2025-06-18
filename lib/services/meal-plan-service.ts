import { createClient } from "@/lib/supabase/client"
import type { Database } from "@/lib/types/database"
import { recipeService } from "./recipe-service"
import { userService } from "./user-service"

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

export interface ExportFormat {
  format: "pdf" | "csv" | "json"
  includeNutrition?: boolean
  includeIngredients?: boolean
  includeInstructions?: boolean
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
      includeSnacks?: boolean
      allergies?: string[]
      intolerances?: string[]
      maxPrepTime?: number
      macroPriority?: string
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

      // Obtener preferencias del usuario si no se pasan explícitamente
      let prefs = preferences
      if (!prefs) {
        const userPrefs = await userService.getUserPreferences(userId)
        prefs = {
          dietaryPreferences: userPrefs?.dietary_preferences || [],
          excludedIngredients: userPrefs?.excluded_ingredients || [],
          calorieTarget: userPrefs?.calorie_target || 2000,
          includeSnacks: userPrefs?.include_snacks ?? false,
          allergies: userPrefs?.allergies || [],
          intolerances: userPrefs?.intolerances || [],
          maxPrepTime: userPrefs?.max_prep_time || undefined,
          macroPriority: userPrefs?.macro_priority || "balanced",
        }
      }

      console.log("Generating meal plan for user:", userId)

      // Get available recipes based on preferences
      let recipes = await recipeService.getRecipes({
        tags: prefs?.dietaryPreferences,
        userId,
      })
      // Filtrar recetas que no contengan ingredientes excluidos
      if (prefs?.excludedIngredients && prefs.excludedIngredients.length > 0) {
        recipes = recipes.filter(recipe => {
          const ingredients = (recipe.ingredients || []).map(i => i.name?.toLowerCase())
          return !prefs!.excludedIngredients!.some(ex => ingredients.includes(ex.toLowerCase()))
        })
      }
      // Filtrar recetas por alergias e intolerancias
      if (prefs?.allergies && prefs.allergies.length > 0) {
        recipes = recipes.filter(recipe => {
          const ingredients = (recipe.ingredients || []).map(i => i.name?.toLowerCase())
          return !prefs.allergies!.some(allergy => ingredients.includes(allergy.toLowerCase()))
        })
      }
      if (prefs?.intolerances && prefs.intolerances.length > 0) {
        recipes = recipes.filter(recipe => {
          const ingredients = (recipe.ingredients || []).map(i => i.name?.toLowerCase())
          return !prefs.intolerances!.some(intol => ingredients.includes(intol.toLowerCase()))
        })
      }
      // Filtrar por tiempo máximo de preparación
      if (prefs?.maxPrepTime) {
        recipes = recipes.filter(recipe => (recipe.prep_time_minutes || 0) + (recipe.cook_time_minutes || 0) <= prefs.maxPrepTime!)
      }

      if (recipes.length === 0) {
        throw new Error("No recipes available for your preferences")
      }

      // Meal types según snacks
      const mealTypes: ("breakfast" | "lunch" | "dinner" | "snack")[] = prefs.includeSnacks
        ? ["breakfast", "lunch", "dinner", "snack"]
        : ["breakfast", "lunch", "dinner"]
      const meals: {
        recipeId: string
        dayNumber: number
        mealType: "breakfast" | "lunch" | "dinner" | "snack"
      }[] = []

      // Evitar repeticiones y aproximar objetivo calórico diario
      const usedRecipeIds = new Set<string>()
      for (let day = 1; day <= 7; day++) {
        let dailyCalories = 0
        for (const mealType of mealTypes) {
          // Seleccionar receta que no se haya usado y que no exceda mucho el objetivo calórico
          let candidates = recipes.filter(r => !usedRecipeIds.has(r.id))
          if (candidates.length === 0) candidates = recipes // Si se acaban, permitir repeticiones
          // Macro prioridad: balanceado, proteína, carbos, grasas
          let selected = candidates[0]
          let minDiff = Math.abs((dailyCalories + (selected.calories || 0)) - (prefs?.calorieTarget || 2000) / mealTypes.length)
          for (const r of candidates) {
            let macroScore = 0
            if (prefs.macroPriority === "protein") macroScore = r.protein || 0
            else if (prefs.macroPriority === "carbs") macroScore = r.carbs || 0
            else if (prefs.macroPriority === "fat") macroScore = r.fat || 0
            else macroScore = (r.protein || 0) + (r.carbs || 0) + (r.fat || 0)
            const diff = Math.abs((dailyCalories + (r.calories || 0)) - (prefs?.calorieTarget || 2000) / mealTypes.length)
            // Si la macro prioridad es relevante, priorizar recetas con mayor macroScore
            if (prefs.macroPriority !== "balanced") {
              if (macroScore > (selected[prefs.macroPriority as "protein" | "carbs" | "fat"] || 0)) {
                selected = r
                minDiff = diff
              }
            } else {
              if (diff < minDiff) {
                selected = r
                minDiff = diff
              }
            }
          }
          meals.push({
            recipeId: selected.id,
            dayNumber: day,
            mealType,
          })
          usedRecipeIds.add(selected.id)
          dailyCalories += selected.calories || 0
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

  // NEW: Export meal plan functionality
  async exportMealPlan(id: string, options: ExportFormat): Promise<string | Blob> {
    try {
      const mealPlan = await this.getMealPlanById(id)
      if (!mealPlan) {
        throw new Error("Meal plan not found")
      }

      switch (options.format) {
        case "json":
          return this.exportAsJSON(mealPlan, options)
        case "csv":
          return this.exportAsCSV(mealPlan, options)
        case "pdf":
          return this.exportAsPDF(mealPlan, options)
        default:
          throw new Error("Unsupported export format")
      }
    } catch (error) {
      console.error("Error in exportMealPlan:", error)
      throw error
    }
  }

  private exportAsJSON(mealPlan: MealPlanWithMeals, options: ExportFormat): string {
    const exportData = {
      name: mealPlan.name,
      startDate: mealPlan.start_date,
      endDate: mealPlan.end_date,
      meals: mealPlan.meals.map((meal) => ({
        day: meal.day_number,
        mealType: meal.meal_type,
        recipe: {
          name: meal.recipe.name,
          prepTime: meal.recipe.prep_time_minutes,
          cookTime: meal.recipe.cook_time_minutes,
          ...(options.includeNutrition && {
            nutrition: {
              calories: meal.recipe.calories,
              protein: meal.recipe.protein,
              carbs: meal.recipe.carbs,
              fat: meal.recipe.fat,
            },
          }),
        },
      })),
    }

    return JSON.stringify(exportData, null, 2)
  }

  private exportAsCSV(mealPlan: MealPlanWithMeals, options: ExportFormat): string {
    const headers = ["Day", "Meal Type", "Recipe Name", "Prep Time (min)", "Cook Time (min)"]

    if (options.includeNutrition) {
      headers.push("Calories", "Protein (g)", "Carbs (g)", "Fat (g)")
    }

    const rows = [headers.join(",")]

    mealPlan.meals.forEach((meal) => {
      const row = [
        meal.day_number,
        meal.meal_type,
        `"${meal.recipe.name}"`,
        meal.recipe.prep_time_minutes,
        meal.recipe.cook_time_minutes,
      ]

      if (options.includeNutrition) {
        row.push(meal.recipe.calories, meal.recipe.protein, meal.recipe.carbs, meal.recipe.fat)
      }

      rows.push(row.join(","))
    })

    return rows.join("\n")
  }

  private exportAsPDF(mealPlan: MealPlanWithMeals, options: ExportFormat): string {
    // For now, return a simple text format that could be converted to PDF
    // In a real implementation, you'd use a PDF library like jsPDF
    let content = `MEAL PLAN: ${mealPlan.name}\n`
    content += `Period: ${mealPlan.start_date} to ${mealPlan.end_date}\n\n`

    const groupedMeals = mealPlan.meals.reduce(
      (acc, meal) => {
        if (!acc[meal.day_number]) acc[meal.day_number] = []
        acc[meal.day_number].push(meal)
        return acc
      },
      {} as Record<number, typeof mealPlan.meals>,
    )

    Object.entries(groupedMeals).forEach(([day, meals]) => {
      content += `DAY ${day}\n`
      content += "=".repeat(20) + "\n"

      meals.forEach((meal) => {
        content += `${meal.meal_type.toUpperCase()}: ${meal.recipe.name}\n`
        content += `Prep: ${meal.recipe.prep_time_minutes}min | Cook: ${meal.recipe.cook_time_minutes}min\n`

        if (options.includeNutrition) {
          content += `Calories: ${meal.recipe.calories} | Protein: ${meal.recipe.protein}g | Carbs: ${meal.recipe.carbs}g | Fat: ${meal.recipe.fat}g\n`
        }
        content += "\n"
      })
      content += "\n"
    })

    return content
  }
}

export const mealPlanService = new MealPlanService()
