import HomeClient from "@/components/home-client"
import { createServerSupabaseClient } from "@/lib/supabase/server"
import { recipeService } from "@/lib/services/recipe-service"

export default async function Home() {
  const supabase = createServerSupabaseClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()
  const isLoggedIn = !!session

  // Get featured recipes using the existing getRecipes function
  let featuredRecipes = []
  try {
    featuredRecipes = await recipeService.getRecipes()
  } catch (error) {
    console.error("Error fetching recipes:", error)
    featuredRecipes = []
  }

  return (
    <div className="container mx-auto max-w-7xl">
      <HomeClient isLoggedIn={isLoggedIn} featuredRecipes={featuredRecipes} />
    </div>
  )
}
