"use client"

import { useState, useEffect, useRef } from "react"
import { recipeService, type RecipeWithDetails, type RecipeFilters } from "@/lib/services/recipe-service"

// Helper to compare filter objects
const areFiltersEqual = (a?: RecipeFilters, b?: RecipeFilters) => {
  if (!a && !b) return true
  if (!a || !b) return false

  return (
    a.search === b.search &&
    a.maxCookTime === b.maxCookTime &&
    a.userId === b.userId &&
    JSON.stringify(a.calorieRange) === JSON.stringify(b.calorieRange) &&
    JSON.stringify(a.tags) === JSON.stringify(b.tags)
  )
}

export function useRecipes(filters?: RecipeFilters) {
  const [recipes, setRecipes] = useState<RecipeWithDetails[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Use ref to track previous filters to avoid unnecessary fetches
  const prevFiltersRef = useRef<RecipeFilters | undefined>()

  // Store current filters in a ref to avoid dependency issues
  const filtersRef = useRef(filters)
  filtersRef.current = filters

  useEffect(() => {
    // Only fetch if filters have actually changed
    if (areFiltersEqual(prevFiltersRef.current, filters)) {
      return
    }

    // Update previous filters
    prevFiltersRef.current = { ...filters }

    // Define async function inside useEffect
    const fetchRecipes = async () => {
      try {
        console.log("Fetching recipes with filters:", filters)
        setLoading(true)
        setError(null)
        const data = await recipeService.getRecipes(filters)
        console.log("Recipes fetched successfully:", data.length)
        setRecipes(data || [])
      } catch (err) {
        console.error("Error fetching recipes:", err)
        setError(err instanceof Error ? err.message : "Failed to fetch recipes")
        setRecipes([])
      } finally {
        setLoading(false)
      }
    }

    // Execute the fetch
    fetchRecipes()
  }, [
    filters?.search,
    filters?.maxCookTime,
    filters?.userId,
    // Convert arrays to strings for stable comparison
    filters?.calorieRange ? `${filters.calorieRange[0]}-${filters.calorieRange[1]}` : null,
    filters?.tags ? filters.tags.join(",") : null,
  ])

  const toggleFavorite = async (recipeId: string) => {
    if (!filtersRef.current?.userId) {
      console.warn("Cannot toggle favorite: no user ID provided")
      return
    }

    try {
      const isFavorited = await recipeService.toggleFavorite(recipeId, filtersRef.current.userId)

      // Update the local state
      setRecipes((prev) =>
        prev.map((recipe) => (recipe.id === recipeId ? { ...recipe, is_favorited: isFavorited } : recipe)),
      )
    } catch (err) {
      console.error("Failed to toggle favorite:", err)
    }
  }

  const refetch = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await recipeService.getRecipes(filtersRef.current)
      setRecipes(data || [])
    } catch (err) {
      console.error("Error refetching recipes:", err)
      setError(err instanceof Error ? err.message : "Failed to fetch recipes")
    } finally {
      setLoading(false)
    }
  }

  return { recipes, loading, error, toggleFavorite, refetch }
}

export function useRecipe(slugOrId: string, userId?: string) {
  const [recipe, setRecipe] = useState<RecipeWithDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!slugOrId) return

    const fetchRecipe = async () => {
      try {
        setLoading(true)
        setError(null)
        console.log("Fetching recipe:", slugOrId)
        const data = await recipeService.getRecipeById(slugOrId, userId)
        console.log("Recipe fetched:", data?.name)
        setRecipe(data)
      } catch (err) {
        console.error("Error fetching recipe:", err)
        setError(err instanceof Error ? err.message : "Failed to fetch recipe")
      } finally {
        setLoading(false)
      }
    }

    fetchRecipe()
  }, [slugOrId, userId])

  const toggleFavorite = async () => {
    if (!recipe || !userId) return

    try {
      const isFavorited = await recipeService.toggleFavorite(recipe.id, userId)
      setRecipe((prev) => (prev ? { ...prev, is_favorited: isFavorited } : null))
    } catch (err) {
      console.error("Failed to toggle favorite:", err)
    }
  }

  const rateRecipe = async (rating: number, review?: string) => {
    if (!recipe || !userId) return

    try {
      await recipeService.rateRecipe(recipe.id, userId, rating, review)
      setRecipe((prev) => (prev ? { ...prev, user_rating: rating } : null))
    } catch (err) {
      console.error("Failed to rate recipe:", err)
    }
  }

  return { recipe, loading, error, toggleFavorite, rateRecipe }
}
