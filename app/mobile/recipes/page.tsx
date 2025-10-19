"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Search, Filter, Clock, Users, Star, ChevronRight } from "lucide-react"
import { mockRecipes } from "@/lib/mock-data"
import { useLanguage } from "@/lib/i18n/context"

export default function MobileRecipesPage() {
  const { t } = useLanguage()
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")

  const categories = [
    { id: "all", name: "Todas", count: mockRecipes.length },
    { id: "breakfast", name: "Desayuno", count: 12 },
    { id: "lunch", name: "Almuerzo", count: 25 },
    { id: "dinner", name: "Cena", count: 18 },
    { id: "snacks", name: "Snacks", count: 8 },
  ]

  const filteredRecipes = mockRecipes.filter(recipe => {
    const matchesSearch = recipe.title.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === "all" || recipe.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header con búsqueda */}
      <div className="bg-white px-6 py-4 shadow-sm">
        <div className="flex items-center space-x-3 mb-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar recetas..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-gray-100 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-300 focus:bg-white"
            />
          </div>
          <button className="p-3 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors">
            <Filter className="h-5 w-5 text-gray-600" />
          </button>
        </div>

        {/* Categorías */}
        <div className="flex space-x-2 overflow-x-auto pb-2">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                selectedCategory === category.id
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {category.name} ({category.count})
            </button>
          ))}
        </div>
      </div>

      {/* Lista de recetas */}
      <div className="px-6 py-4">
        <div className="space-y-4">
          {filteredRecipes.map((recipe) => (
            <Link key={recipe.id} href={`/mobile/recipes/${recipe.slug}`}>
              <div className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                <div className="flex">
                  <div className="w-32 h-32 relative">
                    <Image
                      src={recipe.image || "/placeholder.svg?height=128&width=128"}
                      alt={recipe.title}
                      fill
                      className="object-cover"
                    />
                    <div className="absolute top-2 right-2">
                      <button className="p-2 bg-white/90 rounded-full hover:bg-white transition-colors">
                        <Star className="h-4 w-4 text-yellow-500" />
                      </button>
                    </div>
                  </div>
                  <div className="flex-1 p-4">
                    <h3 className="font-medium text-gray-900 mb-2 line-clamp-2">
                      {recipe.title}
                    </h3>
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
                      <ChevronRight className="h-5 w-5 text-gray-400" />
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {filteredRecipes.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No se encontraron recetas</h3>
            <p className="text-gray-500">Intenta con otros términos de búsqueda</p>
          </div>
        )}
      </div>
    </div>
  )
}
