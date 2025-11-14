"use client"

import { useState, useMemo } from "react"
import { useUserFavorites } from "@/hooks/use-user-favorites"
import { useSubscription } from "@/hooks/use-subscription"
import { Button } from "@/components/ui/button"
import { Clock, Bookmark, AlertCircle, Loader2, ChefHat, Plus } from "lucide-react"
import Link from "next/link"
import { RecipeCardSkeleton } from "@/components/recipe-card-skeleton"
import type { RecipeWithDetails } from "@/lib/services/recipe-service"
import { useLanguage } from "@/lib/i18n/context"
import type { TFunction } from "@/lib/i18n/context"
import { Badge } from "@/components/ui/badge"
import { motion } from "framer-motion"
import { RecipeCardNew } from "@/components/recipe-card-new"
import { RecipeFiltersNew } from "@/components/recipe-filters-new"
import { ChevronLeftIcon, ChevronRightIcon } from "@/components/icons-new"
import { Pagination, usePagination } from "@/components/ui/pagination"
import { useAuthContext } from "@/components/auth/simple-auth-provider"


export default function SavedRecipesPage() {
  const { favorites, loading, error, removeFavorite } = useUserFavorites()
  const { isPremium } = useSubscription()
  const { user } = useAuthContext()
  const [searchQuery, setSearchQuery] = useState("")
  // Paginación
  const ITEMS_PER_PAGE = 12;
  const { t } = useLanguage()

  const filteredRecipes = useMemo(() => {
    if (!searchQuery.trim()) {
      return favorites
    }
    return favorites.filter(recipe => 
      recipe.name.toLowerCase().includes(searchQuery.trim().toLowerCase())
    )
  }, [favorites, searchQuery])

  // Aplicar paginación a las recetas filtradas
  const {
    currentPage,
    totalPages,
    paginatedItems: paginatedRecipes,
    goToPage
  } = usePagination(filteredRecipes, ITEMS_PER_PAGE);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="flex items-center gap-2">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span>Cargando recetas guardadas...</span>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4 py-8 text-center">
          <p className="text-red-600 dark:text-red-400 mb-4">Error cargando recetas guardadas: {error}</p>
          <Button onClick={() => window.location.reload()} className="bg-orange-600 hover:bg-orange-700">
            Intentar de nuevo
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b">
        <div className="container mx-auto px-4 py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
          >
            <div>
              <h1 className="text-4xl font-bold mb-2 text-gray-900 dark:text-white">{t("savedRecipes.savedRecipes")}</h1>
              <p className="text-gray-600 dark:text-gray-400 text-lg">
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin inline-block" />
                ) : (
                  t("savedRecipes.recipes", { count: filteredRecipes.length })
                )}
              </p>
            </div>
            <div className="flex items-center gap-3">
              {user && (
                <Link href="/recipes">
                  <Button className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200">
                    <Plus className="h-5 w-5 mr-2" />
                    {t("recipes.exploreRecipes")}
                  </Button>
                </Link>
              )}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Search */}
        <RecipeFiltersNew
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          t={t}
        />


        {/* Recipes Grid */}
        {filteredRecipes.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16"
          >
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-12 shadow-lg">
              <Bookmark className="h-20 w-20 text-gray-400 mx-auto mb-6" />
              <h3 className="text-2xl font-bold text-gray-600 dark:text-gray-400 mb-3">
                {favorites.length === 0 ? t("savedRecipes.noSavedRecipesYet") : t("savedRecipes.noRecipesFound")}
              </h3>
              <p className="text-gray-500 dark:text-gray-500 text-lg mb-6">
                {favorites.length === 0 ? t("savedRecipes.noSavedRecipesDesc") : t("savedRecipes.noSavedRecipesMatch")}
              </p>
              {favorites.length === 0 && (
                <Button asChild className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200">
                  <Link href="/recipes">{t("savedRecipes.exploreRecipes")}</Link>
                </Button>
              )}
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {paginatedRecipes.map((recipe, index) => (
              <RecipeCardNew
                key={recipe.id}
                recipe={recipe}
                index={index}
                isFavorited={true}
                onToggleFavorite={() => removeFavorite(recipe.id)}
                user={user}
                t={t}
              />
            ))}
          </motion.div>
        )}

        {/* Paginación */}
        {totalPages > 1 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-12"
          >
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={goToPage}
              totalItems={filteredRecipes.length}
              itemsPerPage={ITEMS_PER_PAGE}
              showInfo={true}
            />
          </motion.div>
        )}
      </div>
    </div>
  )
}
