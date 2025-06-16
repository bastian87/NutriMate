import { supabase } from "@/lib/supabase/client"

export interface RecipeWithDetails {
  id: string
  name: string
  description?: string
  image_url?: string
  prep_time_minutes: number
  cook_time_minutes: number
  servings: number
  calories: number
  protein: number
  carbs: number
  fat: number
  fiber?: number
  sugar?: number
  sodium?: number
  difficulty_level?: string
  cuisine_type?: string
  meal_type?: string
  instructions: string
  ingredients: Array<{ id?: string; name: string; quantity: string; unit?: string }>
  created_at: string
  updated_at: string
  average_rating: number
  total_ratings?: number
  rating_count?: number
  is_favorited: boolean
  user_rating?: number
  tags: Array<{ id: string; name: string }>
}

export interface RecipeFilters {
  search?: string
  tags?: string[]
  maxCookTime?: number
  calorieRange?: [number, number]
  userId?: string
}

// Helper function to create a URL-friendly slug from recipe name
export const createSlug = (name: string): string => {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "") // Remove special characters
    .replace(/\s+/g, "-") // Replace spaces with hyphens
    .replace(/-+/g, "-") // Replace multiple hyphens with single
    .trim()
}

// Helper function to convert slug back to searchable name
export const slugToName = (slug: string): string => {
  return decodeURIComponent(slug)
    .replace(/-/g, " ")
    .replace(/\b\w/g, (l) => l.toUpperCase()) // Title case
}

