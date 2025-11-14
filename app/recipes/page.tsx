"use client"

import { useState, useMemo, useEffect } from "react"
import Link from "next/link"
import { Loader2, ChefHat, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useRecipes } from "@/hooks/use-recipes"
import { useAuthContext } from "@/components/auth/simple-auth-provider"
import { motion } from "framer-motion"
import type { RecipeWithDetails } from "@/lib/services/recipe-service"
import { useUserFavorites } from "@/hooks/use-user-favorites"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog"
import { useSubscription } from "@/hooks/use-subscription"
import { useLanguage } from "@/lib/i18n/context"
import { RecipeCardNew } from "@/components/recipe-card-new"
import { RecipeFiltersNew } from "@/components/recipe-filters-new"
import { ChevronLeftIcon, ChevronRightIcon } from "@/components/icons-new"
import { RecipeCardSkeleton, DashboardSkeleton } from "@/components/loading-skeleton"
import { Pagination, usePagination } from "@/components/ui/pagination"

export default function RecipesPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const { user } = useAuthContext()
  const { tryAddFavorite, showLimitModal, setShowLimitModal, favorites, removeFavorite } = useUserFavorites()
  const { isPremium } = useSubscription()
  const [recipesState, setRecipesState] = useState<RecipeWithDetails[]>([])
  const [favoritedRecipes, setFavoritedRecipes] = useState<Set<string>>(new Set())
  const { t } = useLanguage()
  
  // Paginación
  const ITEMS_PER_PAGE = 12;

  const filters = useMemo(
    () => ({
      search: searchQuery,
      userId: user?.id,
    }),
    [searchQuery, user?.id],
  )

  const { recipes, loading, error, toggleFavorite } = useRecipes(filters)

  useEffect(() => {
    setRecipesState(recipes)
    const favoriteIds = favorites.map(fav => fav.id)
    setFavoritedRecipes(new Set(favoriteIds))
  }, [recipes, favorites])

  // Simple filtering by name
  const filteredRecipes = useMemo(() => {
    if (!searchQuery.trim()) {
      return recipes
    }
    return recipes.filter(recipe => 
      recipe.name.toLowerCase().includes(searchQuery.trim().toLowerCase())
    )
  }, [recipes, searchQuery])

  // Aplicar paginación a las recetas filtradas
  const {
    currentPage,
    totalPages,
    paginatedItems: paginatedRecipes,
    goToPage
  } = usePagination(filteredRecipes, ITEMS_PER_PAGE);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-pink-50">
        <div className="bg-white dark:bg-gray-800 shadow-sm border-b">
          <div className="container mx-auto px-4 py-8">
            <div className="space-y-6">
              <div className="space-y-2">
                <div className="h-8 w-64 bg-gray-200 rounded animate-pulse" />
                <div className="h-4 w-96 bg-gray-200 rounded animate-pulse" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
                  <RecipeCardSkeleton key={i} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <p className="text-red-600 dark:text-red-400 mb-4">Error cargando recetas: {error}</p>
        <Button onClick={() => window.location.reload()} className="bg-orange-600 hover:bg-orange-700">
          Intentar de nuevo
        </Button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-pink-50">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b">
        <div className="container mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
      >
        <div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2 text-gray-900 dark:text-white">{t("recipes.title")}</h1>
          <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base lg:text-lg">
            {recipes.length > 0
              ? t("recipes.subtitle", { count: recipes.length })
              : t("recipes.subtitle", { count: "" })}
          </p>
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          {user && (
            <Link href="/recipes/new">
              <Button className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-3 sm:px-6 py-2 sm:py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 text-sm sm:text-base">
                <Plus className="h-4 w-4 sm:h-5 sm:w-5 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">{t("recipes.addRecipe")}</span>
                <span className="sm:hidden">Agregar</span>
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
              <ChefHat className="h-20 w-20 text-gray-400 mx-auto mb-6" />
              <h3 className="text-2xl font-bold text-gray-600 dark:text-gray-400 mb-3">
            No se encontraron recetas
          </h3>
              <p className="text-gray-500 dark:text-gray-500 text-lg">
            Intenta ajustar tus filtros de búsqueda
          </p>
            </div>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6"
        >
          {paginatedRecipes.map((recipe, index) => (
              <RecipeCardNew
              key={recipe.id}
                recipe={recipe}
                index={index}
                isFavorited={favoritedRecipes.has(recipe.id)}
                onToggleFavorite={() => {
                          const isFav = favoritedRecipes.has(recipe.id)
                          if (isFav) {
                            removeFavorite(recipe.id)
                            setFavoritedRecipes(prev => {
                              const newSet = new Set(prev)
                              newSet.delete(recipe.id)
                              return newSet
                            })
                          } else {
                            const currentFavoritesCount = favoritedRecipes.size
                            if (!isPremium && currentFavoritesCount >= 10) {
                              setShowLimitModal(true)
                              return
                            }
                            tryAddFavorite(recipe.id).then(success => {
                              if (success) {
                                setFavoritedRecipes(prev => new Set([...prev, recipe.id]))
                              }
                            })
                          }
                        }}
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

      {/* Modal de límite de favoritos */}
      <Dialog open={showLimitModal} onOpenChange={setShowLimitModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Límite de Favoritos Alcanzado</DialogTitle>
            <DialogDescription>
              Has alcanzado el límite de 10 recetas favoritas en el plan gratuito. 
              Actualiza a Premium para guardar recetas ilimitadas.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">{t("common.close")}</Button>
            </DialogClose>
            <Link href="/pricing">
              <Button className="bg-orange-600 hover:bg-orange-700">
                Actualizar a Premium
              </Button>
            </Link>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
