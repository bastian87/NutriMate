import LandingClient from "@/components/landing-client"
import { createServerSupabaseClient } from "@/lib/supabase/server"
import { recipeService, type RecipeWithDetails } from "@/lib/services/recipe-service"

interface Recipe {
  id: string
  name: string
  description: string
  calories: number
  protein: number
  carbs: number
  fat: number
  time: number
  difficulty: string
  image: string
  rating: number
  reviews: number
}

export default async function LandingPage() {
  const supabase = createServerSupabaseClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()
  const isLoggedIn = !!session

  // Get featured recipes using the existing getRecipes function
  let featuredRecipes: RecipeWithDetails[] = []
  try {
    featuredRecipes = await recipeService.getRecipes()
  } catch (error) {
    console.error("Error fetching recipes:", error)
    featuredRecipes = []
  }

  // Transform RecipeWithDetails to Recipe format
  const transformedRecipes: Recipe[] = featuredRecipes.map(recipe => ({
    id: recipe.id,
    name: recipe.name,
    description: recipe.description || "",
    calories: recipe.calories,
    protein: recipe.protein,
    carbs: recipe.carbs,
    fat: recipe.fat,
    time: recipe.prep_time_minutes + recipe.cook_time_minutes,
    difficulty: recipe.difficulty_level || "medium",
    image: recipe.image_url || "/placeholder-recipe.jpg",
    rating: recipe.average_rating,
    reviews: recipe.total_ratings || 0
  }))

  return <LandingClient isLoggedIn={isLoggedIn} featuredRecipes={transformedRecipes} />
}