// Individual functions
export const getRecipes = async (filters?: RecipeFilters): Promise<RecipeWithDetails[]> => {
  try {
    console.log("Starting recipe fetch with filters:", filters)

    // Check if Supabase client is properly configured
    if (!supabase) {
      console.error("Supabase client is not initialized")
      throw new Error("Database connection not available")
    }

    // Test basic connection first
    console.log("Testing Supabase connection...")
    const { data: testData, error: testError } = await supabase
      .from("recipes")
      .select("count", { count: "exact", head: true })

    if (testError) {
      console.error("Supabase connection test failed:", testError)
      throw new Error(`Database connection failed: ${testError.message}`)
    }

    console.log("Supabase connection successful, recipe count:", testData)

    // First, get basic recipes
    let query = supabase.from("recipes").select("*")

    // Apply search filter
    if (filters?.search) {
      query = query.or(`name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`)
    }

    // Apply cook time filter
    if (filters?.maxCookTime) {
      query = query.lte("cook_time_minutes", filters.maxCookTime)
    }

    // Apply calorie range filter
    if (filters?.calorieRange) {
      query = query.gte("calories", filters.calorieRange[0]).lte("calories", filters.calorieRange[1])
    }

    console.log("Executing recipe query...")
    const { data: recipes, error } = await query

    if (error) {
      console.error("Error fetching recipes:", error)
      throw new Error(`Failed to fetch recipes: ${error.message}`)
    }

    if (!recipes || recipes.length === 0) {
      console.log("No recipes found in database")
      return []
    }

    console.log(`Found ${recipes.length} recipes`)

    // Get recipe IDs for additional queries
    const recipeIds = recipes.map((r) => r.id)

    // Get ingredients for all recipes
    let ingredients: any[] = []
    try {
      const { data: ingredientsData, error: ingredientsError } = await supabase
        .from("recipe_ingredients")
        .select("*")
        .in("recipe_id", recipeIds)

      if (ingredientsError) {
        console.error("Error fetching ingredients:", ingredientsError)
      } else {
        ingredients = ingredientsData || []
        console.log("Ingredients fetched:", ingredients.length)
      }
    } catch (e) {
      console.log("Ingredients table may not exist, skipping:", e)
    }

    // Get ratings for all recipes
    let ratings: any[] = []
    try {
      const { data: ratingsData, error: ratingsError } = await supabase
        .from("recipe_ratings")
        .select("recipe_id, rating, user_id")
        .in("recipe_id", recipeIds)

      if (ratingsError) {
        console.error("Error fetching ratings:", ratingsError)
      } else {
        ratings = ratingsData || []
        console.log("Ratings fetched:", ratings.length)
      }
    } catch (e) {
      console.log("Ratings table may not exist, skipping:", e)
    }

    // Get favorites for current user if provided
    let favorites: any[] = []
    if (filters?.userId) {
      try {
        const { data: favData, error: favError } = await supabase
          .from("user_favorites")
          .select("recipe_id")
          .eq("user_id", filters.userId)
          .in("recipe_id", recipeIds)

        if (favError) {
          console.error("Error fetching favorites:", favError)
        } else {
          favorites = favData || []
          console.log("Favorites fetched:", favorites.length)
        }
      } catch (e) {
        console.log("Favorites table may not exist, skipping:", e)
      }
    }

    // Get tags for all recipes using the proper table structure
    let tagAssociations: any[] = []
    try {
      const { data: tagData, error: tagError } = await supabase
        .from("recipe_tag_associations")
        .select(`
          recipe_id,
          tag_id,
          recipe_tags!inner(id, name)
        `)
        .in("recipe_id", recipeIds)

      if (tagError) {
        console.error("Error fetching tags:", tagError)
      } else {
        tagAssociations = tagData || []
        console.log("Tags fetched:", tagAssociations.length)
      }
    } catch (e) {
      console.log("Tags table error:", e)
    }

    // Transform the data to match our interface
    const recipesWithDetails: RecipeWithDetails[] = recipes.map((recipe: any) => {
      // Get ingredients for this recipe
      const recipeIngredients = ingredients?.filter((ing) => ing.recipe_id === recipe.id) || []

      // Calculate average rating
      const recipeRatings = ratings?.filter((r) => r.recipe_id === recipe.id) || []
      const averageRating =
        recipeRatings.length > 0
          ? recipeRatings.reduce((sum: number, r: any) => sum + r.rating, 0) / recipeRatings.length
          : 0

      // Check if favorited by current user
      const isFavorited = favorites.some((fav) => fav.recipe_id === recipe.id)

      // Get user's rating
      const userRating = filters?.userId ? recipeRatings.find((r) => r.user_id === filters.userId)?.rating : undefined

      // Get tags for this recipe
      const recipeTags =
        tagAssociations
          ?.filter((ta) => ta.recipe_id === recipe.id)
          .map((ta) => ta.recipe_tags)
          .filter(Boolean) || []

      return {
        ...recipe,
        ingredients: recipeIngredients.map((ing) => ({
          id: ing.id,
          name: ing.name,
          quantity: ing.quantity,
          unit: ing.unit,
        })),
        average_rating: Number(averageRating.toFixed(1)),
        rating_count: recipeRatings.length,
        total_ratings: recipeRatings.length,
        is_favorited: isFavorited,
        user_rating: userRating,
        tags: recipeTags,
        // Ensure required fields have defaults
        prep_time_minutes: recipe.prep_time_minutes || 0,
        cook_time_minutes: recipe.cook_time_minutes || 0,
        servings: recipe.servings || 1,
        calories: recipe.calories || 0,
        protein: recipe.protein || 0,
        carbs: recipe.carbs || 0,
        fat: recipe.fat || 0,
        difficulty_level: recipe.difficulty_level || "easy",
        instructions: recipe.instructions || "",
      }
    })

    console.log("Transformed recipes:", recipesWithDetails.length)

    // Apply tag filters (client-side)
    if (filters?.tags && filters.tags.length > 0) {
      return recipesWithDetails.filter((recipe) => recipe.tags.some((tag) => filters.tags!.includes(tag.name)))
    }

    return recipesWithDetails
  } catch (error) {
    console.error("Error in getRecipes:", error)

    // Provide more specific error messages
    if (error instanceof TypeError && error.message.includes("fetch")) {
      throw new Error("Unable to connect to database. Please check your internet connection and try again.")
    }

    if (error instanceof Error) {
      throw error
    }

    throw new Error("An unexpected error occurred while fetching recipes")
  }
}

