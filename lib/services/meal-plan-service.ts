import { createClient } from "@/lib/supabase/client"
import type { Database } from "@/lib/types/database"
import { recipeService } from "./recipe-service"
import { userService } from "./user-service"
import { calcularCaloriasDiarias, distribuirCalorias } from "@/lib/utils"

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

  async generateMealPlan(userId?: string, distribution?: Record<string, number>): Promise<any> {
    // 1. Obtener perfil y preferencias
    if (!userId) throw new Error("No userId provided");
    const prefs = await userService.getUserPreferences(userId);

    if (!prefs) throw new Error("Faltan datos de usuario o preferencias");

    // 2. Calcular calorías objetivo
    const calorias = calcularCaloriasDiarias({
      gender: (prefs.gender as 'male' | 'female') ?? 'male',
      age: prefs.age as number,
      weight: prefs.weight as number,
      height: prefs.height as number,
      activityLevel: prefs.activity_level as string,
      goal: (prefs.health_goal ?? undefined) as string,
    });

    // 3. Distribuir calorías por comida (personalizada si se pasa distribution)
    const distribucion = distribution
      ? Object.fromEntries(Object.entries(distribution).map(([k, v]) => [k, Math.round(v * calorias)]))
      : distribuirCalorias(calorias, !!prefs.include_snacks);

    // 4. Filtrar recetas según preferencias
    const allRecipes = await recipeService.getRecipes({
      tags: prefs.dietary_preferences ?? undefined,
      maxCookTime: prefs.max_prep_time ?? undefined,
      userId,
    });

    const filtrarIngredientes = (receta: any) => {
      const ingredientes = (receta.ingredients || []).map((i: any) => i.name.toLowerCase());
      const excluidos = (prefs.excluded_ingredients ?? []).map((i: string) => i.toLowerCase());
      const alergias = (prefs.allergies ?? []).map((i: string) => i.toLowerCase());
      const intolerancias = (prefs.intolerances ?? []).map((i: string) => i.toLowerCase());
      return (
        !excluidos.some((e: string) => ingredientes.includes(e)) &&
        !alergias.some((a: string) => ingredientes.includes(a)) &&
        !intolerancias.some((i: string) => ingredientes.includes(i))
      );
    };

    const recetasFiltradas = allRecipes.filter(filtrarIngredientes);

    // 5. Seleccionar recetas para cada comida de cada día, forzando variedad semanal por tipo de comida
    const DAYS = 7;
    const meals: { recipeId: string; dayNumber: number; mealType: "breakfast" | "lunch" | "dinner" | "snack" }[] = [];
    // Llevar un set global de recetas usadas por tipo de comida
    const usedRecipesByMealType: Record<string, Set<string>> = {};
    for (const mealType of prefs.include_snacks ? ["breakfast", "lunch", "dinner", "snack"] : ["breakfast", "lunch", "dinner"] as const) {
      usedRecipesByMealType[mealType] = new Set();
    }

    for (let day = 1; day <= DAYS; day++) {
      for (const mealType of prefs.include_snacks ? ["breakfast", "lunch", "dinner", "snack"] : ["breakfast", "lunch", "dinner"] as const) {
        const objetivo = distribucion[mealType as keyof typeof distribucion] ?? 0;
        // Filtrar recetas estrictamente por meal_type
        const recetasTipo = recetasFiltradas.filter(r => (r.meal_type === mealType));
        // Si no hay suficientes recetas de ese tipo, permitir usar cualquiera sin meal_type o con meal_type null
        const recetasDisponibles = recetasTipo.length > 0 ? recetasTipo : recetasFiltradas.filter(r => !r.meal_type || r.meal_type === mealType);
        // Filtrar las que no se hayan usado esa semana para ese mealType
        const recetasNoUsadas = recetasDisponibles.filter(r => !usedRecipesByMealType[mealType].has(r.id));
        // Si hay recetas no usadas, elegir entre ellas, si no, permitir repetir
        const candidatas = recetasNoUsadas.length > 0 ? recetasNoUsadas : recetasDisponibles;
        // Elegir la más cercana a las calorías objetivo
        let mejor = candidatas[0];
        let minDiff = mejor ? Math.abs((mejor.calories || 0) - objetivo) : Infinity;
        for (const receta of candidatas) {
          const diff = Math.abs((receta.calories || 0) - objetivo);
          if (diff < minDiff) {
            mejor = receta;
            minDiff = diff;
          }
        }
        if (mejor) {
          meals.push({
            recipeId: mejor.id,
            dayNumber: day,
            mealType: mealType as "breakfast" | "lunch" | "dinner" | "snack",
          });
          usedRecipesByMealType[mealType].add(mejor.id);
        }
      }
    }

    // 6. Guardar el meal plan en Supabase
    const startDate = new Date().toISOString().split("T")[0];
    const endDate = new Date(Date.now() + 6 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
    const name = `Meal Plan generado - ${startDate}`;
    const mealPlan = await this.createMealPlan(userId, name, startDate, endDate, meals);
    return mealPlan;
  }

  async regenerateMeal(userId: string, mealType: string, caloriasObjetivo: number, recetasUsadas: string[] = []) {
    const prefs = await userService.getUserPreferences(userId);
    if (!prefs) throw new Error("Faltan datos de usuario o preferencias");
    const allRecipes = await recipeService.getRecipes({
      tags: prefs.dietary_preferences ?? undefined,
      maxCookTime: prefs.max_prep_time ?? undefined,
      userId,
    });

    const filtrarIngredientes = (receta: any) => {
      const ingredientes = (receta.ingredients || []).map((i: any) => i.name.toLowerCase());
      const excluidos = (prefs.excluded_ingredients ?? []).map((i: string) => i.toLowerCase());
      const alergias = (prefs.allergies ?? []).map((i: string) => i.toLowerCase());
      const intolerancias = (prefs.intolerances ?? []).map((i: string) => i.toLowerCase());
      return (
        !excluidos.some((e: string) => ingredientes.includes(e)) &&
        !alergias.some((a: string) => ingredientes.includes(a)) &&
        !intolerancias.some((i: string) => ingredientes.includes(i))
      );
    };

    const recetasFiltradas = allRecipes
      .filter(filtrarIngredientes)
      .filter(r => r.meal_type === mealType && !recetasUsadas.includes(r.id));

    if (recetasFiltradas.length === 0) {
      throw new Error("No hay recetas suficientes para este tipo de comida.");
    }

    let mejor = recetasFiltradas[0];
    let minDiff = Math.abs((mejor?.calories || 0) - caloriasObjetivo);
    for (const receta of recetasFiltradas) {
      const diff = Math.abs((receta.calories || 0) - caloriasObjetivo);
      if (diff < minDiff) {
        mejor = receta;
        minDiff = diff;
      }
    }
    return mejor;
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
