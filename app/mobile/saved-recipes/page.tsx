"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Search, Heart, Clock, Users, Star, Trash2, Filter } from "lucide-react"
import { mockRecipes } from "@/lib/mock-data"
import { useLanguage } from "@/lib/i18n/context"

export default function MobileSavedRecipesPage() {
  const { t } = useLanguage()
  const [searchQuery, setSearchQuery] = useState("")
  const [savedRecipes, setSavedRecipes] = useState(mockRecipes.slice(0, 6))
  const [sortBy, setSortBy] = useState("recent")

  const filteredRecipes = savedRecipes.filter(recipe =>
    recipe.title.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const removeRecipe = (id: string) => {
    setSavedRecipes(savedRecipes.filter(recipe => recipe.id !== id))
  }

  const sortRecipes = (recipes: typeof savedRecipes) => {
    switch (sortBy) {
      case "name":
        return [...recipes].sort((a, b) => a.title.localeCompare(b.title))
      case "rating":
        return [...recipes].sort((a, b) => (b.rating || 0) - (a.rating || 0))
      case "time":
        return [...recipes].sort((a, b) => {
          const timeA = parseInt(a.prepTime?.replace(/\D/g, '') || '0')
          const timeB = parseInt(b.prepTime?.replace(/\D/g, '') || '0')
          return timeA - timeB
        })
      default:
        return recipes
    }
  }

  const sortedRecipes = sortRecipes(filteredRecipes)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white px-6 py-4 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Recetas guardadas</h1>
            <p className="text-sm text-gray-500">
              {savedRecipes.length} recetas guardadas
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <button className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
              <Filter className="h-5 w-5 text-gray-600" />
            </button>
          </div>
        </div>

        {/* Barra de búsqueda */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar en recetas guardadas..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-gray-100 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-300 focus:bg-white"
          />
        </div>

        {/* Filtros de ordenamiento */}
        <div className="flex space-x-2 overflow-x-auto pb-2">
          {[
            { id: "recent", name: "Recientes" },
            { id: "name", name: "Nombre" },
            { id: "rating", name: "Calificación" },
            { id: "time", name: "Tiempo" }
          ].map((option) => (
            <button
              key={option.id}
              onClick={() => setSortBy(option.id)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                sortBy === option.id
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {option.name}
            </button>
          ))}
        </div>
      </div>

      {/* Lista de recetas */}
      <div className="px-6 py-4">
        {sortedRecipes.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Heart className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchQuery ? 'No se encontraron recetas' : 'Sin recetas guardadas'}
            </h3>
            <p className="text-gray-500 mb-4">
              {searchQuery 
                ? 'Intenta con otros términos de búsqueda' 
                : 'Guarda recetas que te gusten para acceder fácilmente'
              }
            </p>
            {!searchQuery && (
              <Link
                href="/mobile/recipes"
                className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Explorar recetas
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {sortedRecipes.map((recipe) => (
              <div key={recipe.id} className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                <div className="flex">
                  <div className="w-24 h-24 relative">
                    <Image
                      src={recipe.image || "/placeholder.svg?height=96&width=96"}
                      alt={recipe.title}
                      fill
                      className="object-cover"
                    />
                    <button
                      onClick={() => removeRecipe(recipe.id)}
                      className="absolute top-2 right-2 p-1 bg-white/90 rounded-full hover:bg-white transition-colors"
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </button>
                  </div>
                  <div className="flex-1 p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-medium text-gray-900 line-clamp-2 flex-1">
                        {recipe.title}
                      </h3>
                      <button className="ml-2 p-1 text-red-500 hover:text-red-700 transition-colors">
                        <Heart className="h-5 w-5 fill-current" />
                      </button>
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                      {recipe.description}
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-1" />
                          {recipe.prepTime}
                        </div>
                        <div className="flex items-center">
                          <Users className="h-4 w-4 mr-1" />
                          {recipe.servings}
                        </div>
                        <div className="flex items-center">
                          <Star className="h-4 w-4 mr-1 text-yellow-500" />
                          {recipe.rating}
                        </div>
                      </div>
                      <Link
                        href={`/mobile/recipes/${recipe.slug}`}
                        className="text-green-600 hover:text-green-700 text-sm font-medium"
                      >
                        Ver receta
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Acciones rápidas */}
      {savedRecipes.length > 0 && (
        <div className="px-6 pb-6">
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <h3 className="font-medium text-gray-900 mb-4">Acciones rápidas</h3>
            <div className="grid grid-cols-2 gap-3">
              <button className="flex items-center justify-center space-x-2 py-3 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors">
                <Heart className="h-4 w-4" />
                <span className="text-sm font-medium">Crear menú</span>
              </button>
              <button className="flex items-center justify-center space-x-2 py-3 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors">
                <Users className="h-4 w-4" />
                <span className="text-sm font-medium">Compartir</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
