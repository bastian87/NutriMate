"use client"

import { useState, useEffect, useRef, useCallback, useMemo } from "react"
import { recipeService, type RecipeWithDetails, type RecipeFilters } from "@/lib/services/recipe-service"
import { cache, CACHE_KEYS, createFilteredCacheKey } from "@/lib/cache"

// Helper to compare filter objects to prevent unnecessary refetches
const areFiltersEqual = (a?: RecipeFilters, b?: RecipeFilters) => {
  if (!a && !b) return true
  if (!a || !b) return false
  return JSON.stringify(a) === JSON.stringify(b)
}

export function useRecipes(filters?: RecipeFilters, limit?: number) {
  const [recipes, setRecipes] = useState<RecipeWithDetails[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const prevFiltersRef = useRef<RecipeFilters>()
  const prevLimitRef = useRef<number>()
  const isInitialLoadRef = useRef(true)

  const fetchRecipes = useCallback(async (currentFilters?: RecipeFilters, currentLimit?: number) => {
    // Evitar llamadas duplicadas si los filtros no han cambiado
    if (areFiltersEqual(prevFiltersRef.current, currentFilters) && 
        prevLimitRef.current === currentLimit && 
        !isInitialLoadRef.current) {
      return
    }

    // Crear clave de caché
    const cacheKey = createFilteredCacheKey(CACHE_KEYS.RECIPES, { 
      ...(currentFilters || {}), 
      limit: currentLimit 
    })

    // Verificar caché primero
    const cachedData = cache.get<RecipeWithDetails[]>(cacheKey)
    if (cachedData && !isInitialLoadRef.current) {
      console.log("📦 Using cached recipes")
      setRecipes(cachedData)
      setLoading(false)
      return
    }

    prevFiltersRef.current = currentFilters;
    prevLimitRef.current = currentLimit;
    setLoading(true)
    setError(null)
    try {
      const data = await recipeService.getRecipes({ ...(currentFilters || {}), limit: currentLimit })
      setRecipes(data || [])
      
      // Guardar en caché
      cache.set(cacheKey, data || [], 2 * 60 * 1000) // 2 minutos
    } catch (err) {
      console.error("Error fetching recipes:", err)
      setError(err instanceof Error ? err.message : "Failed to fetch recipes")
      setRecipes([]) // Clear recipes on error
    } finally {
      setLoading(false)
      isInitialLoadRef.current = false
    }
  }, [])

  // Memoizar las dependencias para evitar re-renderizados innecesarios
  const memoizedFilters = useMemo(() => filters, [JSON.stringify(filters)])
  const memoizedLimit = useMemo(() => limit, [limit])

  useEffect(() => {
    fetchRecipes(memoizedFilters, memoizedLimit)
  }, [fetchRecipes, memoizedFilters, memoizedLimit])

  const toggleFavorite = async (recipeId: string, userId?: string) => {
    if (!userId) {
      console.warn("Cannot toggle favorite: no user ID provided")
      return
    }

    try {
      const isFavorited = await recipeService.toggleFavorite(recipeId, userId)
      setRecipes((prev) => {
        const updated = prev.map((recipe) => (recipe.id === recipeId ? { ...recipe, is_favorited: isFavorited } : recipe))
        return updated
      })
    } catch (err) {
      console.error("Failed to toggle favorite:", err)
      // Optionally show a toast notification
    }
  }

  return { recipes, loading, error, toggleFavorite, refetch: () => fetchRecipes(filters, limit) }
}

export function useRecipe(slugOrId: string, userId?: string) {
  const [recipe, setRecipe] = useState<RecipeWithDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const prevSlugOrIdRef = useRef<string>()
  const prevUserIdRef = useRef<string>()

  useEffect(() => {
    if (!slugOrId) {
      setLoading(false)
      return
    }

    // Only fetch if slugOrId or userId actually changed
    if (prevSlugOrIdRef.current === slugOrId && prevUserIdRef.current === userId) {
      return
    }

    prevSlugOrIdRef.current = slugOrId
    prevUserIdRef.current = userId

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
    if (!recipe || !userId) {
      return
    }

    try {
      const isFavorited = await recipeService.toggleFavorite(recipe.id, userId)
      setRecipe((prev) => {
        const updated = prev ? { ...prev, is_favorited: isFavorited } : null
        return updated
      })
    } catch (err) {
      console.error("Failed to toggle favorite:", err)
    }
  }

  return { recipe, loading, error, toggleFavorite }
}
