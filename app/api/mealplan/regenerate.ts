import { mealPlanService } from "@/lib/services/meal-plan-service";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { userId, mealType, caloriasObjetivo, recetasUsadas } = await req.json();
    const receta = await mealPlanService.regenerateMeal(userId, mealType, caloriasObjetivo, recetasUsadas);
    return NextResponse.json(receta);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 400 });
  }
} 