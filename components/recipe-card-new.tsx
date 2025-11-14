"use client"

import React from 'react'
import Link from "next/link"
import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  HeartIcon, 
  CaloriesIcon,
  UtensilsIcon,
} from './icons-new'
import { ImageWithFallback } from "@/components/image-with-fallback"
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
          {/* Recipe Image */}
          {recipe.image_url && (
            <div className="mb-4 rounded-lg overflow-hidden">
              <ImageWithFallback
                src={recipe.image_url}
                alt={recipe.name}
                width={400}
                height={250}
                className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
              />
            </div>
          )}

          {/* Header con título y acciones */}
          <div className="flex justify-between items-start mb-4">
            <div className="flex-1 min-w-0">
              <Link href={`/recipes/${recipe.id}`} className="block">
                <h3 className="font-bold text-xl group-hover:text-orange-600 transition-colors duration-200 mb-2 line-clamp-2 leading-tight">
                  {recipe.name}
                </h3>
              </Link>
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

          {/* Calories */}
          <div className="mb-6">
            <div className="text-center p-3 bg-orange-50 dark:bg-orange-900/20 rounded-xl border border-orange-100 dark:border-orange-800">
              <div className="flex items-center justify-center mb-1">
                <CaloriesIcon className="h-4 w-4 text-orange-500 mr-1" />
              </div>
              <div className="text-lg font-bold text-orange-600">{recipe.calories || 0}</div>
              <div className="text-xs text-gray-600 dark:text-gray-400">kcal</div>
            </div>
          </div>

          {/* Ingredientes principales */}
          {recipe.ingredients && recipe.ingredients.length > 0 && (
            <div className="mb-6">
              <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center">
                <UtensilsIcon className="h-4 w-4 mr-2 text-orange-500" />
                Ingredients
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
                    +{recipe.ingredients.length - 4} more
                  </Badge>
                )}
              </div>
            </div>
          )}

          {/* Botón de acción */}
          <div className="mt-auto">
            <Link href={`/recipes/${recipe.id}`} className="block">
              <Button className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-medium py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200">
                View Recipe
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
