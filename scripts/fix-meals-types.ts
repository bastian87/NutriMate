import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import fetch from 'node-fetch';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

function mapSpoonacularToMealType(dishTypes: string[]): "breakfast" | "lunch" | "dinner" | "snack" | null {
  const types = dishTypes.map(t => t.toLowerCase());
  if (types.includes("breakfast") || types.includes("brunch") || types.includes("morning meal")) return "breakfast";
  if (types.includes("lunch")) return "lunch";
  if (types.includes("main course") || types.includes("dinner") || types.includes("side dish")) return "dinner";
  if (types.includes("snack") || types.includes("appetizer") || types.includes("dessert") || types.includes("fingerfood") || types.includes("antipasti")) return "snack";
  return null;
}

async function fixMealTypes() {
  const { data: recipes, error } = await supabase.from('recipes').select('id, spoonacular_id');
  if (error) throw error;

  for (const recipe of recipes) {
    if (!recipe.spoonacular_id) continue;
    const url = `https://api.spoonacular.com/recipes/${recipe.spoonacular_id}/information?apiKey=${process.env.SPOONACULAR_API_KEY}`;
    const res = await fetch(url);
    if (!res.ok) {
      console.error(`Error al obtener datos de Spoonacular para receta ${recipe.id}`);
      continue;
    }
    const data = await res.json() as any;
    const dishTypes: string[] = data.dishTypes || [];
    const meal_type = mapSpoonacularToMealType(dishTypes);
    if (meal_type) {
      await supabase.from('recipes').update({ meal_type }).eq('id', recipe.id);
      console.log(`Receta ${recipe.id} actualizada a meal_type: ${meal_type}`);
    } else {
      console.log(`Receta ${recipe.id} no tiene meal_type mapeable (dishTypes: ${dishTypes.join(", ")})`);
    }
  }
  console.log("Actualización de meal_type completada.");
}

fixMealTypes().catch(console.error);
