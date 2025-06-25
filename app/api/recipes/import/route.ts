import { NextResponse } from "next/server";
import { importRecipesFromSpoonacular } from "@/scripts/import-spoonacular-recipes";

export async function GET(request: Request) {
  try {
    const apiKey = process.env.SPOONACULAR_API_KEY;
    if (!apiKey) {
      return NextResponse.json({
        inserted: 0,
        skipped: 0,
        errors: ["No se encontró la API key de Spoonacular en las variables de entorno."]
      }, { status: 500 });
    }

    // Leer parámetros de query
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type") || undefined;
    const number = searchParams.get("number") ? parseInt(searchParams.get("number")!) : 10;
    const offset = searchParams.get("offset") ? parseInt(searchParams.get("offset")!) : undefined;
    const sort = searchParams.get("sort") || undefined;

    const result = await importRecipesFromSpoonacular(apiKey, type, number, offset, sort);
    return NextResponse.json({
      inserted: result.inserted,
      skipped: result.duplicates,
      errors: result.errors
    }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({
      inserted: 0,
      skipped: 0,
      errors: [error.message || "Error desconocido"]
    }, { status: 500 });
  }
} 