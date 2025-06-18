"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import Image from "next/image"
import { Search, Filter, Clock, Star, Heart, X, ChefHat, Utensils, Plus, Loader2, Bookmark } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Slider } from "@/components/ui/slider"
import { useRecipes } from "@/hooks/use-recipes"
import { useAuthContext } from "@/components/auth/auth-provider"
import { motion, AnimatePresence } from "framer-motion"
import type { RecipeWithDetails } from "@/lib/services/recipe-service"

export default function RecipesPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [showFilters, setShowFilters] = useState(false)
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [maxCookTime, setMaxCookTime] = useState([120])
  const [calorieRange, setCalorieRange] = useState([0, 1000])
  const { user } = useAuthContext()

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

  const allTags = useMemo(() => {
    if (!recipes || recipes.length === 0) return []
    const tags = new Set<string>()
    recipes.forEach((recipe) => {
      if (recipe.tags && Array.isArray(recipe.tags)) {
        recipe.tags.forEach((tag) => tags.add(tag.name))
      }
    })
    return Array.from(tags).sort()
  }, [recipes])

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]))
  }

  const clearFilters = () => {
    setSearchQuery("")
    setSelectedTags([])
    setMaxCookTime([120])
    setCalorieRange([0, 1000])
  }

  const activeFiltersCount =
    (searchQuery ? 1 : 0) +
    selectedTags.length +
    (maxCookTime[0] !== 120 ? 1 : 0) +
    (calorieRange[0] !== 0 || calorieRange[1] !== 1000 ? 1 : 0)

  const favoriteCount = recipes ? recipes.filter((recipe) => recipe.is_favorited).length : 0

  if (loading && recipes.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8 flex justify-center items-center min-h-[calc(100vh-200px)]">
        <Loader2 className="h-12 w-12 animate-spin text-orange-600" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <p className="text-red-600 dark:text-red-400 mb-4">Error fetching recipes: {error}</p>
        <Button onClick={() => window.location.reload()} className="bg-orange-600 hover:bg-orange-700">
          Try Again
        </Button>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 font-sans">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold mb-2">Recipes</h1>
          <p className="text-gray-600 dark:text-gray-400">
            {recipes.length > 0 ? `Discover ${recipes.length} delicious recipes` : "Discover delicious recipes"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {user && (
            <Link href="/recipes/new">
              <Button className="bg-orange-600 hover:bg-orange-700">
                <Plus className="h-4 w-4 mr-2" />
                Add Recipe
              </Button>
            </Link>
          )}
          <Badge variant="secondary" className="bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200">
            <Heart className="h-3 w-3 mr-1" />
            {favoriteCount} Favorites
          </Badge>
        </div>
      </motion.div>

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
              placeholder="Search recipes..."
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
            Filter
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
                <h3 className="font-semibold text-lg">Advanced Filters</h3>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearFilters}
                    className="hover:bg-gray-200 dark:hover:bg-gray-700"
                  >
                    Clear All
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

              {allTags.length > 0 && (
                <div>
                  <label className="block text-sm font-medium mb-3">Dietary Preferences & Tags</label>
                  <div className="flex flex-wrap gap-2">
                    {allTags.map((tag) => (
                      <motion.div key={tag} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <Badge
                          variant={selectedTags.includes(tag) ? "default" : "outline"}
                          className={`cursor-pointer transition-all duration-200 text-xs px-2 py-1 rounded-full ${
                            selectedTags.includes(tag)
                              ? "bg-orange-600 text-white hover:bg-orange-700"
                              : "border-gray-300 hover:bg-orange-50 dark:border-gray-600 dark:hover:bg-orange-950"
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

              <div>
                <label className="block text-sm font-medium mb-3">Max Cook Time: {maxCookTime[0]} minutes</label>
                <Slider
                  value={maxCookTime}
                  onValueChange={setMaxCookTime}
                  max={120}
                  min={5}
                  step={5}
                  className="w-full [&>span:first-child]:h-1 [&>span:first-child]:bg-orange-300 [&_[role=slider]]:bg-orange-600 [&_[role=slider]]:border-orange-600"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-3">
                  Calorie Range: {calorieRange[0]} - {calorieRange[1]} calories
                </label>
                <Slider
                  value={calorieRange}
                  onValueChange={setCalorieRange}
                  max={1000}
                  min={0}
                  step={50}
                  className="w-full [&>span:first-child]:h-1 [&>span:first-child]:bg-orange-300 [&_[role=slider]]:bg-orange-600 [&_[role=slider]]:border-orange-600"
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="mb-6">
        <p className="text-gray-600 dark:text-gray-400">Showing {recipes?.length || 0} recipes</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
      >
        <AnimatePresence>
          {recipes &&
            recipes.map((recipe: RecipeWithDetails, index: number) => (
              <motion.div
                key={recipe.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.05, duration: 0.3 }}
                whileHover={{ y: -5 }}
                className="group flex flex-col"
              >
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden border border-gray-200 dark:border-gray-700 flex flex-col flex-grow">
                  <div className="relative h-48 overflow-hidden">
                    <Link href={`/recipes/${recipe.id}`} className="block w-full h-full">
                      <Image
                        src={
                          recipe.image_url ||
                          `/placeholder.svg?height=200&width=300&query=${encodeURIComponent(recipe.name) || "/placeholder.svg"}`
                        }
                        alt={recipe.name}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    </Link>
                    <div className="absolute top-2 right-2 flex gap-2">
                      {user && (
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => toggleFavorite(recipe.id, user.id)}
                          className={`p-1.5 rounded-full backdrop-blur-sm transition-all duration-200 ${
                            recipe.is_favorited ? "bg-orange-500 text-white" : "bg-white/80 text-gray-600 hover:bg-white"
                          }`}
                          aria-label={recipe.is_favorited ? "Remove from favorites" : "Add to favorites"}
                        >
                          <Bookmark className={`h-4 w-4 ${recipe.is_favorited ? "fill-current" : ""}`} />
                        </motion.button>
                      )}
                      <div className="bg-white/90 backdrop-blur-sm text-orange-600 rounded-full px-2 py-1 text-xs font-semibold flex items-center">
                        <Star className="h-3 w-3 mr-1 fill-orange-600 text-orange-600" />
                        {recipe.average_rating ? recipe.average_rating.toFixed(1) : "N/A"}
                      </div>
                    </div>
                    <div className="absolute bottom-2 left-2">
                      <Badge className="bg-black/70 text-white text-xs">{recipe.calories || 0} kcal</Badge>
                    </div>
                  </div>
                  <div className="p-4 flex flex-col flex-grow">
                    <Link href={`/recipes/${recipe.id}`} className="block">
                      <h3 className="font-bold text-lg group-hover:text-orange-600 transition-colors duration-200 mb-1 line-clamp-2">
                        {recipe.name}
                      </h3>
                    </Link>
                    <div className="flex justify-between items-center text-xs text-gray-500 dark:text-gray-400 mb-2">
                      <div className="flex items-center">
                        <Clock className="h-3 w-3 mr-1" />
                        {(recipe.prep_time_minutes || 0) + (recipe.cook_time_minutes || 0)} min
                      </div>
                      <div className="flex items-center">
                        <Utensils className="h-3 w-3 mr-1" />
                        {recipe.servings || 1} servings
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-x-2 mb-3 text-center">
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Protein</p>
                        <p className="font-semibold text-sm">{recipe.protein || 0}g</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Carbs</p>
                        <p className="font-semibold text-sm">{recipe.carbs || 0}g</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Fat</p>
                        <p className="font-semibold text-sm">{recipe.fat || 0}g</p>
                      </div>
                    </div>
                    {recipe.tags && recipe.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-3">
                        {recipe.tags.slice(0, 3).map((tag) => (
                          <Badge
                            key={tag.id}
                            variant="outline"
                            className="text-xs px-1.5 py-0.5 border-gray-300 dark:border-gray-600"
                          >
                            {tag.name}
                          </Badge>
                        ))}
                        {recipe.tags.length > 3 && (
                          <Badge
                            variant="outline"
                            className="text-xs px-1.5 py-0.5 border-gray-300 dark:border-gray-600"
                          >
                            +{recipe.tags.length - 3}
                          </Badge>
                        )}
                      </div>
                    )}
                    <div className="mt-auto">
                      <Button
                        asChild
                        className="w-full bg-orange-600 hover:bg-orange-700 transition-colors duration-200 text-sm py-2"
                      >
                        <Link href={`/recipes/${recipe.id}`}>View Recipe</Link>
                      </Button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
        </AnimatePresence>
      </motion.div>

      {recipes && recipes.length === 0 && !loading && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-12 bg-gray-50 dark:bg-gray-800 rounded-lg mt-8"
        >
          <ChefHat className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400 mb-4">No recipes match your criteria.</p>
          <div className="space-x-2">
            <Button onClick={clearFilters} className="bg-orange-600 hover:bg-orange-700">
              Clear All Filters
            </Button>
            {user && (
              <Link href="/recipes/new">
                <Button
                  variant="outline"
                  className="border-orange-600 text-orange-600 hover:bg-orange-50 dark:border-orange-500 dark:text-orange-500 dark:hover:bg-orange-950"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Your First Recipe
                </Button>
              </Link>
            )}
          </div>
        </motion.div>
      )}
    </div>
  )
}
