"use client"

import { useState, useMemo, useEffect } from "react"
import Link from "next/link"
import { Search, Filter, Clock, Star, Heart, X, ChefHat, Utensils, Plus, Loader2, Bookmark, ChevronLeft, ChevronRight, BookmarkCheck, Users, Zap, Flame } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Slider } from "@/components/ui/slider"
import { useRecipes } from "@/hooks/use-recipes"
import { useAuthContext } from "@/components/auth/simple-auth-provider"
import { motion, AnimatePresence } from "framer-motion"
import type { RecipeWithDetails } from "@/lib/services/recipe-service"
import { useUserFavorites } from "@/hooks/use-user-favorites"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog"
import { useSubscription } from "@/hooks/use-subscription"
import { useLanguage } from "@/lib/i18n/context"
import { Select, SelectItem, SelectTrigger, SelectContent } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"

export default function RecipesPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [showFilters, setShowFilters] = useState(false)
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [maxCookTime, setMaxCookTime] = useState([120])
  const [calorieRange, setCalorieRange] = useState([0, 1000])
  const [sortOption, setSortOption] = useState<"az" | "za" | "calories-asc" | "calories-desc">("az")
  const { user } = useAuthContext()
  const { tryAddFavorite, showLimitModal, setShowLimitModal, favorites, removeFavorite } = useUserFavorites()
  const { isPremium } = useSubscription()
  const [recipesState, setRecipesState] = useState<RecipeWithDetails[]>([])
  const [favoritedRecipes, setFavoritedRecipes] = useState<Set<string>>(new Set())
  const { t } = useLanguage()

  const filters = useMemo(
    () => ({
      search: searchQuery,
      tags: selectedTags,
      maxCookTime: maxCookTime[0],
      calorieRange: calorieRange as [number, number],
      userId: user?.id,
    }),
    [searchQuery, selectedTags, maxCookTime, calorieRange, user?.id],
  )

  const { recipes, loading, error, toggleFavorite } = useRecipes(filters)

  useEffect(() => {
    setRecipesState(recipes)
    const favoriteIds = favorites.map(fav => fav.id)
    setFavoritedRecipes(new Set(favoriteIds))
  }, [recipes, favorites])

  // Definir tipos de comida
  const MEAL_TYPES = ["breakfast", "lunch", "dinner", "snack"]

  // Unir tags y tipos de comida para los filtros
  const allTags = useMemo(() => {
    if (!recipes || recipes.length === 0) return []
    const tags = new Set<string>()
    recipes.forEach((recipe) => {
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
  }, [recipes])

  // Estado para paginación
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 12

  // Filtrado y ordenamiento
  const filteredRecipes = useMemo(() => {
    let arr = recipes

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
  }, [recipes, searchQuery, selectedTags, maxCookTime, calorieRange, sortOption])

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
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="flex items-center gap-2">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span>Cargando recetas...</span>
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
    <div className="container mx-auto px-4 py-8 font-sans">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold mb-2">{t("recipes.title")}</h1>
          <p className="text-gray-600 dark:text-gray-400">
            {recipes.length > 0
              ? t("recipes.subtitle", { count: recipes.length })
              : t("recipes.subtitle", { count: "" })}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {user && (
            <Link href="/recipes/new">
              <Button className="bg-orange-600 hover:bg-orange-700">
                <Plus className="h-4 w-4 mr-2" />
                {t("recipes.addRecipe")}
              </Button>
            </Link>
          )}
        </div>
      </motion.div>

      {/* Search and Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-8 space-y-4"
      >
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              type="search"
              placeholder={t("recipes.search")}
              className="pl-10 pr-4 py-2 w-full transition-all duration-200 focus:ring-2 focus:ring-orange-500 border-gray-300 dark:border-gray-600"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 relative transition-all duration-200 hover:bg-orange-50 dark:hover:bg-orange-950 border-gray-300 dark:border-gray-600"
          >
            <Filter className="h-4 w-4" />
            {t("recipes.filter")}
            {activeFiltersCount > 0 && (
              <Badge className="ml-1 bg-orange-600 text-white text-xs px-1.5 py-0.5">{activeFiltersCount}</Badge>
            )}
          </Button>
        </div>

        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 space-y-6 border border-gray-200 dark:border-gray-700"
            >
              <div className="flex justify-between items-center">
                <h3 className="font-semibold text-lg">Filtros Avanzados</h3>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearFilters}
                    className="hover:bg-gray-200 dark:hover:bg-gray-700"
                  >
                    {t("recipes.clearAll")}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowFilters(false)}
                    className="hover:bg-gray-200 dark:hover:bg-gray-700"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Ordenamiento */}
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Ordenar recetas</label>
                <Select value={sortOption} onValueChange={(v: string) => setSortOption(v as any)}> 
                  <SelectTrigger className="min-w-[140px] w-[200px] h-10 text-sm px-4 py-2">
                    {sortOption === "az" && "De A a la Z"}
                    {sortOption === "za" && "De Z a la A"}
                    {sortOption === "calories-asc" && t("recipes.sortCaloriesAsc")}
                    {sortOption === "calories-desc" && t("recipes.sortCaloriesDesc")}
                  </SelectTrigger>
                  <SelectContent className="min-w-[150px] w-[180px] text-xs">
                    <SelectItem value="az">De A a la Z</SelectItem>
                    <SelectItem value="za">De Z a la A</SelectItem>
                    <SelectItem value="calories-asc">Calorías: menor a mayor</SelectItem>
                    <SelectItem value="calories-desc">Calorías: mayor a menor</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Tags */}
              {allTags.length > 0 && (
                <div>
                  <label className="block text-sm font-medium mb-3">Preferencias Dietéticas y Tags</label>
                  <div className="flex flex-wrap gap-2">
                    {allTags.map((tag) => (
                      <Button
                        key={tag}
                        variant={selectedTags.includes(tag) ? "default" : "outline"}
                        size="sm"
                        onClick={() => toggleTag(tag)}
                        className={`text-xs px-3 py-1 h-auto ${
                          selectedTags.includes(tag)
                            ? "bg-orange-600 text-white hover:bg-orange-700"
                            : "border-gray-300 dark:border-gray-600 hover:bg-orange-50 dark:hover:bg-orange-950"
                        }`}
                      >
                        {tag}
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              {/* Tiempo de cocción */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Tiempo máximo de cocción: {maxCookTime[0]} minutos
                </label>
                <Slider
                  value={maxCookTime}
                  onValueChange={setMaxCookTime}
                  max={300}
                  min={15}
                  step={15}
                  className="w-full"
                />
              </div>

              {/* Rango calórico */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Rango calórico: {calorieRange[0]} - {calorieRange[1]} kcal
                </label>
                <Slider
                  value={calorieRange}
                  onValueChange={setCalorieRange}
                  max={2000}
                  min={0}
                  step={50}
                  className="w-full"
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Recipes Grid - Diseño Moderno sin Imágenes */}
      {filteredRecipes.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-12"
        >
          <ChefHat className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-400 mb-2">
            No se encontraron recetas
          </h3>
          <p className="text-gray-500 dark:text-gray-500">
            Intenta ajustar tus filtros de búsqueda
          </p>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {paginatedRecipes.map((recipe, index) => (
            <motion.div
              key={recipe.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="group"
            >
              <Card className="h-full hover:shadow-lg transition-all duration-300 border-gray-200 dark:border-gray-700 hover:border-orange-300 dark:hover:border-orange-600">
                <CardContent className="p-6 h-full flex flex-col">
                  {/* Header con título y acciones */}
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1 min-w-0">
                      <Link href={`/recipes/${recipe.id}`} className="block">
                        <h3 className="font-bold text-lg group-hover:text-orange-600 transition-colors duration-200 mb-1 line-clamp-2 leading-tight">
                          {recipe.name}
                        </h3>
                      </Link>
                      {recipe.description && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mt-1">
                          {recipe.description}
                        </p>
                      )}
                    </div>
                    
                    {/* Botón de favoritos */}
                    {user && (
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => {
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
                        className={`p-2 rounded-full transition-all duration-200 ${
                          favoritedRecipes.has(recipe.id) 
                            ? "bg-red-500 text-white hover:bg-red-600" 
                            : "bg-gray-100 dark:bg-gray-800 text-gray-600 hover:bg-red-50 hover:text-red-500"
                        }`}
                        aria-label={favoritedRecipes.has(recipe.id) ? t("recipes.removeFromFavorites") : t("recipes.addToFavorites")}
                      >
                        <Heart className={`h-4 w-4 ${favoritedRecipes.has(recipe.id) ? "fill-current" : ""}`} />
                      </motion.button>
                    )}
                  </div>

                  {/* Información nutricional destacada */}
                  <div className="grid grid-cols-4 gap-3 mb-4">
                    <div className="text-center p-2 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                      <div className="text-lg font-bold text-orange-600">{recipe.calories || 0}</div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">kcal</div>
                    </div>
                    <div className="text-center p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <div className="text-lg font-bold text-blue-600">{recipe.protein || 0}g</div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">proteína</div>
                    </div>
                    <div className="text-center p-2 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <div className="text-lg font-bold text-green-600">{recipe.carbs || 0}g</div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">carbos</div>
                    </div>
                    <div className="text-center p-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                      <div className="text-lg font-bold text-purple-600">{recipe.fat || 0}g</div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">grasas</div>
                    </div>
                  </div>

                  {/* Ingredientes principales */}
                  {recipe.ingredients && recipe.ingredients.length > 0 && (
                    <div className="mb-4">
                      <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center">
                        <Utensils className="h-4 w-4 mr-1" />
                        Ingredientes principales
                      </h4>
                      <div className="flex flex-wrap gap-1">
                        {recipe.ingredients.slice(0, 4).map((ingredient, idx) => (
                          <Badge
                            key={idx}
                            variant="outline"
                            className="text-xs px-2 py-1 bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-600"
                          >
                            {ingredient.amount} {ingredient.name}
                          </Badge>
                        ))}
                        {recipe.ingredients.length > 4 && (
                          <Badge
                            variant="outline"
                            className="text-xs px-2 py-1 bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-600"
                          >
                            +{recipe.ingredients.length - 4} más
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Información adicional */}
                  <div className="flex justify-between items-center text-sm text-gray-600 dark:text-gray-400 mb-4">
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-1" />
                      {(recipe.prep_time_minutes || 0) + (recipe.cook_time_minutes || 0)} min
                    </div>
                    <div className="flex items-center">
                      <Users className="h-4 w-4 mr-1" />
                      {recipe.servings || 1} porciones
                    </div>
                    <div className="flex items-center">
                      <Star className="h-4 w-4 mr-1 fill-orange-400 text-orange-400" />
                      {recipe.average_rating ? recipe.average_rating.toFixed(1) : "N/A"}
                    </div>
                  </div>

                  {/* Tags */}
                  {recipe.tags && recipe.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-4">
                      {recipe.tags.slice(0, 3).map((tag) => (
                        <Badge
                          key={tag.id}
                          variant="secondary"
                          className="text-xs px-2 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300"
                        >
                          {tag.name}
                        </Badge>
                      ))}
                      {recipe.tags.length > 3 && (
                        <Badge
                          variant="secondary"
                          className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400"
                        >
                          +{recipe.tags.length - 3}
                        </Badge>
                      )}
                    </div>
                  )}

                  {/* Botón de acción */}
                  <div className="mt-auto">
                    <Link href={`/recipes/${recipe.id}`} className="block">
                      <Button className="w-full bg-orange-600 hover:bg-orange-700 text-white">
                        Ver Receta
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Paginación */}
      {totalPages > 1 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex justify-center items-center gap-2 mt-8"
        >
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
            className="flex items-center gap-1"
          >
            <ChevronLeft className="h-4 w-4" />
            Anterior
          </Button>
          
          <div className="flex items-center gap-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <Button
                key={page}
                variant={currentPage === page ? "default" : "outline"}
                size="sm"
                onClick={() => setCurrentPage(page)}
                className={`w-8 h-8 p-0 ${
                  currentPage === page 
                    ? "bg-orange-600 text-white hover:bg-orange-700" 
                    : "hover:bg-orange-50 dark:hover:bg-orange-950"
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
            className="flex items-center gap-1"
          >
            Siguiente
            <ChevronRight className="h-4 w-4" />
          </Button>
        </motion.div>
      )}

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
              <Button variant="outline">Cerrar</Button>
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