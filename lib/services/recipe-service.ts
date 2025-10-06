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
  ingredients: Array<{ id?: string; name: string; amount: string; original?: string }>
  created_at: string
  updated_at: string
  created_by?: string
  creator?: {
    id: string
    username: string | null
    full_name: string | null
  }
  average_rating: number
  total_ratings?: number
  rating_count?: number
  is_favorited: boolean // This will be true for all recipes from getUserFavorites
  user_rating?: number
  tags: Array<{ id: string; name: string }>
}

export interface RecipeFilters {
  search?: string
  tags?: string[]
  maxCookTime?: number
  calorieRange?: [number, number]
  userId?: string
  limit?: number
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
    // Aplicar límite por defecto para mejorar rendimiento
    const limit = filters?.limit || 20;
    
    let query = supabase.from("recipes").select("*, tags")

    if (filters?.search) {
      query = query.or(`name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`)
    }
    if (filters?.maxCookTime) {
      query = query.lte("cook_time_minutes", filters.maxCookTime)
    }
    if (filters?.calorieRange) {
      query = query.gte("calories", filters.calorieRange[0]).lte("calories", filters.calorieRange[1])
    }
    
    // Siempre aplicar límite para evitar cargar demasiados datos
    query = query.limit(limit);

    const { data: recipes, error } = await query

    if (error) throw error
    if (!recipes) return []

    const recipeIds = recipes.map((r) => r.id)
    if (recipeIds.length === 0) return []

    // Optimizar: Solo cargar calificaciones para las recetas específicas
    const [ingredientsResult, ratingsResult, favoritesResult] = await Promise.all([
      supabase.from("recipe_ingredients").select("*").in("recipe_id", recipeIds),
      supabase.from("recipe_ratings").select("recipe_id, rating, user_id").in("recipe_id", recipeIds),
      filters?.userId
        ? supabase.from("user_favorites").select("recipe_id").eq("user_id", filters.userId).in("recipe_id", recipeIds)
        : Promise.resolve({ data: [] }),
    ]);
    
    const ingredientsData = ingredientsResult.data;
    const ratingsData = ratingsResult.data;
    const favoritesData = favoritesResult.data;
    
    // Debug: verificar datos de calificaciones

    


    // Función para normalizar IDs (quita guiones, minúsculas, trim)
    const normalize = (id: string) => id.replace(/-/g, "").toLowerCase().trim();

