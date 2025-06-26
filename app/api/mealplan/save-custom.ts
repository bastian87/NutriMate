import { mealPlanService } from "@/lib/services/meal-plan-service";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { userId, distribution, selectedRecipes } = await req.json();
    // Construir meals: array de { recipeId, dayNumber, mealType }
    const DAYS = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];
    const MEALS = ["breakfast", "lunch", "dinner", "snack"];
    const meals: { recipeId: string; dayNumber: number; mealType: "breakfast" | "lunch" | "dinner" | "snack" }[] = [];
    for (let dayIdx = 0; dayIdx < DAYS.length; dayIdx++) {
      for (const mealType of MEALS) {
        const key = `${DAYS[dayIdx]}-${mealType}`;
        const recipeId = selectedRecipes[key];
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
    const mealPlan = await mealPlanService.createMealPlan(
      userId,
      `Meal Plan Personalizado - ${startDate}`,
      startDate,
      endDate,
      meals
    );
    return NextResponse.json({ id: mealPlan.id });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 400 });
  }
} 