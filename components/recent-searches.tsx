"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Apple, Beef, Plus, Search } from "lucide-react"
import Link from "next/link"

export default function RecentSearches() {
  // Mock data for recent searches
  const recentSearches = [
    {
      id: 1,
      type: "meal",
      title: "Vegetarian, Low-Carb",
      dates: "Mon 5/20 - Sun 5/26",
      details: "3 meals per day",
      price: "$4.99",
    },
    {
      id: 2,
      type: "recipe",
      title: "High Protein Meals",
      dates: "Thu 5/23 - Fri 5/24",
      details: "1 person, 4 meals",
      price: "View recipes",
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {recentSearches.map((search) => (
        <Card key={search.id} className="border border-gray-200 rounded-lg overflow-hidden">
          <div className="p-4">
            <div className="flex items-start mb-3">
              <div className="bg-gray-100 rounded-full p-2 mr-3">
                {search.type === "meal" ? (
                  <Apple className="h-5 w-5 text-gray-600" />
                ) : (
                  <Beef className="h-5 w-5 text-gray-600" />
                )}
              </div>
              <div>
                <h3 className="font-medium">{search.title}</h3>
                <div className="text-sm text-gray-500">{search.dates}</div>
                <div className="text-sm text-gray-500">{search.details}</div>
              </div>
            </div>

            <div className="flex justify-between items-center">
              <div className="font-bold text-xl">{search.price}</div>
              <Button size="sm" className="bg-orange-500 hover:bg-orange-600 rounded-full w-10 h-10 p-0">
                <Search className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </Card>
      ))}

      <Card className="border border-gray-200 border-dashed rounded-lg overflow-hidden flex flex-col items-center justify-center p-8">
        <div className="bg-gray-100 rounded-full p-4 mb-4">
          <Plus className="h-6 w-6 text-gray-400" />
        </div>
        <h3 className="font-medium text-center mb-2">Start a new search</h3>
        <div className="grid grid-cols-4 gap-2 w-full max-w-xs mt-2">
          <Link href="/meals" className="bg-orange-500 text-white rounded p-2 flex flex-col items-center">
            <Apple className="h-4 w-4" />
          </Link>
          <Link href="/recipes" className="bg-gray-100 text-gray-600 rounded p-2 flex flex-col items-center">
            <Beef className="h-4 w-4" />
          </Link>
          <Link href="/ingredients" className="bg-gray-100 text-gray-600 rounded p-2 flex flex-col items-center">
            <svg
              className="h-4 w-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M20 7h-9"></path>
              <path d="M14 17H5"></path>
              <circle cx="17" cy="17" r="3"></circle>
              <circle cx="7" cy="7" r="3"></circle>
            </svg>
          </Link>
          <Link href="/groceries" className="bg-gray-100 text-gray-600 rounded p-2 flex flex-col items-center">
            <svg
              className="h-4 w-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <path d="M16 10a4 4 0 0 1-8 0"></path>
            </svg>
          </Link>
        </div>
      </Card>
    </div>
  )
}