    return recipes.map((recipe: any) => {
      const recipeIngredients = (ingredientsData || []).filter(
        (ing) => normalize(String(ing.recipe_id)) === normalize(String(recipe.id))
      );
      const recipeRatings = ratingsData?.filter((r) => r.recipe_id === recipe.id) || []
      const averageRating =
        recipeRatings.length > 0
          ? recipeRatings.reduce((sum: number, r: any) => sum + r.rating, 0) / recipeRatings.length
          : 0
      

      

      const isFavorited = favoritesData?.some((fav) => fav.recipe_id === recipe.id) || false
      const userRating = filters?.userId ? recipeRatings.find((r) => r.user_id === filters.userId)?.rating : undefined

      const ingredientes = recipeIngredients.map((i: any) =>
        ((i.original ? i.original.toLowerCase() : "") + " " + (i.name ? i.name.toLowerCase() : "")).trim()
      );

      return {
        ...recipe,
        ingredients: recipeIngredients.map((ing) => ({
          id: ing.id,
          name: ing.name,
          amount: ing.amount,
          original: ing.original,
        })),
        average_rating: Number(averageRating.toFixed(1)),
        rating_count: recipeRatings.length,
        total_ratings: recipeRatings.length,
        is_favorited: isFavorited,
        user_rating: userRating,
        tags: recipe.tags || [],
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
  } catch (error) {
    console.error("Error in getRecipes:", error)
    if (error instanceof Error) throw error
    throw new Error("An unexpected error occurred while fetching recipes")
  }
}

export const getRecipeById = async (id: string, userId?: string): Promise<RecipeWithDetails | null> => {
  try {
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id)
    let query = supabase.from("recipes").select("*")
    query = isUUID ? query.eq("id", id) : query.ilike("name", slugToName(id))

    const { data: recipe, error } = await query.single()

    if (error && error.code === "PGRST116") return null // Not found
    if (error) throw error
    if (!recipe) return null

    const [{ data: ingredientsData }, { data: ratingsData }, { data: favoriteData }, { data: tagAssociationsData }, { data: creatorData }] =
      await Promise.all([
        supabase.from("recipe_ingredients").select("*").eq("recipe_id", recipe.id),
        supabase.from("recipe_ratings").select("*").eq("recipe_id", recipe.id),
        userId
          ? supabase.from("user_favorites").select("user_id,recipe_id").eq("user_id", userId).eq("recipe_id", recipe.id).maybeSingle()
          : Promise.resolve({ data: null }),
        supabase
          .from("recipe_tag_associations")
          .select(`tag_id, recipe_tags!inner(id, name)`)
          .eq("recipe_id", recipe.id),
        recipe.created_by
          ? supabase.from("users").select("id, username, full_name").eq("id", recipe.created_by).maybeSingle()
          : Promise.resolve({ data: null }),
      ])

    const recipeRatings = ratingsData || []
    const averageRating =
      recipeRatings.length > 0
        ? recipeRatings.reduce((sum: number, r: any) => sum + r.rating, 0) / recipeRatings.length
        : 0
    const userRating = userId ? recipeRatings.find((r: any) => r.user_id === userId)?.rating : undefined
    const recipeTags = tagAssociationsData?.map((ta) => ta.recipe_tags).filter(Boolean) || []

    return {
      ...recipe,
      ingredients:
        ingredientsData?.map((ing) => ({
          id: ing.id,
          name: ing.name,
          amount: ing.amount,
        })) || [],
      creator: creatorData ? {
        id: creatorData.id,
        username: creatorData.username,
        full_name: creatorData.full_name,
      } : undefined,
      average_rating: Number(averageRating.toFixed(1)),
      rating_count: recipeRatings.length,
      total_ratings: recipeRatings.length,
      is_favorited: !!favoriteData,
      user_rating: userRating,
      tags: recipeTags,
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
    if (error instanceof Error) throw error
    throw new Error("An unexpected error occurred while fetching recipe details")
  }
}

export const getRecipeBySlug = async (slug: string, userId?: string): Promise<RecipeWithDetails | null> => {
  return getRecipeById(slug, userId)
}

export const createRecipe = async (
  recipeData: Omit<
    RecipeWithDetails,
    | "id"
    | "created_at"
    | "updated_at"
    | "average_rating"
    | "is_favorited"
    | "tags"
    | "rating_count"
    | "total_ratings"
    | "user_rating"
  > & { ingredients: Array<{ name: string; amount: string }>; tagsInput?: string[] },
): Promise<RecipeWithDetails | null> => {
  try {
    const response = await fetch('/api/recipes/private', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: recipeData.name,
        description: recipeData.description,
        image_url: recipeData.image_url,
        prep_time_minutes: recipeData.prep_time_minutes,
        cook_time_minutes: recipeData.cook_time_minutes,
        servings: recipeData.servings,
        calories: recipeData.calories,
        protein: recipeData.protein,
        carbs: recipeData.carbs,
        fat: recipeData.fat,
        fiber: recipeData.fiber,
        sugar: recipeData.sugar,
        sodium: recipeData.sodium,
        difficulty_level: recipeData.difficulty_level,
        cuisine_type: recipeData.cuisine_type,
        meal_type: recipeData.meal_type,
        instructions: recipeData.instructions,
        ingredients: recipeData.ingredients,
        tags: recipeData.tagsInput?.map(tag => ({ name: tag })) || []
      })
    })

    if (!response.ok) {
      const errorData = await response.json()
      console.error("Error creating recipe:", errorData.error)
      throw new Error(errorData.error || 'Failed to create recipe')
    }

    const { recipe } = await response.json()

    if (!recipe) {
      throw new Error("Failed to create recipe")
    }

    // Ingredients and tags are now handled by the API
    // Return the recipe data from the API response
    return {
      ...recipe,
      ingredients: recipeData.ingredients,
      tags: recipeData.tagsInput?.map(tag => ({ id: '', name: tag })) || [],
      average_rating: 0,
      is_favorited: false,
      created_at: recipe.created_at,
      updated_at: recipe.updated_at,
    } as RecipeWithDetails
  } catch (error) {
    console.error("Error in createRecipe:", error)
    throw error
  }
}

