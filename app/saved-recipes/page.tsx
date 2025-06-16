"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Clock, Filter, ArrowUpDown, Share, Bookmark } from "lucide-react"
import { Sidebar } from "@/components/sidebar"
import Header from "@/components/header"

const categories = [
  { id: "all", label: "All Recipes", icon: "🍽️" },
  { id: "breakfast", label: "Breakfasts", icon: "🥞" },
  { id: "lunch", label: "Lunches", icon: "🥗" },
  { id: "dessert", label: "Desserts", icon: "🧁" },
  { id: "dinner", label: "Dinner", icon: "🍽️" },
  { id: "sides", label: "Sides", icon: "🥖" },
  { id: "snacks", label: "Snacks", icon: "🥨" },
  { id: "soups", label: "Soups", icon: "🍲" },
  { id: "vegan", label: "Vegan", icon: "🌱" },
]

const savedRecipes = [
  {
    id: 1,
    title: "Salad Caprese Pasta Spaghetti",
    category: "Fresh Salad",
    time: "30 mins",
    image: "/placeholder.svg?height=200&width=300&text=Caprese+Pasta",
    saved: true,
  },
  {
    id: 2,
    title: "Tuscan Panzanella Cherry",
    category: "Fresh Salad",
    time: "30 mins",
    image: "/placeholder.svg?height=200&width=300&text=Panzanella",
    saved: true,
  },
  {
    id: 3,
    title: "Ketogenic Diet Dinner with Eggs",
    category: "Sashimi Special",
    time: "20 mins",
    image: "/placeholder.svg?height=200&width=300&text=Keto+Dinner",
    saved: true,
  },
  {
    id: 4,
    title: "Potato Gnocchi Traditional Homemade",
    category: "Fresh Salad",
    time: "15 mins",
    image: "/placeholder.svg?height=200&width=300&text=Gnocchi",
    saved: true,
  },
  {
    id: 5,
    title: "Fresh Green Salad with Grilled Chicken",
    category: "Fresh Salad",
    time: "30 mins",
    image: "/placeholder.svg?height=200&width=300&text=Green+Salad",
    saved: true,
  },
  {
    id: 6,
    title: "Fresh Boiled New Young Potatoes",
    category: "Fresh Salad",
    time: "30 mins",
    image: "/placeholder.svg?height=200&width=300&text=Boiled+Potatoes",
    saved: true,
  },
  {
    id: 7,
    title: "Tuscan Panzanella Cherry & Tomato",
    category: "Fresh Salad",
    time: "20 mins",
    image: "/placeholder.svg?height=200&width=300&text=Cherry+Tomato",
    saved: true,
  },
  {
    id: 8,
    title: "Tuna Salad with Pasta Eggs Potatoes Olives",
    category: "Spaghetti Special",
    time: "15 mins",
    image: "/placeholder.svg?height=200&width=300&text=Tuna+Salad",
    saved: true,
  },
]

export default function SavedRecipesPage() {
  const [selectedCategory, setSelectedCategory] = useState("all")

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />

      <div className="flex-1 flex flex-col">
        <Header />

        <main className="flex-1 p-6">
          {/* Page Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Saved Recipes</h1>
              <p className="text-gray-600">{savedRecipes.length} recipes</p>
            </div>

            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Filters
              </Button>
              <Button variant="outline" size="sm">
                <ArrowUpDown className="h-4 w-4 mr-2" />
                Sort
              </Button>
              <Button variant="outline" size="sm">
                <Share className="h-4 w-4 mr-2" />
                Share
              </Button>
            </div>
          </div>

          {/* Category Filters */}
          <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
            {categories.map((category) => (
              <Button
                key={category.id}
                variant={selectedCategory === category.id ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category.id)}
                className="flex items-center gap-2 whitespace-nowrap"
              >
                <span>{category.icon}</span>
                {category.label}
              </Button>
            ))}
          </div>

          {/* Recipe Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {savedRecipes.map((recipe) => (
              <div
                key={recipe.id}
                className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow"
              >
                <div className="relative">
                  <img
                    src={recipe.image || "/placeholder.svg"}
                    alt={recipe.title}
                    className="w-full h-48 object-cover"
                  />
                  <div className="absolute top-3 left-3 bg-white px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {recipe.time}
                  </div>
                  <Button size="icon" variant="ghost" className="absolute top-3 right-3 bg-white/80 hover:bg-white">
                    <Bookmark className="h-4 w-4 fill-orange-600 text-orange-600" />
                  </Button>
                </div>

                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2">{recipe.title}</h3>
                  <p className="text-sm text-gray-600">{recipe.category}</p>
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>
    </div>
  )
}
