"use client"

import Link from "next/link"
import Image from "next/image"
import { Search, Bookmark, ChevronRight, TrendingUp, Clock, Users, Star, ChefHat, ShoppingCart, Calendar, Target } from "lucide-react"
import { mockRecipes } from "@/lib/mock-data"
import { useLanguage } from "@/lib/i18n/context"
import { useAuthContext } from "@/components/auth/simple-auth-provider"

export default function MobileHomePage() {
  const { t } = useLanguage()
  const { user } = useAuthContext()

  // Obtener nombre del usuario
  const userName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User'

  // Obtener recetas destacadas
  const featuredRecipes = mockRecipes.slice(0, 3)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-green-500 to-green-600 px-6 py-8 text-white">
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-2">
            ¡Hola, {userName}! 👋
          </h1>
          <p className="text-green-100 text-sm">
            ¿Qué vas a cocinar hoy?
          </p>
        </div>
        
        {/* Barra de búsqueda */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar recetas..."
            className="w-full pl-10 pr-4 py-3 bg-white rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-300"
          />
        </div>
      </div>

      {/* Stats Cards */}
      <div className="px-6 -mt-4 mb-6">
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <div className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-lg mb-2">
              <TrendingUp className="h-4 w-4 text-blue-600" />
            </div>
            <p className="text-xs text-gray-500">Calorías</p>
            <p className="text-lg font-bold text-gray-900">1,850</p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <div className="flex items-center justify-center w-8 h-8 bg-green-100 rounded-lg mb-2">
              <Clock className="h-4 w-4 text-green-600" />
            </div>
            <p className="text-xs text-gray-500">Tiempo</p>
            <p className="text-lg font-bold text-gray-900">45m</p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <div className="flex items-center justify-center w-8 h-8 bg-purple-100 rounded-lg mb-2">
              <Users className="h-4 w-4 text-purple-600" />
            </div>
            <p className="text-xs text-gray-500">Porciones</p>
            <p className="text-lg font-bold text-gray-900">4</p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="px-6 mb-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Acciones rápidas</h2>
        <div className="grid grid-cols-2 gap-4">
          <Link href="/mobile/recipes" className="bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <ChefHat className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">Recetas</p>
                <p className="text-sm text-gray-500">Explorar platos</p>
              </div>
            </div>
          </Link>
          <Link href="/mobile/grocery-list" className="bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <ShoppingCart className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">Lista de compras</p>
                <p className="text-sm text-gray-500">Organizar compras</p>
              </div>
            </div>
          </Link>
          <Link href="/mobile/calendar" className="bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Calendar className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">Planificación</p>
                <p className="text-sm text-gray-500">Organizar comidas</p>
              </div>
            </div>
          </Link>
          <Link href="/mobile/goals" className="bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Target className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">Metas</p>
                <p className="text-sm text-gray-500">Seguir objetivos</p>
              </div>
            </div>
          </Link>
        </div>
      </div>

      {/* Featured Recipes */}
      <div className="px-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-900">Recetas destacadas</h2>
          <Link href="/mobile/recipes" className="text-green-600 text-sm font-medium flex items-center">
            Ver todas <ChevronRight className="ml-1 h-4 w-4" />
          </Link>
        </div>
        
        <div className="space-y-4">
          {featuredRecipes.map((recipe, index) => (
            <Link key={recipe.id} href={`/mobile/recipes/${recipe.slug}`}>
              <div className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                <div className="flex">
                  <div className="w-24 h-24 relative">
                    <Image
                      src={recipe.image || "/placeholder.svg?height=96&width=96"}
                      alt={recipe.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1 p-4">
                    <h3 className="font-medium text-gray-900 mb-1 line-clamp-2">
                      {recipe.title}
                    </h3>
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
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="px-6 mb-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Actividad reciente</h2>
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <ChefHat className="h-4 w-4 text-green-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">Receta guardada</p>
                <p className="text-xs text-gray-500">Pollo al curry hace 2 horas</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <ShoppingCart className="h-4 w-4 text-blue-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">Lista actualizada</p>
                <p className="text-xs text-gray-500">Agregaste 3 ingredientes</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                <Target className="h-4 w-4 text-purple-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">Meta alcanzada</p>
                <p className="text-xs text-gray-500">Consumiste 5 vegetales hoy</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}