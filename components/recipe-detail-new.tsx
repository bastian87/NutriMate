"use client"

import React, { useState, useEffect, useRef } from 'react'
import Link from "next/link"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  ArrowLeftIcon, 
  ClockIcon, 
  UsersIcon, 
  StarIcon, 
  ShareIcon, 
  ShoppingCartIcon, 
  EditIcon,
  HeartIcon,
  CaloriesIcon,
  WeightIcon,
  WaterIcon
} from './icons-new'
import type { RecipeWithDetails } from "@/lib/services/recipe-service"

interface RecipeDetailNewProps {
  recipe: RecipeWithDetails
  user: any
  selectedIngredients: string[]
  toggleIngredient: (id: string) => void
  addToGroceryList: () => void
  isAddingToList: boolean
  userRating: number
  handleStarClick: (star: number) => void
  handleSaveRating: () => void
  savingRating: boolean
  showSavedMsg: boolean
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
  selectedIngredients,
  toggleIngredient,
  addToGroceryList,
  isAddingToList,
  userRating,
  handleStarClick,
  handleSaveRating,
  savingRating,
  showSavedMsg,
  showShareMenu,
  setShowShareMenu,
  shareMenuRef,
  handleCopy,
  copied,
  shareUrl,
  t
}: RecipeDetailNewProps) => {
  // Limpia los enlaces <a>...</a> de la descripción
  const cleanDescription = (html = ""): string => {
    return html.replace(/<a [^>]+>(.*?)<\/a>/gi, "$1");
  }

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
              
              {recipe.description && (
                <p
                  className="text-xl text-gray-600 dark:text-gray-400 leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: cleanDescription(recipe.description || "") }}
                />
              )}

              {/* Recipe Meta Information */}
              <div className="flex flex-wrap items-center gap-6 p-6 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 rounded-2xl border border-gray-200 dark:border-gray-600">
                <div className="flex items-center bg-white dark:bg-gray-800 px-4 py-2 rounded-xl shadow-sm">
                  <ClockIcon className="h-5 w-5 text-orange-500 mr-2" />
                  <span className="text-gray-700 dark:text-gray-300 font-medium">
                    {recipe.prep_time_minutes + recipe.cook_time_minutes} {t("recipes.minutes")}
                  </span>
                </div>

                <div className="flex items-center bg-white dark:bg-gray-800 px-4 py-2 rounded-xl shadow-sm">
                  <UsersIcon className="h-5 w-5 text-blue-500 mr-2" />
                  <span className="text-gray-700 dark:text-gray-300 font-medium">
                    {recipe.servings} {t("recipes.servings")}
                  </span>
                </div>

                <div className="flex items-center bg-white dark:bg-gray-800 px-4 py-2 rounded-xl shadow-sm">
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        disabled={!user}
                        onClick={() => handleStarClick(star)}
                        className={`h-5 w-5 focus:outline-none mr-1 transition-colors duration-200 ${
                          star <= userRating ? "text-yellow-400 fill-yellow-400" : "text-gray-300 hover:text-yellow-300"
                        }`}
                        aria-label={`${t("recipes.rate")} ${star} ${t("recipes.stars")}`}
                      >
                        <StarIcon className="h-5 w-5" />
                      </button>
                    ))}
                  </div>
                  <span className="ml-2 text-gray-700 dark:text-gray-300 font-medium">({recipe.rating_count})</span>
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
                      <p className="text-xs text-gray-500 dark:text-gray-400">Creador</p>
                    </div>
                  </div>
                )}

                <div className="flex items-center ml-auto gap-3">
                  {/* Edit Button - Only show if user is the creator */}
                  {user && recipe.created_by === user.id && (
                    <Link href={`/recipes/${recipe.id}/edit`}>
                      <Button variant="outline" size="sm" className="rounded-xl">
                        <EditIcon className="mr-2 h-4 w-4" />
                        Editar
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
                            href={`https://wa.me/?text=${encodeURIComponent(`¡Mira esta receta en NutriMate! ${shareUrl}`)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:bg-orange-50 dark:hover:bg-orange-900/20 rounded-lg px-3 py-2 text-sm transition-colors duration-200"
                          >
                            {t("recipes.shareWhatsApp")}
                          </a>
                          <a
                            href={`mailto:?subject=${encodeURIComponent(`Receta: ${recipe.name}`)}&body=${encodeURIComponent(`¡Mira esta receta en NutriMate!\n${shareUrl}`)}`}
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
          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
            {/* Left Column - Preparation (Main Content) */}
            <div className="lg:col-span-2">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <h2 className="text-3xl font-bold mb-8 text-gray-900 dark:text-white">{t("recipes.preparation")}</h2>

                {recipe.instructions && recipe.instructions.trim() ? (
                  <div className="space-y-6">
                    {(() => {
                      // Try multiple splitting strategies
                      let steps = []
                      
                      // First try splitting by double newlines (paragraph breaks)
                      if (recipe.instructions.includes('\n\n')) {
                        steps = recipe.instructions.split('\n\n')
                      }
                      // Then try single newlines
                      else if (recipe.instructions.includes('\n')) {
                        steps = recipe.instructions.split('\n')
                      }
                      // Try splitting by periods followed by space and capital letter
                      else if (recipe.instructions.match(/\.\s+[A-Z]/)) {
                        steps = recipe.instructions.split(/\.\s+(?=[A-Z])/).map(step => step.trim() + '.')
                      }
                      // Try splitting by numbers followed by period
                      else if (recipe.instructions.match(/\d+\./)) {
                        steps = recipe.instructions.split(/(?=\d+\.)/)
                      }
                      // If all else fails, try to split by common sentence endings
                      else if (recipe.instructions.match(/[.!?]\s+/)) {
                        steps = recipe.instructions.split(/(?<=[.!?])\s+/)
                      }
                      // Last resort: split by word count (every 20 words)
                      else {
                        const words = recipe.instructions.split(' ')
                        steps = []
                        for (let i = 0; i < words.length; i += 20) {
                          steps.push(words.slice(i, i + 20).join(' '))
                        }
                      }

                      return steps
                      .map((step, index) => {
                          // Clean up the step text
                          let cleanStep = step.trim()
                            .replace(/^\d+\.\s*/, '') // Remove leading numbers
                            .replace(/^[•\-*]\s*/, '') // Remove bullet points
                            .replace(/^\d+\)\s*/, '') // Remove numbered lists
                            .trim()
                          
                          if (!cleanStep) return null

                        return (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="flex bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700"
                          >
                            <div className="flex-shrink-0 mr-6">
                              <div className="flex items-center justify-center h-10 w-10 rounded-full bg-gradient-to-br from-orange-400 to-orange-500 text-white font-bold text-lg shadow-lg">
                                {index + 1}
                              </div>
                            </div>
                            <div className="flex-1">
                              <p 
                                className="text-gray-800 dark:text-gray-200 leading-relaxed text-lg" 
                                dangerouslySetInnerHTML={{ __html: cleanDescription(cleanStep) }} 
                              />
                            </div>
                          </motion.div>
                        )
                      })
                        .filter(Boolean)
                    })()}
                  </div>
                ) : (
                  <div className="text-gray-500 dark:text-gray-400 text-center py-12 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                    {t("recipes.noInstructionsAvailable")}
                  </div>
                )}

              </motion.div>
            </div>

            {/* Right Column - Ingredients (Sidebar) */}
            <div className="lg:col-span-1">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="sticky top-8"
              >
                <Card className="shadow-lg border-gray-200 dark:border-gray-700">
                  <CardHeader className="bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-t-xl">
                    <CardTitle className="text-xl">{t("recipes.ingredients")}</CardTitle>
                      <p className="text-orange-100">{t("recipes.forServings")} {recipe.servings}</p>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="space-y-4 mb-6">
                      {recipe.ingredients && recipe.ingredients.length > 0 ? (
                        recipe.ingredients.map((ingredient, index) => (
                          <div key={ingredient.id || index} className="flex items-start">
                            <Checkbox
                              id={ingredient.id || `ingredient-${index}`}
                              checked={selectedIngredients.includes(ingredient.id || `ingredient-${index}`)}
                              onCheckedChange={() => toggleIngredient(ingredient.id || `ingredient-${index}`)}
                              className="mt-1 mr-3"
                            />
                            <label 
                              htmlFor={ingredient.id || `ingredient-${index}`} 
                              className="cursor-pointer text-gray-700 dark:text-gray-300 text-sm leading-relaxed"
                            >
                              {ingredient.original ? ingredient.original : `${ingredient.amount} ${ingredient.name}`}
                            </label>
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

                {/* Nutrition Facts Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="mt-6"
            >
              <Card className="shadow-lg border-gray-200 dark:border-gray-700">
                      <CardHeader className="bg-white dark:bg-gray-800 rounded-t-xl">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-xl font-bold text-gray-900 dark:text-white">Nutrition Facts</CardTitle>
                          <div className="flex items-center space-x-2">
                            <span className="text-sm text-gray-500 dark:text-gray-400">Per Serving</span>
                            <span className="text-lg font-bold text-gray-900 dark:text-white">{recipe.calories || 0} kcal</span>
                          </div>
                        </div>
                </CardHeader>
                      <CardContent className="p-6">
                        {/* Summary Cards */}
                        <div className="grid grid-cols-2 gap-3 mb-6">
                          <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3 text-center">
                            <div className="flex items-center justify-center mb-2">
                              <CaloriesIcon className="h-5 w-5 text-green-600" />
                            </div>
                            <p className="text-sm font-medium text-green-800 dark:text-green-200">Calories</p>
                            <p className="text-lg font-bold text-green-600">{recipe.calories || 0} kcal</p>
                          </div>
                          <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-3 text-center">
                            <div className="flex items-center justify-center mb-2">
                              <svg className="h-5 w-5 text-orange-600" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
                              </svg>
                            </div>
                            <p className="text-sm font-medium text-orange-800 dark:text-orange-200">Carbs</p>
                            <p className="text-lg font-bold text-orange-600">{recipe.carbs || 0} gr</p>
                          </div>
                          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 text-center">
                            <div className="flex items-center justify-center mb-2">
                              <svg className="h-5 w-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                              </svg>
                            </div>
                            <p className="text-sm font-medium text-blue-800 dark:text-blue-200">Protein</p>
                            <p className="text-lg font-bold text-blue-600">{recipe.protein || 0} gr</p>
                          </div>
                          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 text-center">
                            <div className="flex items-center justify-center mb-2">
                              <svg className="h-5 w-5 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                              </svg>
                            </div>
                            <p className="text-sm font-medium text-gray-800 dark:text-gray-200">Fats</p>
                            <p className="text-lg font-bold text-gray-600">{recipe.fat || 0} gr</p>
                          </div>
                        </div>

                        {/* Detailed Nutrition List */}
                        <div className="space-y-2">
                          <div className="flex justify-between items-center py-1 border-b border-gray-100 dark:border-gray-700">
                            <span className="text-gray-700 dark:text-gray-300">Calories</span>
                            <span className="font-semibold text-gray-900 dark:text-white">{recipe.calories || 0} kcal</span>
                          </div>
                          <div className="flex justify-between items-center py-1 border-b border-gray-100 dark:border-gray-700">
                            <span className="text-gray-700 dark:text-gray-300">Carbohydrates</span>
                            <span className="font-semibold text-gray-900 dark:text-white">{recipe.carbs || 0} gr</span>
                          </div>
                          <div className="flex justify-between items-center py-1 border-b border-gray-100 dark:border-gray-700">
                            <span className="text-gray-700 dark:text-gray-300">Protein</span>
                            <span className="font-semibold text-gray-900 dark:text-white">{recipe.protein || 0} gr</span>
                          </div>
                          <div className="flex justify-between items-center py-1 border-b border-gray-100 dark:border-gray-700">
                            <span className="text-gray-700 dark:text-gray-300">Total Fat</span>
                            <span className="font-semibold text-gray-900 dark:text-white">{recipe.fat || 0} gr</span>
                          </div>
                          <div className="flex justify-between items-center py-1 border-b border-gray-100 dark:border-gray-700">
                            <span className="text-gray-700 dark:text-gray-300">Fiber</span>
                            <span className="font-semibold text-gray-900 dark:text-white">{recipe.fiber || 0} gr</span>
                          </div>
                          <div className="flex justify-between items-center py-1 border-b border-gray-100 dark:border-gray-700">
                            <span className="text-gray-700 dark:text-gray-300">Sodium</span>
                            <span className="font-semibold text-gray-900 dark:text-white">{recipe.sodium || 0} mg</span>
                      </div>
                          <div className="flex justify-between items-center py-1 border-b border-gray-100 dark:border-gray-700">
                            <span className="text-gray-700 dark:text-gray-300">Sugars</span>
                            <span className="font-semibold text-gray-900 dark:text-white">{recipe.sugar || 0} gr</span>
                      </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
              </motion.div>
            </div>
          </div>


          {/* Rating and Comments Section */}
          {user && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="mb-12"
            >
              <Card className="shadow-lg border-gray-200 dark:border-gray-700">
                <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700">
                  <CardTitle className="text-2xl text-gray-900 dark:text-white">{t("recipes.rate")} {t("recipes.recipe")}</CardTitle>
                </CardHeader>
                <CardContent className="p-8">
                  <div className="mb-6">
                    <div className="flex items-center mb-6">
                      <span className="text-lg font-medium text-gray-700 dark:text-gray-300 mr-6">{t("recipes.rate")}:</span>
                      <div className="flex">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => handleStarClick(star)}
                            className={`h-8 w-8 focus:outline-none mr-2 transition-colors duration-200 ${
                              star <= userRating ? "text-yellow-400 fill-yellow-400" : "text-gray-300 hover:text-yellow-300"
                            }`}
                            aria-label={`${t("recipes.rate")} ${star} ${t("recipes.stars")}`}
                          >
                            <StarIcon className="h-8 w-8" />
                          </button>
                        ))}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <Button 
                        onClick={handleSaveRating} 
                        disabled={savingRating || userRating === 0}
                        className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
                      >
                        {savingRating ? t("recipes.saving") : t("recipes.saveRating")}
                      </Button>
                      {showSavedMsg && (
                        <span className="text-green-600 dark:text-green-400 font-medium text-lg">
                          {t("recipes.saved")}
                        </span>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  )
}
