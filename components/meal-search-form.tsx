"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { ChevronDown, Search } from "lucide-react"
import Link from "next/link"

export default function MealSearchForm() {
  const [dietType, setDietType] = useState("Any")
  const [calories, setCalories] = useState("Any")
  const [mealCount, setMealCount] = useState("3 meals")
  const [dietDropdownOpen, setDietDropdownOpen] = useState(false)
  const [caloriesDropdownOpen, setCaloriesDropdownOpen] = useState(false)
  const [mealCountDropdownOpen, setMealCountDropdownOpen] = useState(false)

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="flex flex-col md:flex-row">
        <div className="flex-1 p-3 border-b md:border-b-0 md:border-r border-gray-200">
          <div className="flex items-center">
            <div className="flex-1">
              <label className="block text-xs text-gray-500 mb-1">Diet Type</label>
              <div className="relative">
                <button
                  className="flex items-center justify-between w-full text-left"
                  onClick={() => setDietDropdownOpen(!dietDropdownOpen)}
                >
                  <span>{dietType}</span>
                  <ChevronDown className="h-4 w-4 text-gray-400" />
                </button>

                {dietDropdownOpen && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-10">
                    <div className="p-2">
                      {["Any", "Vegetarian", "Vegan", "Keto", "Paleo", "Mediterranean"].map((diet) => (
                        <div
                          key={diet}
                          className="px-2 py-1 hover:bg-gray-100 cursor-pointer rounded"
                          onClick={() => {
                            setDietType(diet)
                            setDietDropdownOpen(false)
                          }}
                        >
                          {diet}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 p-3 border-b md:border-b-0 md:border-r border-gray-200">
          <div className="flex items-center">
            <div className="flex-1">
              <label className="block text-xs text-gray-500 mb-1">Calories</label>
              <div className="relative">
                <button
                  className="flex items-center justify-between w-full text-left"
                  onClick={() => setCaloriesDropdownOpen(!caloriesDropdownOpen)}
                >
                  <span>{calories}</span>
                  <ChevronDown className="h-4 w-4 text-gray-400" />
                </button>

                {caloriesDropdownOpen && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-10">
                    <div className="p-2">
                      {["Any", "Under 500", "500-800", "800-1200", "1200-1500", "1500+"].map((option) => (
                        <div
                          key={option}
                          className="px-2 py-1 hover:bg-gray-100 cursor-pointer rounded"
                          onClick={() => {
                            setCalories(option)
                            setCaloriesDropdownOpen(false)
                          }}
                        >
                          {option}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 p-3 border-b md:border-b-0 md:border-r border-gray-200">
          <div className="flex items-center">
            <div className="flex-1">
              <label className="block text-xs text-gray-500 mb-1">Meal Count</label>
              <div className="relative">
                <button
                  className="flex items-center justify-between w-full text-left"
                  onClick={() => setMealCountDropdownOpen(!mealCountDropdownOpen)}
                >
                  <span>{mealCount}</span>
                  <ChevronDown className="h-4 w-4 text-gray-400" />
                </button>

                {mealCountDropdownOpen && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-10">
                    <div className="p-2">
                      {["2 meals", "3 meals", "4 meals", "5 meals"].map((option) => (
                        <div
                          key={option}
                          className="px-2 py-1 hover:bg-gray-100 cursor-pointer rounded"
                          onClick={() => {
                            setMealCount(option)
                            setMealCountDropdownOpen(false)
                          }}
                        >
                          {option}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="p-3 flex items-end">
          <Link href="/dashboard">
            <Button className="bg-orange-500 hover:bg-orange-600">
              <Search className="h-4 w-4 mr-2" />
              Search
            </Button>
          </Link>
        </div>
      </div>

      <div className="px-3 py-2 bg-gray-50 border-t border-gray-200 flex items-center">
        <Checkbox id="direct-only" />
        <Label htmlFor="direct-only" className="ml-2 text-sm text-gray-600">
          Exclude recipes with allergens
        </Label>
      </div>
    </div>
  )
}
