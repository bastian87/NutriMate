"use client"

import { useState, useEffect, useCallback } from "react"
import { recipeService, type RecipeWithDetails } from "@/lib/services/recipe-service"
import { useAuth } from "@/hooks/use-auth" // Corrected import path
import { useToast } from "@/hooks/use-toast"

export function useUserFavorites() {
  const { user, loading: authLoading } = useAuth() // This should now work
  const { toast } = useToast()
  const [favorites, setFavorites] = useState<RecipeWithDetails[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchFavorites = useCallback(async () => {
    if (!user) {
      setFavorites([])
      setLoading(false)
      // setError("You must be logged in to see your saved recipes."); // Optional: show error or just empty state
      return
    }
    setLoading(true)
    setError(null)
    try {
      const favs = await recipeService.getUserFavorites(user.id)
      setFavorites(favs)
    } catch (e) {
      console.error("Failed to fetch favorites:", e)
      const errorMessage = e instanceof Error ? e.message : "An unknown error occurred."
      setError(errorMessage)
      toast({
        title: "Error fetching favorites",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }, [user, toast])

  useEffect(() => {
    // Wait for auth loading to complete before fetching favorites
    if (!authLoading) {
      fetchFavorites()
    }
  }, [authLoading, fetchFavorites])

  const removeFavorite = useCallback(
    async (recipeId: string) => {
      if (!user) {
        toast({ title: "Error", description: "You must be logged in.", variant: "destructive" })
        return
      }
      // Optimistic update
      const originalFavorites = [...favorites]
      setFavorites((prevFavorites) => prevFavorites.filter((fav) => fav.id !== recipeId))

      try {
        await recipeService.toggleFavorite(recipeId, user.id) // This should handle removing from DB
        toast({
          title: "Recipe Unsaved",
          description: "The recipe has been removed from your favorites.",
        })
      } catch (e) {
        console.error("Failed to remove favorite:", e)
        const errorMessage = e instanceof Error ? e.message : "Could not remove favorite."
        // Revert optimistic update on error
        setFavorites(originalFavorites)
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        })
      }
    },
    [user, toast, favorites], // Added favorites to dependency array for optimistic update rollback
  )

  return { favorites, loading: loading || authLoading, error, fetchFavorites, removeFavorite }
}
