"use client"

import type React from "react"

import { useState } from "react"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, Plus } from "lucide-react"
import { useLanguage } from "@/lib/i18n/context"

interface GroceryItem {
  name: string
  quantity: string
  unit: string | null
  recipes: string[]
  checked?: boolean
}

interface GroceryListProps {
  groceryList: Record<string, GroceryItem[]>
  setGroceryList: React.Dispatch<React.SetStateAction<Record<string, GroceryItem[]>>>
}

export default function GroceryListComponent({ groceryList, setGroceryList }: GroceryListProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [newItem, setNewItem] = useState("")
  const [newItemCategory, setNewItemCategory] = useState("produce")
  const [newItemQuantity, setNewItemQuantity] = useState("")
  const [showAddForm, setShowAddForm] = useState(false)
  const { t } = useLanguage()

  const toggleItemCheck = (category: string, itemName: string) => {
    setGroceryList((prev) => {
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

  const addNewItem = () => {
    if (!newItem.trim()) return

    setGroceryList((prev) => {
      const updatedItems = { ...prev }

      if (!updatedItems[newItemCategory]) {
        updatedItems[newItemCategory] = []
      }

      updatedItems[newItemCategory].push({
        name: newItem,
        quantity: newItemQuantity || "1",
        unit: null,
        recipes: ["Custom"],
        checked: false,
      })

      return updatedItems
    })

    setNewItem("")
    setNewItemQuantity("")
    setShowAddForm(false)
  }

  // Filter items based on search query
  const filteredItems = Object.entries(groceryList).reduce(
    (acc, [category, categoryItems]) => {
      const filtered = categoryItems.filter((item) => item.name.toLowerCase().includes(searchQuery.toLowerCase()))

      if (filtered.length > 0) {
        acc[category] = filtered
      }

      return acc
    },
    {} as Record<string, GroceryItem[]>,
  )

  return (
    <div>
      <div className="flex items-center space-x-2 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500 dark:text-gray-400" />
          <Input
            type="search"
            placeholder="Search items..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Button
          variant="outline"
          size="icon"
          onClick={() => setShowAddForm(!showAddForm)}
          className="border-orange-600 text-orange-600 hover:bg-orange-50"
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      {showAddForm && (
        <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg mb-6">
          <h3 className="font-medium mb-3">{t('groceryList.addNewItem')}</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <Label htmlFor="item-name">{t('groceryList.itemName')}</Label>
              <Input
                id="item-name"
                value={newItem}
                onChange={(e) => setNewItem(e.target.value)}
                placeholder="e.g., Apples"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="item-quantity">{t('groceryList.quantity')}</Label>
              <Input
                id="item-quantity"
                value={newItemQuantity}
                onChange={(e) => setNewItemQuantity(e.target.value)}
                placeholder="e.g., 3 or 2 lbs"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="item-category">{t('groceryList.category')}</Label>
              <select
                id="item-category"
                value={newItemCategory}
                onChange={(e) => setNewItemCategory(e.target.value)}
                className="w-full h-10 px-3 py-2 bg-white dark:bg-gray-950 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 mt-1"
              >
                {Object.keys(groceryList).map((category) => (
                  <option key={category} value={category}>
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setShowAddForm(false)}>
              {t('groceryList.cancel')}
            </Button>
            <Button onClick={addNewItem} className="bg-orange-600 hover:bg-orange-700">
              {t('groceryList.addItem')}
            </Button>
          </div>
        </div>
      )}

      <div className="space-y-6">
        {Object.entries(filteredItems).map(([category, categoryItems]) => (
          <div key={category}>
            <h3 className="font-medium text-lg mb-3 capitalize">{category}</h3>
            <div className="space-y-2">
              {categoryItems.map((item) => (
                <div key={item.name} className="flex items-center justify-between py-2">
                  <div className="flex items-center">
                    <Checkbox
                      id={`${category}-${item.name}`}
                      checked={item.checked}
                      onCheckedChange={() => toggleItemCheck(category, item.name)}
                    />
                    <Label
                      htmlFor={`${category}-${item.name}`}
                      className={`ml-2 ${item.checked ? "line-through text-gray-400 dark:text-gray-600" : ""}`}
                    >
                      {item.name}
                      <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">({item.recipes.join(", ")})</span>
                    </Label>
                  </div>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {item.quantity} {item.unit}
                  </span>
                </div>
              ))}
            </div>
            <Separator className="my-4" />
          </div>
        ))}

        {Object.keys(filteredItems).length === 0 && (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            {searchQuery ? (
              <p>{t('groceryList.noItemsFound')}</p>
            ) : (
              <div>
                <p className="mb-4">{t('groceryList.emptyList')}</p>
                <Button onClick={() => setShowAddForm(true)} className="bg-orange-600 hover:bg-orange-700">
                  <Plus className="mr-2 h-4 w-4" />
                  {t('groceryList.addFirstItem')}
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
