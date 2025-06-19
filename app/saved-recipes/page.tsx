"use client"

import { useState, useMemo } from "react"
import { useUserFavorites } from "@/hooks/use-user-favorites"
import { Button } from "@/components/ui/button"
import { Clock, Bookmark, AlertCircle, Loader2 } from "lucide-react"
import Link from "next/link"
import { RecipeCardSkeleton } from "@/components/recipe-card-skeleton"
import type { RecipeWithDetails } from "@/lib/services/recipe-service"
import { useLanguage } from "@/lib/i18n/context"
import type { TFunction } from "@/lib/i18n/context"

// Categories for filtering
const categories: { id: string; label: (t: TFunction) => string; icon: string }[] = [
  { id: "all", label: t => t("savedRecipes.allRecipes"), icon: "🍽️" },
  { id: "breakfast", label: t => t("savedRecipes.breakfasts"), icon: "🥞" },
  { id: "lunch", label: t => t("savedRecipes.lunches"), icon: "🥗" },
  { id: "dinner", label: t => t("savedRecipes.dinners"), icon: "🍽️" },
  { id: "dessert", label: t => t("savedRecipes.desserts"), icon: "🧁" },
  { id: "snack", label: t => t("savedRecipes.snacks"), icon: "🥨" },
  { id: "side dish", label: t => t("savedRecipes.sides"), icon: "🥖" },
  { id: "soup", label: t => t("savedRecipes.soups"), icon: "🍲" },
]

export default function SavedRecipesPage() {
  const { favorites, loading, error, removeFavorite } = useUserFavorites()
  const [selectedCategory, setSelectedCategory] = useState("all")
  const { t } = useLanguage()

  const filteredRecipes = useMemo(() => {
    if (selectedCategory === "all") {
      return favorites
    }
    return favorites.filter((recipe) => recipe.meal_type?.toLowerCase() === selectedCategory.toLowerCase())
  }, [favorites, selectedCategory])

  const renderContent = () => {
    if (loading) {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <RecipeCardSkeleton key={i} />
          ))}
        </div>
      )
    }

    if (error) {
      return (
        <div className="flex flex-col items-center justify-center text-center py-16 bg-gray-50 rounded-lg">
          <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
          <h2 className="text-xl font-semibold text-gray-800">{t("savedRecipes.anErrorOccurred")}</h2>
          <p className="text-gray-600 mt-2">{error}</p>
          <Button onClick={() => window.location.reload()} className="mt-4">
            {t("savedRecipes.tryAgain")}
          </Button>
        </div>
      )
    }

    if (favorites.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center text-center py-16 bg-gray-50 rounded-lg">
          <Bookmark className="h-12 w-12 text-gray-400 mb-4" />
          <h2 className="text-xl font-semibold text-gray-800">{t("savedRecipes.noSavedRecipesYet")}</h2>
          <p className="text-gray-600 mt-2">
            {t("savedRecipes.noSavedRecipesDesc")}
          </p>
          <Button asChild className="mt-6">
            <Link href="/recipes">{t("savedRecipes.exploreRecipes")}</Link>
          </Button>
        </div>
      )
    }

    if (filteredRecipes.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center text-center py-16 bg-gray-50 rounded-lg">
          <h2 className="text-xl font-semibold text-gray-800">{t("savedRecipes.noRecipesFound")}</h2>
          <p className="text-gray-600 mt-2">{t("savedRecipes.noSavedRecipesMatch")}</p>
        </div>
      )
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {filteredRecipes.map((recipe: RecipeWithDetails) => (
          <div
            key={recipe.id}
            className="bg-white rounded-lg shadow-sm overflow-hidden group transition-shadow hover:shadow-md"
          >
            <div className="relative">
              <Link href={`/recipes/${recipe.id}`} className="block">
                <img
                  src={
                    recipe.image_url || `/placeholder.svg?height=200&width=300&query=${encodeURIComponent(recipe.name)}`
                  }
                  alt={recipe.name}
                  className="w-full h-48 object-cover"
                />
              </Link>
              <div className="absolute top-3 left-3 bg-white px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {recipe.cook_time_minutes} mins
              </div>
              <Button
                size="icon"
                variant="ghost"
                className="absolute top-3 right-3 bg-white/80 hover:bg-white"
                onClick={() => removeFavorite(recipe.id)}
                aria-label="Remove from saved recipes"
              >
                <Bookmark className="h-4 w-4 fill-orange-600 text-orange-600" />
              </Button>
            </div>

            <div className="p-4">
              <Link href={`/recipes/${recipe.id}`}>
                <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2 hover:text-orange-600 transition-colors">
                  {recipe.name}
                </h3>
              </Link>
              <p className="text-sm text-gray-600 capitalize">{recipe.meal_type || "Recipe"}</p>
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="p-6 bg-cream-50 min-h-screen">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t("savedRecipes.savedRecipes")}</h1>
          <p className="text-gray-600">
            {loading ? <Loader2 className="h-4 w-4 animate-spin inline-block" /> : t("savedRecipes.recipes", { count: filteredRecipes.length })}
          </p>
        </div>
      </div>

      {/* Category Filters */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {categories.map((category) => (
          <Button
            key={category.id}
            variant={selectedCategory === category.id ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedCategory(category.id)}
            className="flex items-center gap-2 whitespace-nowrap"
            disabled={loading || favorites.length === 0}
          >
            <span>{category.icon}</span>
            <span>{category.label(t)}</span>
          </Button>
        ))}
      </div>

      {renderContent()}
    </div>
  )
}