export const getRecipeById = async (id: string, userId?: string): Promise<RecipeWithDetails | null> => {
  try {
    console.log("Fetching recipe by ID:", id)

    // Check if the id is a UUID or a slug
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id)

    let query = supabase.from("recipes").select("*")

    if (isUUID) {
      // If it's a UUID, search by id
      query = query.eq("id", id)
    } else {
      // If it's a slug, search by name (convert slug back to name)
      const searchName = slugToName(id)
      query = query.ilike("name", searchName)
    }

    const { data: recipe, error } = await query.single()

    if (error) {
      console.error("Error fetching recipe by id/slug:", error)
      if (error.code === "PGRST116") {
        return null // Recipe not found
      }
      throw new Error(`Failed to fetch recipe: ${error.message}`)
    }

    if (!recipe) {
      return null
    }

    // Get ingredients
    const { data: ingredients } = await supabase.from("recipe_ingredients").select("*").eq("recipe_id", recipe.id)

    // Get ratings
    let ratings: any[] = []
    try {
      const { data: ratingsData } = await supabase.from("recipe_ratings").select("*").eq("recipe_id", recipe.id)
      ratings = ratingsData || []
    } catch (e) {
      console.log("Ratings table may not exist, skipping")
    }

    // Check if favorited by current user
    let isFavorited = false
    if (userId) {
      try {
        const { data: favorite } = await supabase
          .from("user_favorites")
          .select("id")
          .eq("user_id", userId)
          .eq("recipe_id", recipe.id)
          .single()
        isFavorited = !!favorite
      } catch (e) {
        console.log("Favorites table may not exist, skipping")
      }
    }

    // Get tags using proper table structure
    let tags: any[] = []
    try {
      const { data: tagAssociations } = await supabase
        .from("recipe_tag_associations")
        .select(`
          tag_id,
          recipe_tags!inner(id, name)
        `)
        .eq("recipe_id", recipe.id)
      tags = tagAssociations?.map((ta) => ta.recipe_tags).filter(Boolean) || []
    } catch (e) {
      console.log("Tags table error:", e)
    }

    // Calculate average rating
    const averageRating =
      ratings && ratings.length > 0 ? ratings.reduce((sum: number, r: any) => sum + r.rating, 0) / ratings.length : 0

    // Get user's rating
    const userRating = userId && ratings ? ratings.find((r: any) => r.user_id === userId)?.rating : undefined

    return {
      ...recipe,
      ingredients:
        ingredients?.map((ing) => ({
          id: ing.id,
          name: ing.name,
          quantity: ing.quantity,
          unit: ing.unit,
        })) || [],
      average_rating: Number(averageRating.toFixed(1)),
      rating_count: ratings?.length || 0,
      total_ratings: ratings?.length || 0,
      is_favorited: isFavorited,
      user_rating: userRating,
      tags: tags,
      // Ensure required fields have defaults
      prep_time_minutes: recipe.prep_time_minutes || 0,
      cook_time_minutes: recipe.cook_time_minutes || 0,
      servings: recipe.servings || 1,
      calories: recipe.calories || 0,
      protein: recipe.protein || 0,
      carbs: recipe.carbs || 0,
      fat: recipe.fat || 0,
      difficulty_level: recipe.difficulty_level || "easy",
      instructions: recipe.instructions || "",
    }
  } catch (error) {
    console.error("Error in getRecipeById:", error)

    if (error instanceof TypeError && error.message.includes("fetch")) {
      throw new Error("Unable to connect to database. Please check your internet connection and try again.")
    }

    throw error
  }
}

export const getRecipeBySlug = async (slug: string, userId?: string): Promise<RecipeWithDetails | null> => {
  return getRecipeById(slug, userId)
}

