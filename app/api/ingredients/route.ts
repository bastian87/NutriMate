import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { z } from "zod";

const IngredientSchema = z.object({
  name: z.string().min(1),
  group: z.enum(['carb', 'protein', 'fat', 'vegfruit', 'treat']),
  kcalPer100g: z.number().min(0).max(1000),
  locale: z.string().optional()
});

export async function GET() {
  try {
    const supa = createServerClient();
    const { data, error } = await supa
      .from("ingredients")
      .select("id, name, group, kcal_per_100g, locale")
      .order('name', { ascending: true });
    
    if (error) {
      console.error('Ingredients API - Error:', error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    
    // Transform data to match frontend interface
    const transformedData = data?.map(ingredient => ({
      id: ingredient.id,
      name: ingredient.name,
      group: ingredient.group,
      kcalPer100g: ingredient.kcal_per_100g,
      locale: ingredient.locale
    })) || [];
    
    console.log('Ingredients API - Sample data:', transformedData.slice(0, 3));
    return NextResponse.json({ ingredients: transformedData });
  } catch (error) {
    console.error('Ingredients API - Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validatedData = IngredientSchema.parse(body);
    
    const supa = createServerClient();
    
    const { data, error } = await supa
      .from("ingredients")
      .insert({
        name: validatedData.name,
        group: validatedData.group,
        kcal_per_100g: validatedData.kcalPer100g,
        locale: validatedData.locale || 'es'
      })
      .select("id, name, group, kcal_per_100g, locale")
      .single();
    
    if (error) {
      console.error('Ingredients API - POST Error:', error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    
    // Transform data to match frontend interface
    const transformedData = {
      id: data.id,
      name: data.name,
      group: data.group,
      kcalPer100g: data.kcal_per_100g,
      locale: data.locale
    };
    
    return NextResponse.json({ ingredient: transformedData });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid data format', details: error.issues }, { status: 400 });
    }
    console.error('Ingredients API - POST Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
