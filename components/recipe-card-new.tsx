"use client"

import React from 'react'
import Link from "next/link"
import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  HeartIcon, 
  ClockIcon, 
  UsersIcon, 
  StarIcon, 
  UtensilsIcon,
  CaloriesIcon,
  WeightIcon,
  WaterIcon
} from './icons-new'
import type { RecipeWithDetails } from "@/lib/services/recipe-service"

interface RecipeCardNewProps {
  recipe: RecipeWithDetails
  index: number
  isFavorited: boolean
  onToggleFavorite: () => void
  user?: any
  t: (key: string) => string
}

export const RecipeCardNew = ({ 
  recipe, 
  index, 
  isFavorited, 
  onToggleFavorite, 
  user, 
  t 
}: RecipeCardNewProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="group"
    >
      <Card className="h-full hover:shadow-xl transition-all duration-300 border-gray-200 dark:border-gray-700 hover:border-orange-300 dark:hover:border-orange-600 bg-white dark:bg-gray-800">
        <CardContent className="p-6 h-full flex flex-col">
          {/* Header con título y acciones */}
          <div className="flex justify-between items-start mb-4">
            <div className="flex-1 min-w-0">
              <Link href={`/recipes/${recipe.id}`} className="block">
                <h3 className="font-bold text-xl group-hover:text-orange-600 transition-colors duration-200 mb-2 line-clamp-2 leading-tight">
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
                onClick={onToggleFavorite}
                className={`p-3 rounded-full transition-all duration-200 ${
                  isFavorited 
                    ? "bg-red-500 text-white hover:bg-red-600 shadow-lg" 
                    : "bg-gray-100 dark:bg-gray-700 text-gray-600 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-900/20"
                }`}
                aria-label={isFavorited ? t("recipes.removeFromFavorites") : t("recipes.addToFavorites")}
              >
                <HeartIcon className={`h-5 w-5 ${isFavorited ? "fill-current" : ""}`} />
              </motion.button>
            )}
          </div>

          {/* Información nutricional destacada */}
          <div className="grid grid-cols-4 gap-3 mb-6">
            <div className="text-center p-3 bg-orange-50 dark:bg-orange-900/20 rounded-xl border border-orange-100 dark:border-orange-800">
              <div className="flex items-center justify-center mb-1">
                <CaloriesIcon className="h-4 w-4 text-orange-500 mr-1" />
              </div>
              <div className="text-lg font-bold text-orange-600">{recipe.calories || 0}</div>
              <div className="text-xs text-gray-600 dark:text-gray-400">kcal</div>
            </div>
            <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-800">
              <div className="flex items-center justify-center mb-1">
                <WeightIcon className="h-4 w-4 text-blue-500 mr-1" />
              </div>
              <div className="text-lg font-bold text-blue-600">{recipe.protein || 0}g</div>
              <div className="text-xs text-gray-600 dark:text-gray-400">proteína</div>
            </div>
            <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-100 dark:border-green-800">
              <div className="flex items-center justify-center mb-1">
                <div className="h-4 w-4 bg-green-500 rounded-full"></div>
              </div>
              <div className="text-lg font-bold text-green-600">{recipe.carbs || 0}g</div>
              <div className="text-xs text-gray-600 dark:text-gray-400">carbos</div>
            </div>
            <div className="text-center p-3 bg-purple-50 dark:bg-purple-900/20 rounded-xl border border-purple-100 dark:border-purple-800">
              <div className="flex items-center justify-center mb-1">
                <WaterIcon className="h-4 w-4 text-purple-500 mr-1" />
              </div>
              <div className="text-lg font-bold text-purple-600">{recipe.fat || 0}g</div>
              <div className="text-xs text-gray-600 dark:text-gray-400">grasas</div>
            </div>
          </div>

          {/* Ingredientes principales */}
          {recipe.ingredients && recipe.ingredients.length > 0 && (
            <div className="mb-6">
              <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center">
                <UtensilsIcon className="h-4 w-4 mr-2 text-orange-500" />
                Ingredientes principales
              </h4>
              <div className="flex flex-wrap gap-2">
                {recipe.ingredients.slice(0, 4).map((ingredient, idx) => (
                  <Badge
                    key={idx}
                    variant="outline"
                    className="text-xs px-3 py-1 bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300"
                  >
                    {ingredient.amount} {ingredient.name}
                  </Badge>
                ))}
                {recipe.ingredients.length > 4 && (
                  <Badge
                    variant="outline"
                    className="text-xs px-3 py-1 bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800 text-orange-700 dark:text-orange-300"
                  >
                    +{recipe.ingredients.length - 4} más
                  </Badge>
                )}
              </div>
            </div>
          )}

          {/* Información adicional */}
          <div className="flex justify-between items-center text-sm text-gray-600 dark:text-gray-400 mb-6">
            <div className="flex items-center bg-gray-50 dark:bg-gray-700 px-3 py-2 rounded-lg">
              <ClockIcon className="h-4 w-4 mr-2 text-orange-500" />
              <span className="font-medium">{(recipe.prep_time_minutes || 0) + (recipe.cook_time_minutes || 0)} min</span>
            </div>
            <div className="flex items-center bg-gray-50 dark:bg-gray-700 px-3 py-2 rounded-lg">
              <UsersIcon className="h-4 w-4 mr-2 text-blue-500" />
              <span className="font-medium">{recipe.servings || 1} porciones</span>
            </div>
            <div className="flex items-center bg-gray-50 dark:bg-gray-700 px-3 py-2 rounded-lg">
              <StarIcon className="h-4 w-4 mr-2 fill-orange-400 text-orange-400" />
              <span className="font-medium">{recipe.average_rating ? recipe.average_rating.toFixed(1) : "N/A"}</span>
            </div>
          </div>

          {/* Tags */}
          {recipe.tags && recipe.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-6">
              {recipe.tags.slice(0, 3).map((tag) => (
                <Badge
                  key={tag.id}
                  variant="secondary"
                  className="text-xs px-3 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 border-orange-200 dark:border-orange-800"
                >
                  {tag.name}
                </Badge>
              ))}
              {recipe.tags.length > 3 && (
                <Badge
                  variant="secondary"
                  className="text-xs px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400"
                >
                  +{recipe.tags.length - 3}
                </Badge>
              )}
            </div>
          )}

          {/* Botón de acción */}
          <div className="mt-auto">
            <Link href={`/recipes/${recipe.id}`} className="block">
              <Button className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-medium py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200">
                Ver Receta Completa
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
