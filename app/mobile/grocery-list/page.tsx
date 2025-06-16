"use client"

import { useState } from "react"
import { Search, Plus, Check } from "lucide-react"
import MobileHeader from "@/components/mobile-header"
import MobileNavigation from "@/components/mobile-navigation"
import { mockGroceryList } from "@/lib/mock-data"

export default function MobileGroceryListPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [groceryItems, setGroceryItems] = useState(mockGroceryList)

  // Flatten the grocery list for easier searching
  const allItems = Object.entries(groceryItems).flatMap(([category, items]) =>
    items.map((item) => ({ ...item, category })),
  )

  // Filter items based on search
  const filteredItems = searchQuery
    ? allItems.filter((item) => item.name.toLowerCase().includes(searchQuery.toLowerCase()))
    : []

  const toggleItemCheck = (category: string, itemName: string) => {
    setGroceryItems((prev) => {
      const updatedItems = { ...prev }
      const itemIndex = updatedItems[category].findIndex((item) => item.name === itemName)

      if (itemIndex !== -1) {
        updatedItems[category][itemIndex] = {
          ...updatedItems[category][itemIndex],
          checked: !updatedItems[category][itemIndex].checked,
        }
      }

      return updatedItems
    })
  }

  return (
    <div className="bg-cream-50 min-h-screen pb-20">
      <MobileHeader />

      {/* Search Bar */}
      <div className="px-4 mt-4">
        <div className="relative">
          <input
            type="text"
            placeholder="Search grocery items..."
            className="w-full bg-white rounded-full py-2 pl-10 pr-4 border border-gray-200"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
        </div>
      </div>

      {/* Search Results */}
      {searchQuery && (
        <div className="px-4 mt-4">
          <h2 className="text-sm font-medium text-gray-500 mb-2">Search Results</h2>
          <div className="bg-white rounded-lg shadow-sm">
            {filteredItems.length > 0 ? (
              filteredItems.map((item, index) => (
                <div
                  key={`${item.category}-${item.name}-${index}`}
                  className="flex items-center justify-between p-4 border-b border-gray-100 last:border-b-0"
                >
                  <div className="flex items-center">
                    <button
                      className={`w-6 h-6 rounded-full border ${
                        item.checked ? "bg-green-600 border-green-600" : "border-gray-300"
                      } flex items-center justify-center mr-3`}
                      onClick={() => toggleItemCheck(item.category, item.name)}
                    >
                      {item.checked && <Check className="h-4 w-4 text-white" />}
                    </button>
                    <span className={item.checked ? "line-through text-gray-400" : ""}>{item.name}</span>
                  </div>
                  <span className="text-sm text-gray-500">
                    {item.quantity} {item.unit}
                  </span>
                </div>
              ))
            ) : (
              <div className="p-4 text-center text-gray-500">No items found</div>
            )}
          </div>
        </div>
      )}

      {/* Categories */}
      {!searchQuery && (
        <div className="px-4 mt-4 pb-20">
          {Object.entries(groceryItems).map(([category, items]) => (
            <div key={category} className="mb-6">
              <h2 className="text-lg font-bold capitalize mb-2">{category}</h2>
              <div className="bg-white rounded-lg shadow-sm">
                {items.map((item, index) => (
                  <div
                    key={`${item.name}-${index}`}
                    className="flex items-center justify-between p-4 border-b border-gray-100 last:border-b-0"
                  >
                    <div className="flex items-center">
                      <button
                        className={`w-6 h-6 rounded-full border ${
                          item.checked ? "bg-green-600 border-green-600" : "border-gray-300"
                        } flex items-center justify-center mr-3`}
                        onClick={() => toggleItemCheck(category, item.name)}
                      >
                        {item.checked && <Check className="h-4 w-4 text-white" />}
                      </button>
                      <span className={item.checked ? "line-through text-gray-400" : ""}>{item.name}</span>
                    </div>
                    <span className="text-sm text-gray-500">
                      {item.quantity} {item.unit}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Button */}
      <button className="fixed bottom-20 right-4 bg-green-600 text-white rounded-full w-14 h-14 flex items-center justify-center shadow-lg">
        <Plus className="h-6 w-6" />
      </button>

      <MobileNavigation />
    </div>
  )
}
