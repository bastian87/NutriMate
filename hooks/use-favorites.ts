"use client"

import { useState, useEffect } from "react"

export function useFavorites() {
  const [favorites, setFavorites] = useState<string[]>([])

  // Load favorites from localStorage on mount
  useEffect(() => {
    const savedFavorites = localStorage.getItem("nutrimate-favorites")
    if (savedFavorites) {
      setFavorites(JSON.parse(savedFavorites))
    }
  }, [])

  // Save favorites to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("nutrimate-favorites", JSON.stringify(favorites))
  }, [favorites])

  const toggleFavorite = (recipeId: string) => {
    setFavorites((prev) => (prev.includes(recipeId) ? prev.filter((id) => id !== recipeId) : [...prev, recipeId]))
  }

  const isFavorite = (recipeId: string) => {
    return favorites.includes(recipeId)
  }

  const addFavorite = (recipeId: string) => {
    if (!favorites.includes(recipeId)) {
      setFavorites((prev) => [...prev, recipeId])
    }
  }

  const removeFavorite = (recipeId: string) => {
    setFavorites((prev) => prev.filter((id) => id !== recipeId))
  }

  return {
    favorites,
    toggleFavorite,
    isFavorite,
    addFavorite,
    removeFavorite,
  }
}
