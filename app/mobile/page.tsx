"use client"

import Link from "next/link"
import Image from "next/image"
import { Search, Bookmark, ChevronRight } from "lucide-react"
import { mockRecipes } from "@/lib/mock-data"
import MobileNavigation from "@/components/mobile-navigation"

export default function MobileHomePage() {
  return (
    <div className="bg-white min-h-screen pb-20">
      {/* Header */}
      <header className="px-4 py-4 border-b border-gray-200 flex items-center justify-between">
        <div className="flex items-center">
          <span className="text-orange-600 font-serif text-2xl font-bold">NutriMate</span>
        </div>
        <div className="flex items-center space-x-4">
          <button>
            <Search className="h-6 w-6 text-gray-700" />
          </button>
          <button>
            <Bookmark className="h-6 w-6 text-gray-700" />
          </button>
        </div>
      </header>

      {/* Featured Recipe */}
      <div className="px-4 py-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-serif font-bold">Recipe of the Day</h2>
          <Link href="/mobile/recipes" className="text-orange-600">
            <ChevronRight className="h-5 w-5" />
          </Link>
        </div>

        <Link href="/mobile/recipes/grilled-salmon-with-roasted-vegetables">
          <div className="relative rounded-lg overflow-hidden mb-3">
            <div className="aspect-w-16 aspect-h-9 w-full">
              <Image
                src="/placeholder.svg?height=300&width=500"
                alt="Featured Recipe"
                width={500}
                height={300}
                className="object-cover w-full"
              />
            </div>
            <div className="absolute top-3 left-3 bg-orange-600 text-white text-xs font-bold uppercase tracking-wide px-2 py-1 rounded-full">
              Featured
            </div>
          </div>
          <h3 className="font-serif font-bold text-xl">Grilled Salmon with Roasted Vegetables</h3>
          <div className="flex items-center text-sm text-gray-500 mt-1">
            <span>40 minutes</span>
            <span className="mx-2">•</span>
            <div className="flex">
              {[1, 2, 3, 4, 5].map((star) => (
                <svg key={star} className="h-4 w-4 text-yellow-400 fill-yellow-400" viewBox="0 0 24 24">
                  <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                </svg>
              ))}
            </div>
            <span className="ml-1">(42)</span>
          </div>
        </Link>
      </div>

      {/* Collections */}
      <div className="px-4 py-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-serif font-bold">Collections</h2>
          <Link href="/mobile/collections" className="text-orange-600">
            <ChevronRight className="h-5 w-5" />
          </Link>
        </div>

        <div className="flex overflow-x-auto space-x-4 pb-4 -mx-4 px-4 hide-scrollbar">
          {[
            { title: "Healthy Weeknight Dinners", image: "/placeholder.svg?height=200&width=300" },
            { title: "High-Protein Meals", image: "/placeholder.svg?height=200&width=300" },
            { title: "Mediterranean Diet", image: "/placeholder.svg?height=200&width=300" },
          ].map((collection, index) => (
            <Link href={`/mobile/collections/${index}`} key={index} className="flex-shrink-0 w-64">
              <div className="relative rounded-lg overflow-hidden">
                <div className="aspect-w-16 aspect-h-9 w-full">
                  <Image
                    src={collection.image || "/placeholder.svg"}
                    alt={collection.title}
                    width={300}
                    height={200}
                    className="object-cover w-full"
                  />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex flex-col justify-end p-4">
                  <h3 className="text-white font-medium text-sm">{collection.title}</h3>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent Recipes */}
      <div className="px-4 py-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-serif font-bold">Recent Recipes</h2>
          <Link href="/mobile/recipes" className="text-orange-600">
            <ChevronRight className="h-5 w-5" />
          </Link>
        </div>

        <div className="space-y-6">
          {mockRecipes.slice(0, 4).map((recipe) => (
            <Link
              href={`/mobile/recipes/${encodeURIComponent(recipe.name.toLowerCase().replace(/\s+/g, "-"))}`}
              key={recipe.id}
              className="flex items-center"
            >
              <div className="relative w-24 h-24 rounded-lg overflow-hidden flex-shrink-0">
                <Image
                  src={`/placeholder.svg?height=100&width=100&query=${recipe.name}`}
                  alt={recipe.name}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="ml-4 flex-1">
                <h3 className="font-medium">{recipe.name}</h3>
                <div className="flex items-center text-sm text-gray-500 mt-1">
                  <span>{recipe.prepTimeMinutes + recipe.cookTimeMinutes} minutes</span>
                </div>
                <div className="flex mt-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <svg key={star} className="h-3 w-3 text-yellow-400 fill-yellow-400" viewBox="0 0 24 24">
                      <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                    </svg>
                  ))}
                </div>
              </div>
              <ChevronRight className="h-5 w-5 text-gray-400" />
            </Link>
          ))}
        </div>
      </div>

      {/* Mobile Navigation */}
      <MobileNavigation />
    </div>
  )
}
