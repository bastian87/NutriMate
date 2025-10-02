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
import { useAuthContext } from "@/components/auth/simple-auth-provider"


export default function SavedRecipesPage() {
  const { favorites, loading, error, removeFavorite } = useUserFavorites()
  const { isPremium } = useSubscription()
  const { user } = useAuthContext()
  const [searchQuery, setSearchQuery] = useState("")
  const [showFilters, setShowFilters] = useState(false)
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [maxCookTime, setMaxCookTime] = useState([120])
  const [calorieRange, setCalorieRange] = useState([0, 1000])
  const [sortOption, setSortOption] = useState<"az" | "za" | "calories-asc" | "calories-desc">("az")
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 12
  const { t } = useLanguage()

  // Definir tipos de comida
  const MEAL_TYPES = ["breakfast", "lunch", "dinner", "snack"]

  // Unir tags y tipos de comida para los filtros
  const allTags = useMemo(() => {
    if (!favorites || favorites.length === 0) return []
    const tags = new Set<string>()
    favorites.forEach((recipe) => {
      if (recipe.tags && Array.isArray(recipe.tags)) {
        recipe.tags.forEach((tag) => {
          if (tag && tag.name) tags.add(tag.name)
        })
      }
      if (recipe.meal_type && MEAL_TYPES.includes(recipe.meal_type)) {
        tags.add(recipe.meal_type)
      }
    })
    return Array.from(tags).filter(Boolean).sort()
  }, [favorites])

  const filteredRecipes = useMemo(() => {
    let arr = favorites

    // Filtro por nombre
    if (searchQuery.trim()) {
      arr = arr.filter(recipe => recipe.name.toLowerCase().includes(searchQuery.trim().toLowerCase()))
    }

    // Filtro por tags y tipo de comida
    if (selectedTags.length) {
      arr = arr.filter((recipe) => {
        const recipeTagNames = (recipe.tags || []).map((t) => t.name)
        const hasTag = selectedTags.some((tag) => recipeTagNames.includes(tag))
        const hasMealType = recipe.meal_type && selectedTags.includes(recipe.meal_type)
        return hasTag || hasMealType
      })
    }

    // Filtro por tiempo máximo
    if (maxCookTime[0] !== 120) {
      arr = arr.filter(recipe => (recipe.cook_time_minutes || 0) <= maxCookTime[0])
    }

    // Filtro por rango calórico
    if (calorieRange[0] !== 0 || calorieRange[1] !== 1000) {
      arr = arr.filter(recipe => {
        const calories = recipe.calories || 0
        return calories >= calorieRange[0] && calories <= calorieRange[1]
      })
    }

    // Ordenamiento
    switch (sortOption) {
      case "az":
        arr.sort((a, b) => a.name.localeCompare(b.name))
        break
      case "za":
        arr.sort((a, b) => b.name.localeCompare(a.name))
        break
      case "calories-asc":
        arr.sort((a, b) => (a.calories || 0) - (b.calories || 0))
        break
      case "calories-desc":
        arr.sort((a, b) => (b.calories || 0) - (a.calories || 0))
        break
    }

    return arr
  }, [favorites, searchQuery, selectedTags, maxCookTime, calorieRange, sortOption])

  // Paginación
  const totalPages = Math.ceil(filteredRecipes.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedRecipes = filteredRecipes.slice(startIndex, startIndex + itemsPerPage)

  // Contador de filtros activos
  const activeFiltersCount = useMemo(() => {
    let count = 0
    if (searchQuery.trim()) count++
    if (selectedTags.length > 0) count++
    if (maxCookTime[0] !== 120) count++
    if (calorieRange[0] !== 0 || calorieRange[1] !== 1000) count++
    return count
  }, [searchQuery, selectedTags, maxCookTime, calorieRange])

  const clearFilters = () => {
    setSearchQuery("")
    setSelectedTags([])
    setMaxCookTime([120])
    setCalorieRange([0, 1000])
    setCurrentPage(1)
  }

  const toggleTag = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    )
    setCurrentPage(1)
  }

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
        {/* Search and Filters */}
        <RecipeFiltersNew
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          showFilters={showFilters}
          setShowFilters={setShowFilters}
          selectedTags={selectedTags}
          toggleTag={toggleTag}
          allTags={allTags}
          maxCookTime={maxCookTime}
          setMaxCookTime={setMaxCookTime}
          calorieRange={calorieRange}
          setCalorieRange={setCalorieRange}
          sortOption={sortOption}
          setSortOption={setSortOption}
          clearFilters={clearFilters}
          activeFiltersCount={activeFiltersCount}
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
            className="flex justify-center items-center gap-3 mt-12"
          >
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="flex items-center gap-2 px-4 py-2 rounded-xl hover:bg-orange-50 dark:hover:bg-orange-950 border-gray-300 dark:border-gray-600"
            >
              <ChevronLeftIcon className="h-4 w-4" />
              Anterior
            </Button>
            
            <div className="flex items-center gap-2">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <Button
                  key={page}
                  variant={currentPage === page ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCurrentPage(page)}
                  className={`w-10 h-10 p-0 rounded-xl font-medium ${
                    currentPage === page 
                      ? "bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg" 
                      : "hover:bg-orange-50 dark:hover:bg-orange-950 border-gray-300 dark:border-gray-600"
                  }`}
                >
                  {page}
                </Button>
              ))}
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="flex items-center gap-2 px-4 py-2 rounded-xl hover:bg-orange-50 dark:hover:bg-orange-950 border-gray-300 dark:border-gray-600"
            >
              Siguiente
              <ChevronRightIcon className="h-4 w-4" />
            </Button>
          </motion.div>
        )}
      </div>
    </div>
  )
}
