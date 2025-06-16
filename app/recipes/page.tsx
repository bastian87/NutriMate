"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import Image from "next/image"
import { Search, Filter, Clock, Star, Heart, X, ChefHat, Utensils, Plus } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Slider } from "@/components/ui/slider"
import { useLanguage } from "@/lib/i18n/context"
import { useRecipes } from "@/hooks/use-recipes"
import { useAuthContext } from "@/components/auth/auth-provider"
import { motion, AnimatePresence } from "framer-motion"

export default function RecipesPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [showFilters, setShowFilters] = useState(false)
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [maxCookTime, setMaxCookTime] = useState([60])
  const [calorieRange, setCalorieRange] = useState([0, 800])
  const [sortBy, setSortBy] = useState("name")
  const { t } = useLanguage()
  const { user } = useAuthContext()

  // Memoize filters to prevent recreation on every render
  const filters = useMemo(
    () => ({
      search: searchQuery,
      tags: selectedTags,
      maxCookTime: maxCookTime[0],
      calorieRange: calorieRange as [number, number],
      userId: user?.id,
    }),
    [searchQuery, selectedTags, maxCookTime[0], calorieRange[0], calorieRange[1], user?.id],
  )

  // Use real recipes from database
  const { recipes, loading, error, toggleFavorite } = useRecipes(filters)

  console.log("Recipes page render:", { recipesCount: recipes?.length, loading, error })

  // Get all unique tags from recipes
  const allTags = useMemo(() => {
    if (!recipes || recipes.length === 0) return []

    const tags = new Set<string>()
    recipes.forEach((recipe) => {
      if (recipe.tags && Array.isArray(recipe.tags)) {
        recipe.tags.forEach((tag) => tags.add(tag.name))
      }
    })
    return Array.from(tags)
  }, [recipes])

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]))
  }

  const clearFilters = () => {
    setSelectedTags([])
    setMaxCookTime([60])
    setCalorieRange([0, 800])
    setSortBy("name")
    setSearchQuery("")
  }

  const activeFiltersCount =
    selectedTags.length + (maxCookTime[0] !== 60 ? 1 : 0) + (calorieRange[0] !== 0 || calorieRange[1] !== 800 ? 1 : 0)

  const favoriteCount = recipes ? recipes.filter((recipe) => recipe.is_favorited).length : 0

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">{t("common.loading")}</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <p className="text-red-600 dark:text-red-400">
            {t("common.error")}: {error}
          </p>
          <Button onClick={() => window.location.reload()} className="mt-4">
            {t("common.tryAgain")}
          </Button>
          <div className="mt-4 text-sm text-gray-500">
            <p>Debug info: Check browser console for more details</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4"
      >
        <div>
          <h1 className="text-3xl font-serif font-bold mb-2">{t("recipes.title")}</h1>
          <p className="text-gray-600 dark:text-gray-400">{t("recipes.subtitle", { count: recipes.length })}</p>
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
          <Badge variant="secondary" className="bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200">
            <Heart className="h-3 w-3 mr-1" />
            {favoriteCount} {t("recipes.favorites")}
          </Badge>
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
              className="pl-10 pr-4 py-2 w-full transition-all duration-200 focus:ring-2 focus:ring-orange-500"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 relative transition-all duration-200 hover:bg-orange-50 dark:hover:bg-orange-950"
            >
              <Filter className="h-4 w-4" />
              {t("recipes.filter")}
              {activeFiltersCount > 0 && (
                <Badge className="ml-1 bg-orange-600 text-white text-xs px-1.5 py-0.5">{activeFiltersCount}</Badge>
              )}
            </Button>
          </div>
        </div>

        {/* Advanced Filters */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 space-y-6"
            >
              <div className="flex justify-between items-center">
                <h3 className="font-semibold text-lg">{t("recipes.advancedFilters")}</h3>
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm" onClick={clearFilters}>
                    {t("recipes.clearAll")}
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => setShowFilters(false)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Tags Filter */}
              {allTags.length > 0 && (
                <div>
                  <label className="block text-sm font-medium mb-3">{t("recipes.dietaryPreferences")}</label>
                  <div className="flex flex-wrap gap-2">
                    {allTags.map((tag) => (
                      <motion.div key={tag} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <Badge
                          variant={selectedTags.includes(tag) ? "default" : "outline"}
                          className={`cursor-pointer transition-all duration-200 ${
                            selectedTags.includes(tag)
                              ? "bg-orange-600 hover:bg-orange-700"
                              : "hover:bg-orange-50 dark:hover:bg-orange-950"
                          }`}
                          onClick={() => toggleTag(tag)}
                        >
                          {tag.charAt(0).toUpperCase() + tag.slice(1)}
                        </Badge>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {/* Cook Time Filter */}
              <div>
                <label className="block text-sm font-medium mb-3">
                  {t("recipes.maxCookTime")}: {maxCookTime[0]} {t("recipes.minutes")}
                </label>
                <Slider
                  value={maxCookTime}
                  onValueChange={setMaxCookTime}
                  max={120}
                  min={5}
                  step={5}
                  className="w-full"
                />
              </div>

              {/* Calorie Range Filter */}
              <div>
                <label className="block text-sm font-medium mb-3">
                  {t("recipes.calorieRange")}: {calorieRange[0]} - {calorieRange[1]} {t("recipes.calories")}
                </label>
                <Slider
                  value={calorieRange}
                  onValueChange={setCalorieRange}
                  max={800}
                  min={0}
                  step={50}
                  className="w-full"
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Active Filters Display */}
        {(selectedTags.length > 0 || searchQuery) && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-wrap gap-2 items-center"
          >
            <span className="text-sm text-gray-600 dark:text-gray-400">{t("recipes.activeFilters")}:</span>
            {searchQuery && (
              <Badge variant="secondary" className="flex items-center gap-1">
                {t("recipes.searchLabel")}: "{searchQuery}"
                <X className="h-3 w-3 cursor-pointer" onClick={() => setSearchQuery("")} />
              </Badge>
            )}
            {selectedTags.map((tag) => (
              <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                {tag}
                <X className="h-3 w-3 cursor-pointer" onClick={() => toggleTag(tag)} />
              </Badge>
            ))}
          </motion.div>
        )}
      </motion.div>

      {/* Results Summary */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="mb-6">
        <p className="text-gray-600 dark:text-gray-400">Showing {recipes ? recipes.length : 0} recipes</p>
      </motion.div>

      {/* Recipe Grid */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
      >
        <AnimatePresence>
          {recipes &&
            recipes.map((recipe, index) => (
              <motion.div
                key={recipe.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ y: -5 }}
                className="group"
              >
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden border border-gray-200 dark:border-gray-700">
                  <div className="relative h-48 overflow-hidden">
                    <Link href={`/recipes/${recipe.id}`}>
                      <Image
                        src={recipe.image_url || "/placeholder.svg?height=200&width=300&query=food"}
                        alt={recipe.name}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    </Link>
                    <div className="absolute top-2 right-2 flex gap-2">
                      {user && (
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => toggleFavorite(recipe.id)}
                          className={`p-2 rounded-full backdrop-blur-sm transition-all duration-200 ${
                            recipe.is_favorited ? "bg-red-500 text-white" : "bg-white/80 text-gray-600 hover:bg-white"
                          }`}
                        >
                          <Heart className={`h-4 w-4 ${recipe.is_favorited ? "fill-current" : ""}`} />
                        </motion.button>
                      )}
                      <div className="bg-white/90 backdrop-blur-sm text-orange-600 rounded-full px-2 py-1 text-sm font-bold flex items-center">
                        <Star className="h-3 w-3 mr-1 fill-orange-600 text-orange-600" />
                        {recipe.average_rating ? recipe.average_rating.toFixed(1) : "0.0"}
                      </div>
                    </div>
                    <div className="absolute bottom-2 left-2">
                      <Badge className="bg-black/70 text-white text-xs">
                        {recipe.calories || 0} {t("recipes.cal")}
                      </Badge>
                    </div>
                  </div>

                  <div className="p-4">
                    <Link href={`/recipes/${recipe.id}`}>
                      <h3 className="font-serif font-bold text-lg group-hover:text-orange-600 transition-colors duration-200 mb-2 line-clamp-2">
                        {recipe.name}
                      </h3>
                    </Link>

                    <div className="flex justify-between items-center mb-3">
                      <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                        <Clock className="h-4 w-4 mr-1" />
                        {(recipe.prep_time_minutes || 0) + (recipe.cook_time_minutes || 0)} {t("recipes.min")}
                      </div>
                      <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                        <Utensils className="h-4 w-4 mr-1" />
                        {recipe.servings || 1} {t("recipes.servings")}
                      </div>
                    </div>

                    {/* Nutrition Summary */}
                    <div className="grid grid-cols-3 gap-2 mb-3">
                      <div className="text-center">
                        <p className="text-xs text-gray-500 dark:text-gray-400">{t("recipes.protein")}</p>
                        <p className="font-semibold text-sm">{recipe.protein || 0}g</p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-gray-500 dark:text-gray-400">{t("recipes.carbs")}</p>
                        <p className="font-semibold text-sm">{recipe.carbs || 0}g</p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-gray-500 dark:text-gray-400">{t("recipes.fat")}</p>
                        <p className="font-semibold text-sm">{recipe.fat || 0}g</p>
                      </div>
                    </div>

                    {/* Tags */}
                    {recipe.tags && recipe.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-3">
                        {recipe.tags.slice(0, 2).map((tag) => (
                          <Badge key={tag.id} variant="outline" className="text-xs">
                            {tag.name}
                          </Badge>
                        ))}
                        {recipe.tags.length > 2 && (
                          <Badge variant="outline" className="text-xs">
                            +{recipe.tags.length - 2}
                          </Badge>
                        )}
                      </div>
                    )}

                    <Link href={`/recipes/${recipe.id}`}>
                      <Button className="w-full bg-orange-600 hover:bg-orange-700 transition-colors duration-200">
                        {t("recipes.viewRecipe")}
                      </Button>
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
        </AnimatePresence>
      </motion.div>

      {/* No Results */}
      {recipes && recipes.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-12 bg-gray-50 dark:bg-gray-800 rounded-lg"
        >
          <ChefHat className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <div className="text-gray-500 dark:text-gray-400 mb-4">{t("recipes.noResults")}</div>
          <div className="space-x-2">
            <Button onClick={clearFilters} className="bg-orange-600 hover:bg-orange-700">
              {t("recipes.clearAll")}
            </Button>
            {user && (
              <Link href="/recipes/new">
                <Button variant="outline">
                  <Plus className="h-4 w-4 mr-2" />
                  {t("recipes.addFirstRecipe")}
                </Button>
              </Link>
            )}
          </div>
        </motion.div>
      )}
    </div>
  )
}
