"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { ChevronDown, Filter, Clock, Star } from "lucide-react"
import MobileHeader from "@/components/mobile-header"
import MobileNavigation from "@/components/mobile-navigation"

export default function MobileMealPlansPage() {
  const [activeFilter, setActiveFilter] = useState("All")

  const filters = ["All", "Vegetarian", "High Protein", "Low Carb", "Keto", "Mediterranean"]

  const mealPlans = [
    {
      id: 1,
      name: "Healthy Greens",
      category: "Vegetarian",
      image: "/placeholder.svg?height=200&width=300",
      rating: 9.7,
      time: "20-30 min",
      price: "$",
    },
    {
      id: 2,
      name: "Protein Power",
      category: "High Protein",
      image: "/placeholder.svg?height=200&width=300",
      rating: 9.3,
      time: "15-25 min",
      price: "$$",
    },
    {
      id: 3,
      name: "Mediterranean Diet",
      category: "Mediterranean",
      image: "/placeholder.svg?height=200&width=300",
      rating: 9.5,
      time: "25-35 min",
      price: "$$",
    },
    {
      id: 4,
      name: "Keto Essentials",
      category: "Keto",
      image: "/placeholder.svg?height=200&width=300",
      rating: 9.2,
      time: "15-25 min",
      price: "$$",
    },
    {
      id: 5,
      name: "Low Carb Favorites",
      category: "Low Carb",
      image: "/placeholder.svg?height=200&width=300",
      rating: 9.0,
      time: "20-30 min",
      price: "$",
    },
  ]

  const filteredMealPlans =
    activeFilter === "All" ? mealPlans : mealPlans.filter((plan) => plan.category === activeFilter)

  return (
    <div className="bg-cream-50 min-h-screen pb-20">
      <MobileHeader />

      {/* Filters */}
      <div className="px-4 mt-4">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center space-x-2">
            <h2 className="text-xl font-bold">Meal Plans</h2>
            <ChevronDown className="h-5 w-5" />
          </div>
          <button className="flex items-center space-x-1">
            <Filter className="h-5 w-5" />
            <span className="text-sm">Filters</span>
          </button>
        </div>

        <div className="flex overflow-x-auto pb-4 -mx-4 px-4 space-x-2 hide-scrollbar">
          {filters.map((filter) => (
            <button
              key={filter}
              className={`px-4 py-2 rounded-full text-sm whitespace-nowrap ${
                activeFilter === filter ? "bg-green-600 text-white" : "bg-white text-gray-700 border border-gray-200"
              }`}
              onClick={() => setActiveFilter(filter)}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      {/* Meal Plans */}
      <div className="px-4 mt-4 pb-20">
        <div className="grid grid-cols-1 gap-4">
          {filteredMealPlans.map((plan) => (
            <Link href={`/mobile/meal-plans/${plan.id}`} key={plan.id}>
              <div className="bg-white rounded-lg overflow-hidden shadow-sm">
                <div className="relative h-48">
                  <Image src={plan.image || "/placeholder.svg"} alt={plan.name} fill className="object-cover" />
                  <div className="absolute top-2 right-2 bg-white text-green-600 rounded-full px-2 py-1 text-sm font-bold flex items-center">
                    <Star className="h-4 w-4 mr-1 fill-green-600 text-green-600" />
                    {plan.rating}
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="text-lg font-bold">{plan.name}</h3>
                  <div className="flex justify-between items-center mt-2">
                    <div className="text-sm text-gray-600">{plan.category}</div>
                    <div className="text-sm text-gray-600">{plan.price}</div>
                  </div>
                  <div className="flex items-center mt-2 text-sm text-gray-600">
                    <Clock className="h-4 w-4 mr-1" />
                    {plan.time}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      <MobileNavigation />
    </div>
  )
}
