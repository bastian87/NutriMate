import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

console.log('SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
console.log('SERVICE_ROLE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY ? 'OK' : 'MISSING');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // Usa la service key para poder actualizar
);

const rules = {
  vegan:    [/egg|milk|cheese|butter|cream|yogurt|honey|meat|chicken|beef|pork|fish|shrimp|gelatin|anchovy/i],
  vegetarian: [/chicken|beef|pork|fish|shrimp|meat|anchovy/i],
  pescatarian: [/chicken|beef|pork|lamb|bacon|meat/i],
  keto:     [/sugar|honey|flour|rice|bread|pasta|potato|corn|banana|oats|beans|lentils/i],
  paleo:    [/milk|cheese|butter|yogurt|legumes|beans|lentils|peanuts|flour|rice|bread/i],
  lowcarb:  [/bread|pasta|rice|potatoes|corn|flour|sugar|banana/i],
  lowfat:   [/butter|oil|cheese|cream|mayonnaise|bacon/i],
  glutenfree: [/wheat|flour|bread|pasta|barley|rye|breadcrumbs/i],
};

const mediterraneanPositive = [
  /olive oil/i, /fish/i, /nuts/i, /vegetables?/i, /legumes?/i, /whole grains?/i, /herbs?/i, /fruits?/i
];
const mediterraneanNegative = [/bacon|sausage|salami|ham|beef|pork|lamb|meat/i];

async function autoTagRecipes() {
  const { data: recipes, error } = await supabase.from('recipes').select('id, name, calories');
  if (error) throw error;

  for (const recipe of recipes) {
    const { data: ingredientsData } = await supabase
      .from('recipe_ingredients')
      .select('name')
      .eq('recipe_id', recipe.id);

    const ingredients = (ingredientsData || []).map(i => i.name.toLowerCase());

    const tags: string[] = [];

    // Vegan
    if (!ingredients.some(ing => rules.vegan.some(r => r.test(ing)))) tags.push("Vegan");
    // Vegetarian
    if (!ingredients.some(ing => rules.vegetarian.some(r => r.test(ing)))) tags.push("Vegetarian");
    // Pescatarian
    if (
      !ingredients.some(ing => rules.pescatarian.some(r => r.test(ing))) &&
      ingredients.some(ing => /fish|salmon|tuna|shrimp/.test(ing))
    ) tags.push("Pescatarian");
    // Keto
    if (!ingredients.some(ing => rules.keto.some(r => r.test(ing)))) tags.push("Keto");
    // Paleo
    if (!ingredients.some(ing => rules.paleo.some(r => r.test(ing)))) tags.push("Paleo");
    // Mediterranean
    const medPositives = mediterraneanPositive.filter(r => ingredients.some(ing => r.test(ing))).length;
    const medNegatives = ingredients.some(ing => mediterraneanNegative.some(r => r.test(ing)));
    if (medPositives >= 3 && !medNegatives) tags.push("Mediterranean");
    // Low Carb
    if (!ingredients.some(ing => rules.lowcarb.some(r => r.test(ing)))) tags.push("Low Carb");
    // Low Fat
    if (!ingredients.some(ing => rules.lowfat.some(r => r.test(ing)))) tags.push("Low Fat");
    // Gluten Free
    if (!ingredients.some(ing => rules.glutenfree.some(r => r.test(ing)))) tags.push("Gluten Free");

    const esBajaEnCalorias = recipe.calories && recipe.calories < 500;
    if (esBajaEnCalorias) {
      tags.push("No Restrictions");
    }

    await supabase.from('recipes').update({ tags }).eq('id', recipe.id);
    console.log(`Receta ${recipe.name} actualizada con tags: ${tags.join(', ')}`);
  }
}

autoTagRecipes()
  .then(() => {
    console.log('Etiquetado automático completado.');
    process.exit(0);
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
