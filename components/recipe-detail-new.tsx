"use client"

import React from 'react'
import Link from "next/link"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  ArrowLeftIcon, 
  ShareIcon, 
  EditIcon,
  HeartIcon,
  CaloriesIcon,
  UtensilsIcon,
} from './icons-new'
import { ImageWithFallback } from "@/components/image-with-fallback"
import type { RecipeWithDetails } from "@/lib/services/recipe-service"

interface RecipeDetailNewProps {
  recipe: RecipeWithDetails
  user: any
  showShareMenu: boolean
  setShowShareMenu: (show: boolean) => void
  shareMenuRef: React.RefObject<HTMLDivElement>
  handleCopy: () => void
  copied: boolean
  shareUrl: string
  t: (key: string) => string
}

export const RecipeDetailNew = ({
  recipe,
  user,
  showShareMenu,
  setShowShareMenu,
  shareMenuRef,
  handleCopy,
  copied,
  shareUrl,
  t
}: RecipeDetailNewProps) => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Back Button */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <Link 
            href="/recipes" 
            className="inline-flex items-center text-gray-600 hover:text-orange-600 transition-colors duration-200 font-medium"
          >
            <ArrowLeftIcon className="mr-2 h-5 w-5" />
            {t("recipes.backToRecipes")}
          </Link>
        </div>
      </div>

      {/* Recipe Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white leading-tight">
                {recipe.name}
              </h1>

              {/* Recipe Image */}
              {recipe.image_url && (
                <div className="rounded-2xl overflow-hidden shadow-lg">
                  <ImageWithFallback
                    src={recipe.image_url}
                    alt={recipe.name}
                    width={800}
                    height={400}
                    className="w-full h-64 md:h-96 object-cover"
                  />
                </div>
              )}

              {/* Recipe Meta Information */}
              <div className="flex flex-wrap items-center gap-6 p-6 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 rounded-2xl border border-gray-200 dark:border-gray-600">
                <div className="flex items-center bg-white dark:bg-gray-800 px-4 py-2 rounded-xl shadow-sm">
                  <CaloriesIcon className="h-5 w-5 text-orange-500 mr-2" />
                  <span className="text-gray-700 dark:text-gray-300 font-medium">
                    {recipe.calories || 0} kcal
                  </span>
                </div>

                {/* Creator Information */}
                {recipe.creator && (
                  <div className="flex items-center bg-white dark:bg-gray-800 px-4 py-2 rounded-xl shadow-sm">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-400 to-orange-500 flex items-center justify-center mr-3">
                      <span className="text-white font-semibold text-sm">
                        {recipe.creator.username ? recipe.creator.username.charAt(0).toUpperCase() : 'U'}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {recipe.creator.username || recipe.creator.full_name || 'Usuario'}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Creator</p>
                    </div>
                  </div>
                )}

                <div className="flex items-center ml-auto gap-3">
                  {/* Edit Button - Only show if user is the creator */}
                  {user && recipe.created_by === user.id && (
                    <Link href={`/recipes/${recipe.id}/edit`}>
                      <Button variant="outline" size="sm" className="rounded-xl">
                        <EditIcon className="mr-2 h-4 w-4" />
                        Edit
                      </Button>
                    </Link>
                  )}

                  <div className="relative">
                    <Button 
                      variant="outline" 
                      onClick={() => setShowShareMenu(!showShareMenu)} 
                      className="rounded-xl"
                    >
                      <ShareIcon className="mr-2 h-4 w-4" />
                      {t("recipes.share")}
                    </Button>
                    {showShareMenu && (
                      <div 
                        ref={shareMenuRef} 
                        className="absolute z-10 top-12 right-0 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-xl shadow-lg p-4 min-w-[220px]"
                      >
                        <div className="flex flex-col gap-2">
                          <a
                            href={`https://wa.me/?text=${encodeURIComponent(`Check out this recipe in NutriMate! ${shareUrl}`)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:bg-orange-50 dark:hover:bg-orange-900/20 rounded-lg px-3 py-2 text-sm transition-colors duration-200"
                          >
                            {t("recipes.shareWhatsApp")}
                          </a>
                          <a
                            href={`mailto:?subject=${encodeURIComponent(`Recipe: ${recipe.name}`)}&body=${encodeURIComponent(`Check out this recipe in NutriMate!\n${shareUrl}`)}`}
                            className="hover:bg-orange-50 dark:hover:bg-orange-900/20 rounded-lg px-3 py-2 text-sm transition-colors duration-200"
                          >
                            {t("recipes.shareEmail")}
                          </a>
                          <button
                            onClick={handleCopy}
                            className="hover:bg-orange-50 dark:hover:bg-orange-900/20 rounded-lg px-3 py-2 text-sm text-left transition-colors duration-200"
                          >
                            {copied ? t("recipes.linkCopied") : t("recipes.copyLink")}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Recipe Content */}
      <div className="container mx-auto px-4 py-10">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Ingredients Section */}
            <div className="lg:col-span-2">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Card className="shadow-lg border-gray-200 dark:border-gray-700">
                  <CardHeader className="bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-t-xl">
                    <CardTitle className="text-xl flex items-center">
                      <UtensilsIcon className="h-5 w-5 mr-2" />
                      {t("recipes.ingredients")}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="space-y-4 mb-6">
                      {recipe.ingredients && recipe.ingredients.length > 0 ? (
                        recipe.ingredients.map((ingredient, index) => (
                          <div key={ingredient.id || `ingredient-${index}`} className="flex items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                            <Badge variant="outline" className="mr-3 text-sm px-3 py-1">
                              {ingredient.amount || ''}
                            </Badge>
                            <span className="text-gray-700 dark:text-gray-300 text-base">
                              {ingredient.name}
                            </span>
                          </div>
                        ))
                      ) : (
                        <div className="text-gray-500 dark:text-gray-400 text-center py-4">
                          {t("recipes.noIngredientsAvailableText")}
                        </div>
                      )}
                    </div>

                  </CardContent>
                </Card>
              </motion.div>
            </div>

            {/* Calories Section */}
            <div className="lg:col-span-1">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="sticky top-8"
              >
                <Card className="shadow-lg border-gray-200 dark:border-gray-700">
                  <CardHeader className="bg-white dark:bg-gray-800 rounded-t-xl">
                    <CardTitle className="text-xl font-bold text-gray-900 dark:text-white">Nutrition</CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="text-center p-6 bg-orange-50 dark:bg-orange-900/20 rounded-xl border border-orange-100 dark:border-orange-800">
                      <div className="flex items-center justify-center mb-3">
                        <CaloriesIcon className="h-8 w-8 text-orange-500" />
                      </div>
                      <div className="text-4xl font-bold text-orange-600 mb-2">{recipe.calories || 0}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">calories</div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
