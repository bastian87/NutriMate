"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { recipeService, type RecipeWithDetails } from "@/lib/services/recipe-service"
import { useAuth } from "@/hooks/use-auth"
import { useToast } from "@/hooks/use-toast"

export function useUserFavorites() {
  const { user, loading: authLoading } = useAuth()
  const { toast } = useToast()
  const [favorites, setFavorites] = useState<RecipeWithDetails[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const prevUserIdRef = useRef<string>()

  const fetchFavorites = useCallback(async () => {
    if (!user) {
      setFavorites([])
      setLoading(false)
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
    if (!authLoading) {
      // Only fetch if userId actually changed
      if (prevUserIdRef.current !== user?.id) {
        prevUserIdRef.current = user?.id
        fetchFavorites()
      }
    }
  }, [authLoading, user?.id, fetchFavorites])

  const removeFavorite = useCallback(
    async (recipeId: string) => {
      if (!user) {
        toast({ title: "Error", description: "You must be logged in.", variant: "destructive" })
        return
      }

      const originalFavorites = [...favorites]
      setFavorites((prevFavorites) => prevFavorites.filter((fav) => fav.id !== recipeId))

      try {
        await recipeService.toggleFavorite(recipeId, user.id)
        toast({
          title: "Recipe Unsaved",
          description: "The recipe has been removed from your favorites.",
        })
      } catch (e) {
        console.error("Failed to remove favorite:", e)
        const errorMessage = e instanceof Error ? e.message : "Could not remove favorite."
        setFavorites(originalFavorites)
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        })
      }
    },
    [user, toast, favorites],
  )

  return { favorites, loading: loading || authLoading, error, fetchFavorites, removeFavorite }
}
