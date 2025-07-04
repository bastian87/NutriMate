import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { Database } from "@/lib/types/database";

export async function POST(req: Request) {
  try {
    const supabase = createServerComponentClient<Database>({ cookies });
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }
    const { distribution, selectedRecipes } = await req.json();
    const DAYS = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];
    const MEALS = ["breakfast", "lunch", "dinner", "snack"];
    const meals: { recipeId: string; dayNumber: number; mealType: "breakfast" | "lunch" | "dinner" | "snack" }[] = [];
    for (let dayIdx = 0; dayIdx < DAYS.length; dayIdx++) {
      for (const mealType of MEALS) {
        const key = `${DAYS[dayIdx]}-${mealType}`;
        const recipeObj = selectedRecipes[key];
        const recipeId = recipeObj && recipeObj.id ? recipeObj.id : undefined;
        if (typeof recipeId === "string" && recipeId) {
          meals.push({
            recipeId,
            dayNumber: dayIdx + 1,
            mealType: mealType as "breakfast" | "lunch" | "dinner" | "snack",
          });
        }
      }
    }
    const startDate = new Date().toISOString().split("T")[0];
    const endDate = new Date(Date.now() + 6 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
    // Inserta el meal plan usando el cliente con sesión
    const { data: mealPlan, error: mealPlanError } = await supabase
      .from("meal_plans")
      .insert({
        user_id: user.id,
        name: `Meal Plan Personalizado - ${startDate}`,
        start_date: startDate,
        end_date: endDate,
      })
      .select()
      .single();
    if (mealPlanError) throw mealPlanError;
    // Inserta las comidas
    if (meals.length > 0) {
      const { error: mealsError } = await supabase.from("meal_plan_meals").insert(
        meals.map((meal) => ({
          meal_plan_id: mealPlan.id,
          recipe_id: meal.recipeId,
          day_number: meal.dayNumber,
          meal_type: meal.mealType,
        }))
      );
      if (mealsError) throw mealsError;
    }
    return NextResponse.json({ id: mealPlan.id });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 400 });
  }
} 