import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

function mapSpoonacularToMealType(dishTypes: string[]): "breakfast" | "lunch" | "dinner" | "snack" | null {
  const types = dishTypes.map(t => t.toLowerCase());
  if (types.includes("breakfast") || types.includes("brunch")) return "breakfast";
  if (types.includes("lunch")) return "lunch";
  if (types.includes("main course") || types.includes("dinner") || types.includes("side dish")) return "dinner";
  if (types.includes("snack") || types.includes("appetizer") || types.includes("dessert") || types.includes("fingerfood")) return "snack";
  return null;
}

async function updateMealTypes() {
  const { data: recipes, error } = await supabase.from('recipes').select('id, dishTypes');
  if (error) throw error;

  for (const recipe of recipes) {
    let dishTypes: string[] = [];
    if (Array.isArray(recipe.dishTypes)) {
      dishTypes = recipe.dishTypes;
    } else if (typeof recipe.dishTypes === "string") {
      try {
        dishTypes = JSON.parse(recipe.dishTypes);
      } catch {
        dishTypes = recipe.dishTypes.split(",").map(s => s.trim());
      }
    }
    const meal_type = mapSpoonacularToMealType(dishTypes);
    if (meal_type) {
      await supabase.from('recipes').update({ meal_type }).eq('id', recipe.id);
      console.log(`Receta ${recipe.id} actualizada a meal_type: ${meal_type}`);
    }
  }
  console.log("Actualización de meal_type completada.");
}

updateMealTypes().catch(console.error); 