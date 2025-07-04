import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
  try {
    const { mealId, recipeId } = await req.json();

    // Validar que se proporcionen los datos requeridos
    if (!mealId || !recipeId) {
      return NextResponse.json(
        { error: "mealId y recipeId son requeridos" },
        { status: 400 }
      );
    }

    const supabase = createServerSupabaseClient();

    // Verificar que el usuario esté autenticado
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "No autorizado" },
        { status: 401 }
      );
    }

    // Verificar que la comida existe y pertenece al usuario
    const { data: meal, error: mealError } = await supabase
      .from("meal_plan_meals")
      .select(`
        *,
        meal_plans!inner(user_id)
      `)
      .eq("id", mealId)
      .single();

    if (mealError || !meal) {
      return NextResponse.json(
        { error: "Comida no encontrada" },
        { status: 404 }
      );
    }

    // Verificar que el meal plan pertenece al usuario
    if (meal.meal_plans.user_id !== user.id) {
      return NextResponse.json(
        { error: "No tienes permisos para modificar este meal plan" },
        { status: 403 }
      );
    }

    // Verificar que la receta existe
    const { data: recipe, error: recipeError } = await supabase
      .from("recipes")
      .select("id")
      .eq("id", recipeId)
      .single();

    if (recipeError || !recipe) {
      return NextResponse.json(
        { error: "Receta no encontrada" },
        { status: 404 }
      );
    }

    // Actualizar el recipe_id de la comida
    const { error: updateError } = await supabase
      .from("meal_plan_meals")
      .update({ recipe_id: recipeId })
      .eq("id", mealId);

    if (updateError) {
      console.error("Error updating meal:", updateError);
      return NextResponse.json(
        { error: "Error al actualizar la comida" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: "Comida actualizada exitosamente" },
      { status: 200 }
    );

  } catch (error) {
    console.error("Error in update-meal API:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
} 