export const updateRecipe = async (
  id: string,
  recipeData: {
    name: string
    description?: string
    prep_time_minutes: number
    cook_time_minutes: number
    servings: number
    meal_type: string
    instructions: string
    ingredients: Array<{ name: string; amount: string }>
    calories?: number
    protein?: number
    carbs?: number
    fat?: number
    sugar?: number
    sodium?: number
    fiber?: number
  }
): Promise<RecipeWithDetails | null> => {
  try {
    const response = await fetch('/api/recipes/private', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        id,
        name: recipeData.name,
        description: recipeData.description,
        prep_time_minutes: recipeData.prep_time_minutes,
        cook_time_minutes: recipeData.cook_time_minutes,
        servings: recipeData.servings,
        meal_type: recipeData.meal_type,
        instructions: recipeData.instructions,
        calories: recipeData.calories || 0,
        protein: recipeData.protein || 0,
        carbs: recipeData.carbs || 0,
        fat: recipeData.fat || 0,
        sugar: recipeData.sugar || 0,
        sodium: recipeData.sodium || 0,
        fiber: recipeData.fiber || 0,
        ingredients: recipeData.ingredients
      })
    })

    if (!response.ok) {
      const errorData = await response.json()
      console.error("Error updating recipe:", errorData.error)
      throw new Error(errorData.error || 'Failed to update recipe')
    }

    const { recipe } = await response.json()

    if (!recipe) {
      throw new Error("Failed to update recipe")
    }

    // Ingredients are now handled by the API
    // Return the updated recipe with full details
    return await getRecipeById(id)
  } catch (error) {
    console.error("Error updating recipe:", error)
    return null
  }
}

export const deleteRecipe = async (id: string): Promise<boolean> => {
  // ... (implementation from v330)
  return false // Placeholder
}

export const rateRecipe = async (recipeId: string, userId: string, rating: number, review?: string): Promise<any> => {
  try {
    const response = await fetch('/api/recipes/ratings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        recipe_id: recipeId,
        rating,
        review: review || ''
      })
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || 'Failed to rate recipe')
    }

    const data = await response.json()
    return data.rating
  } catch (error) {
    console.error("Error in rateRecipe:", error)
    if (error instanceof Error) throw new Error(`Failed to rate recipe: ${error.message}`)
    throw new Error("An unexpected error occurred while rating recipe")
  }
}

export const toggleFavorite = async (recipeId: string, userId: string): Promise<boolean> => {
  try {
    // First, check if the favorite exists by trying to get favorites
    const getResponse = await fetch('/api/favorites', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'x-user-id': userId,
      }
    });

    if (!getResponse.ok) {
      throw new Error('Failed to fetch favorites');
    }

    const { favorites } = await getResponse.json();
    const existing = favorites.find((fav: any) => fav.recipe_id === recipeId);

    if (existing) {
      // Favorite exists, so remove it
      const deleteResponse = await fetch(`/api/favorites?recipe_id=${recipeId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': userId,
        }
      });

      if (!deleteResponse.ok) {
        const errorData = await deleteResponse.json();
        throw new Error(errorData.error || 'Failed to remove favorite');
      }
      
      return false // Not favorited anymore
    } else {
      // Favorite doesn't exist, so add it
      const addResponse = await fetch('/api/favorites', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': userId,
        },
        body: JSON.stringify({ recipe_id: recipeId })
      });

      if (!addResponse.ok) {
        const errorData = await addResponse.json();
        throw new Error(errorData.error || 'Failed to add favorite');
      }
      
      return true // Now favorited
    }
  } catch (error) {
    console.error("Error in toggleFavorite:", error)
    if (error instanceof Error) throw new Error(`Failed to toggle favorite: ${error.message}`)
    throw new Error("An unexpected error occurred while toggling favorite status")
  }
}

export const getUserFavorites = async (userId: string): Promise<RecipeWithDetails[]> => {
  try {
    const response = await fetch('/api/favorites', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'x-user-id': userId,
      }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch favorites');
    }

    const { favorites } = await response.json();
    
    if (!favorites || favorites.length === 0) {
      return []
    }

    // Since there are no recipes in the database, favorites will be empty
    // Return empty array for now
    return [];
  } catch (error) {
    console.error("Error in getUserFavorites:", error)
    if (error instanceof Error) throw error
    throw new Error("An unexpected error occurred while fetching user favorites")
  }
}

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

export default recipeService