export const createRecipe = async (recipeData: {
  name: string
  description?: string
  instructions: string
  prep_time_minutes: number
  cook_time_minutes: number
  servings: number
  calories: number
  protein: number
  carbs: number
  fat: number
  image_url?: string
  ingredients: Array<{ name: string; quantity: string; unit?: string }>
}): Promise<RecipeWithDetails | null> => {
  try {
    console.log("Creating recipe:", recipeData)

    // Create the recipe
    const { data: recipe, error: recipeError } = await supabase
      .from("recipes")
      .insert([
        {
          name: recipeData.name,
          description: recipeData.description,
          instructions: recipeData.instructions,
          prep_time_minutes: recipeData.prep_time_minutes,
          cook_time_minutes: recipeData.cook_time_minutes,
          servings: recipeData.servings,
          calories: recipeData.calories,
          protein: recipeData.protein,
          carbs: recipeData.carbs,
          fat: recipeData.fat,
          image_url: recipeData.image_url,
          difficulty_level: "easy",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ])
      .select()
      .single()

    if (recipeError) {
      console.error("Error creating recipe:", recipeError)
      throw new Error(`Failed to create recipe: ${recipeError.message}`)
    }

    console.log("Recipe created:", recipe)

    // Add ingredients
    if (recipeData.ingredients && recipeData.ingredients.length > 0) {
      const ingredientsToInsert = recipeData.ingredients.map((ing) => ({
        recipe_id: recipe.id,
        name: ing.name,
        quantity: ing.quantity,
        unit: ing.unit || "",
      }))

      const { error: ingredientsError } = await supabase.from("recipe_ingredients").insert(ingredientsToInsert)

      if (ingredientsError) {
        console.error("Error adding ingredients:", ingredientsError)
        // Don't throw here, recipe is already created
      }
    }

    // Return the created recipe with ingredients
    return getRecipeById(recipe.id)
  } catch (error) {
    console.error("Error in createRecipe:", error)
    throw error
  }
}

export const updateRecipe = async (
  id: string,
  recipe: Partial<RecipeWithDetails>,
): Promise<RecipeWithDetails | null> => {
  try {
    const { data, error } = await supabase.from("recipes").update(recipe).eq("id", id).select().single()

    if (error) {
      console.error("Error updating recipe:", error)
      throw new Error(`Failed to update recipe: ${error.message}`)
    }

    return data
  } catch (error) {
    console.error("Error in updateRecipe:", error)
    throw error
  }
}

export const deleteRecipe = async (id: string): Promise<boolean> => {
  try {
    const { error } = await supabase.from("recipes").delete().eq("id", id)

    if (error) {
      console.error("Error deleting recipe:", error)
      throw new Error(`Failed to delete recipe: ${error.message}`)
    }

    return true
  } catch (error) {
    console.error("Error in deleteRecipe:", error)
    return false
  }
}

export const rateRecipe = async (recipeId: string, userId: string, rating: number, review?: string): Promise<any> => {
  try {
    const { data, error } = await supabase
      .from("recipe_ratings")
      .upsert({
        user_id: userId,
        recipe_id: recipeId,
        rating,
        review,
      })
      .select()

    if (error) {
      console.error("Error rating recipe:", error)
      throw new Error(`Failed to rate recipe: ${error.message}`)
    }

    return data
  } catch (error) {
    console.error("Error in rateRecipe:", error)
    throw error
  }
}

export const toggleFavorite = async (recipeId: string, userId: string): Promise<boolean> => {
  try {
    // Check if already favorited
    const { data: existing } = await supabase
      .from("user_favorites")
      .select("id")
      .eq("user_id", userId)
      .eq("recipe_id", recipeId)
      .single()

    if (existing) {
      // Remove favorite
      const { error } = await supabase.from("user_favorites").delete().eq("user_id", userId).eq("recipe_id", recipeId)

      if (error) {
        console.error("Error removing favorite:", error)
        throw new Error(`Failed to remove favorite: ${error.message}`)
      }
      return false // Not favorited anymore
    } else {
      // Add favorite
      const { error } = await supabase.from("user_favorites").insert({
        user_id: userId,
        recipe_id: recipeId,
      })

      if (error) {
        console.error("Error adding favorite:", error)
        throw new Error(`Failed to add favorite: ${error.message}`)
      }
      return true // Now favorited
    }
  } catch (error) {
    console.error("Error in toggleFavorite:", error)
    return false
  }
}

export const getUserFavorites = async (userId: string): Promise<RecipeWithDetails[]> => {
  try {
    const { data, error } = await supabase
      .from("user_favorites")
      .select(`
        recipe_id,
        recipes (*)
      `)
      .eq("user_id", userId)

    if (error) {
      console.error("Error fetching user favorites:", error)
      throw new Error(`Failed to fetch favorites: ${error.message}`)
    }

    return data?.map((item: any) => item.recipes) || []
  } catch (error) {
    console.error("Error in getUserFavorites:", error)
    throw error
  }
}

// Export as a service object for compatibility
export const recipeService = {
  getRecipes,
  getRecipeById,
  getRecipeBySlug,
  createRecipe,
  updateRecipe,
  deleteRecipe,
  rateRecipe,
  toggleFavorite,
  getUserFavorites,
}

// Also export as default
export default recipeService
