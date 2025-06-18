"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { recipeService, type RecipeWithDetails, type RecipeFilters } from "@/lib/services/recipe-service"

// Helper to compare filter objects to prevent unnecessary refetches
const areFiltersEqual = (a?: RecipeFilters, b?: RecipeFilters) => {
  if (!a && !b) return true
  if (!a || !b) return false
  return JSON.stringify(a) === JSON.stringify(b)
}

export function useRecipes(filters?: RecipeFilters) {
  const [recipes, setRecipes] = useState<RecipeWithDetails[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const prevFiltersRef = useRef<RecipeFilters>()

  const fetchRecipes = useCallback(async (currentFilters?: RecipeFilters) => {
    // Only fetch if filters have actually changed
    if (areFiltersEqual(prevFiltersRef.current, currentFilters)) {
      return
    }
    prevFiltersRef.current = currentFilters

    setLoading(true)
    setError(null)
    try {
      const data = await recipeService.getRecipes(currentFilters)
      setRecipes(data || [])
    } catch (err) {
      console.error("Error fetching recipes:", err)
      setError(err instanceof Error ? err.message : "Failed to fetch recipes")
      setRecipes([]) // Clear recipes on error
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchRecipes(filters)
  }, [filters, fetchRecipes])

  const toggleFavorite = async (recipeId: string, userId?: string) => {
    if (!userId) {
      console.warn("Cannot toggle favorite: no user ID provided")
      return
    }

    try {
      const isFavorited = await recipeService.toggleFavorite(recipeId, userId)
      setRecipes((prev) =>
        prev.map((recipe) => (recipe.id === recipeId ? { ...recipe, is_favorited: isFavorited } : recipe)),
      )
    } catch (err) {
      console.error("Failed to toggle favorite:", err)
      // Optionally show a toast notification
    }
  }

  return { recipes, loading, error, toggleFavorite, refetch: () => fetchRecipes(filters) }
}

export function useRecipe(slugOrId: string, userId?: string) {
  const [recipe, setRecipe] = useState<RecipeWithDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!slugOrId) {
      setLoading(false)
      return
    }

    const fetchRecipe = async () => {
      setLoading(true)
      setError(null)
      try {
        const data = await recipeService.getRecipeById(slugOrId, userId)
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
      // Refetch recipe to get updated average rating
      const updatedRecipe = await recipeService.getRecipeById(recipe.id, userId)
      setRecipe(updatedRecipe)
    } catch (err) {
      console.error("Failed to rate recipe:", err)
    }
  }

  return { recipe, loading, error, toggleFavorite, rateRecipe }
}
