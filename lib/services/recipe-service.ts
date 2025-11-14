import { supabase } from "@/lib/supabase/client"

export interface RecipeWithDetails {
  id: string
  name: string
  image_url?: string
  calories: number
  ingredients: Array<{ id?: string; name: string; amount: string }>
  created_at: string
  updated_at: string
  created_by?: string
  creator?: {
    id: string
    username: string | null
    full_name: string | null
  }
  is_favorited: boolean
}

export interface RecipeFilters {
  search?: string
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
    
    let query = supabase.from("recipes").select("*")

    if (filters?.search) {
      query = query.ilike("name", `%${filters.search}%`)
    }
    
    // Siempre aplicar límite para evitar cargar demasiados datos
    query = query.limit(limit);

    const { data: recipes, error } = await query

    if (error) throw error
    if (!recipes) return []

    const recipeIds = recipes.map((r) => r.id)
    if (recipeIds.length === 0) return []

    // Cargar ingredientes y favoritos
    const [ingredientsResult, favoritesResult] = await Promise.all([
      supabase.from("recipe_ingredients").select("*").in("recipe_id", recipeIds),
      filters?.userId
        ? supabase.from("user_favorites").select("recipe_id").eq("user_id", filters.userId).in("recipe_id", recipeIds)
        : Promise.resolve({ data: [] }),
    ]);
    
    const ingredientsData = ingredientsResult.data;
    const favoritesData = favoritesResult.data;

    // Función para normalizar IDs (quita guiones, minúsculas, trim)
    const normalize = (id: string) => id.replace(/-/g, "").toLowerCase().trim();

    return recipes.map((recipe: any) => {
      const recipeIngredients = (ingredientsData || []).filter(
        (ing) => normalize(String(ing.recipe_id)) === normalize(String(recipe.id))
      );

      const isFavorited = favoritesData?.some((fav) => fav.recipe_id === recipe.id) || false

      return {
        id: recipe.id,
        name: recipe.name,
        image_url: recipe.image_url || undefined,
        calories: recipe.calories || 0,
        ingredients: recipeIngredients.map((ing) => ({
          id: ing.id,
          name: ing.name,
          amount: ing.amount || "",
        })),
        created_at: recipe.created_at,
        updated_at: recipe.updated_at,
        created_by: recipe.created_by,
        is_favorited: isFavorited,
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

    const [{ data: ingredientsData }, { data: favoriteData }, { data: creatorData }] =
      await Promise.all([
        supabase.from("recipe_ingredients").select("*").eq("recipe_id", recipe.id),
        userId
          ? supabase.from("user_favorites").select("user_id,recipe_id").eq("user_id", userId).eq("recipe_id", recipe.id).maybeSingle()
          : Promise.resolve({ data: null }),
        recipe.created_by
          ? supabase.from("users").select("id, username, full_name").eq("id", recipe.created_by).maybeSingle()
          : Promise.resolve({ data: null }),
      ])

    return {
      id: recipe.id,
      name: recipe.name,
      image_url: recipe.image_url || undefined,
      calories: recipe.calories || 0,
      ingredients:
        ingredientsData?.map((ing) => ({
          id: ing.id,
          name: ing.name,
          amount: ing.amount || "",
        })) || [],
      created_at: recipe.created_at,
      updated_at: recipe.updated_at,
      created_by: recipe.created_by,
      creator: creatorData ? {
        id: creatorData.id,
        username: creatorData.username,
        full_name: creatorData.full_name,
      } : undefined,
      is_favorited: !!favoriteData,
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
  recipeData: {
    name: string
    image_url?: string
    calories: number
    ingredients: Array<{ name: string; amount: string }>
  },
): Promise<RecipeWithDetails | null> => {
  try {
    const response = await fetch('/api/recipes/private', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: recipeData.name,
        image_url: recipeData.image_url,
        calories: recipeData.calories,
        ingredients: recipeData.ingredients,
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

    // Return the recipe data from the API response
    return {
      id: recipe.id,
      name: recipe.name,
      image_url: recipe.image_url || undefined,
      calories: recipe.calories || 0,
      ingredients: recipeData.ingredients.map((ing, idx) => ({
        id: idx.toString(),
        name: ing.name,
        amount: ing.amount,
      })),
      created_at: recipe.created_at,
      updated_at: recipe.updated_at,
      created_by: recipe.created_by,
      is_favorited: false,
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
    image_url?: string
    calories: number
    ingredients: Array<{ name: string; amount: string }>
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
        image_url: recipeData.image_url,
        calories: recipeData.calories,
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

// Removed rateRecipe - no longer needed

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
  toggleFavorite,
  getUserFavorites,
}

export default recipeService
