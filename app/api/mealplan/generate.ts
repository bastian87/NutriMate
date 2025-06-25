import { mealPlanService } from "@/lib/services/meal-plan-service";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { userId, distribution } = await req.json();
    const mealPlan = await mealPlanService.generateMealPlan(userId, distribution);
    return NextResponse.json(mealPlan);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 400 });
  }
} 