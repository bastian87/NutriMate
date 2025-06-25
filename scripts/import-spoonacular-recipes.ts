// SQL para agregar el campo spoonacular_id a la tabla recipes:
//
// ALTER TABLE recipes ADD COLUMN spoonacular_id bigint UNIQUE;
//
// Puedes ejecutar este SQL en el editor de Supabase o desde un script.

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

type ImportResult = {
  inserted: number;
  duplicates: number;
  errors: string[];
};

export async function importRecipesFromSpoonacular(
  apiKey: string,
  type?: string,
  number: number = 10,
  offset?: number,
  sort?: string
): Promise<ImportResult> {
  const result: ImportResult = { inserted: 0, duplicates: 0, errors: [] };

  try {
    // 1. Buscar recetas por tipo usando complexSearch
    let url = `https://api.spoonacular.com/recipes/complexSearch?number=${number}&addRecipeInformation=true&addRecipeNutrition=true&apiKey=${apiKey}`;
    if (type) {
      url += `&type=${encodeURIComponent(type)}`;
    }
    if (offset !== undefined) {
      url += `&offset=${offset}`;
    }
    if (sort) {
      url += `&sort=${encodeURIComponent(sort)}`;
    }
    const res = await fetch(url);
    if (!res.ok) throw new Error("Error al obtener recetas de Spoonacular");
    const data = await res.json();
    const recipes = data.results as any[];

    // 2. Obtener detalles completos de cada receta usando informationBulk
    const ids = recipes.map(r => r.id).join(",");
    const detailsRes = await fetch(
      `https://api.spoonacular.com/recipes/informationBulk?ids=${ids}&includeNutrition=true&apiKey=${apiKey}`
    );
    if (!detailsRes.ok) throw new Error("Error al obtener detalles completos de las recetas");
    const details = await detailsRes.json();

    for (const recipe of details) {
      // 3. Extraer y mapear campos
      const name = recipe.title?.trim();
      const description = recipe.summary || null;
      const image_url = recipe.image || null;
      const prep_time_minutes = Number(recipe.preparationMinutes) || 0;
      const cook_time_minutes = Number(recipe.cookingMinutes) || 0;
      const servings = Number(recipe.servings) || 1;
      const instructions = recipe.instructions?.trim() || "";
      const cuisine_type = Array.isArray(recipe.cuisines) && recipe.cuisines.length > 0 ? recipe.cuisines[0] : null;
      const meal_type = Array.isArray(recipe.dishTypes) && recipe.dishTypes.length > 0 ? recipe.dishTypes[0] : null;
      const spoonacular_id = recipe.id;
      const difficulty_level = null; // Spoonacular no provee este campo

      // Nutrición
      let calories = null, protein = null, carbs = null, fat = null, fiber = null, sugar = null, sodium = null;
      if (Array.isArray(recipe.nutrition?.nutrients)) {
        for (const n of recipe.nutrition.nutrients) {
          const val = n.amount !== undefined ? Number(n.amount) : null;
          switch (n.name) {
            case "Calories": calories = val; break;
            case "Protein": protein = val; break;
            case "Carbohydrates": carbs = val; break;
            case "Fat": fat = val; break;
            case "Fiber": fiber = val; break;
            case "Sugar": sugar = val; break;
            case "Sodium": sodium = val; break;
          }
        }
      }

      // 4. Validar campos obligatorios
      if (!name || !image_url) {
        result.errors.push(`Receta omitida por campos obligatorios faltantes: ${name || "sin nombre"}`);
        continue;
      }

      // 5. Evitar duplicados usando spoonacular_id
      const { data: existing, error: dupError } = await supabase
        .from("recipes")
        .select("id")
        .eq("spoonacular_id", spoonacular_id)
        .maybeSingle();

      if (dupError) {
        result.errors.push(`Error comprobando duplicado: ${name} (${dupError.message})`);
        continue;
      }
      if (existing) {
        result.duplicates++;
        continue;
      }

      // 6. Insertar en Supabase
      const { data: insertData, error: insertError } = await supabase.from("recipes").insert({
        name,
        description,
        image_url,
        prep_time_minutes,
        cook_time_minutes,
        servings,
        calories,
        protein,
        carbs,
        fat,
        fiber,
        sugar,
        sodium,
        cuisine_type,
        meal_type,
        instructions,
        spoonacular_id,
        difficulty_level,
      }).select("id");

      if (insertError) {
        result.errors.push(`Error insertando receta: ${name} (${insertError.message})`);
        continue;
      }

      // 7. Insertar ingredientes si existen
      const recipeId = insertData && insertData[0]?.id;
      if (recipeId && Array.isArray(recipe.extendedIngredients) && recipe.extendedIngredients.length > 0) {
        const ingredients = recipe.extendedIngredients.map((ing: any) => ({
          recipe_id: recipeId,
          name: ing.name,
          quantity: ing.amount !== undefined ? String(ing.amount) : "",
          unit: ing.unit || null,
          spoonacular_ingredient_id: ing.id || null,
          original: ing.original || null,
          aisle: ing.aisle || null,
          image: ing.image || null,
          meta: Array.isArray(ing.meta) ? ing.meta.join(", ") : null,
        }));
        const { error: ingError } = await supabase.from("recipe_ingredients").insert(ingredients);
        if (ingError) {
          result.errors.push(`Error insertando ingredientes para ${name}: ${ingError.message}`);
        }
      }

      result.inserted++;
    }
  } catch (err: any) {
    result.errors.push(`Error general: ${err.message}`);
  }

  return result;
} 