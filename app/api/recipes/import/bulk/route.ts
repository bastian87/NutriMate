import { NextRequest, NextResponse } from "next/server";
import { importRecipesFromSpoonacular } from "@/scripts/import-spoonacular-recipes";
import { requirePremiumFeature } from "@/lib/api-guards";

// POST - Import multiple recipes (Premium)
export async function POST(request: NextRequest) {
  try {
    // Check premium access for bulk import
    const guardResult = await requirePremiumFeature(request, "recipes.bulk_import");
    if (!guardResult.success) {
      return guardResult.response;
    }

    const apiKey = process.env.SPOONACULAR_API_KEY;
    if (!apiKey) {
      return NextResponse.json({
        inserted: 0,
        skipped: 0,
        errors: ["No se encontró la API key de Spoonacular en las variables de entorno."]
      }, { status: 500 });
    }

    // Leer parámetros del body
    const body = await request.json();
    const { type, number = 10, offset, sort } = body;

    const result = await importRecipesFromSpoonacular(apiKey, type, number, offset, sort);
    
    return NextResponse.json({
      inserted: result.inserted,
      skipped: result.duplicates,
      errors: result.errors,
      success: true
    }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({
      inserted: 0,
      skipped: 0,
      errors: [error.message || "Error desconocido"],
      success: false
    }, { status: 500 });
  }
}
