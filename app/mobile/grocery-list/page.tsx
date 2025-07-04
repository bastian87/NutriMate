"use client"

import type React from "react"

import { useState } from "react"
import { Search, Plus, ArrowLeft, Printer, Download, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { useGroceryList } from "@/hooks/use-grocery-list"
import { useAuthContext } from "@/components/auth/auth-provider"

export default function MobileGroceryListPage() {
  const { groceryList, loading, error, addItem, updateItem, deleteItem } = useGroceryList()
  const { user } = useAuthContext()
  const [searchQuery, setSearchQuery] = useState("")
  const [newItemName, setNewItemName] = useState("")
  const [newItemQuantity, setNewItemQuantity] = useState("")
  const [showAddForm, setShowAddForm] = useState(false)

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newItemName.trim()) return

    try {
      await addItem({
        name: newItemName.trim(),
        quantity: newItemQuantity.trim() || undefined,
        category: "other",
      })
      setNewItemName("")
      setNewItemQuantity("")
      setShowAddForm(false)
    } catch (error) {
      console.error("Error adding item:", error)
    }
  }

  const handleToggleItem = async (itemId: string, checked: boolean) => {
    try {
      await updateItem(itemId, { is_checked: checked })
    } catch (error) {
      console.error("Error updating item:", error)
    }
  }

  const handleDeleteItem = async (itemId: string) => {
    try {
      await deleteItem(itemId)
    } catch (error) {
      console.error("Error deleting item:", error)
    }
  }

  if (!user) {
    return (
      <div className="bg-background min-h-screen pb-20">
        {/* Mobile Header */}
        <div className="bg-white shadow-sm px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/mobile" className="flex items-center text-gray-600">
              <ArrowLeft className="h-5 w-5 mr-2" />
              Back
            </Link>
            <h1 className="text-lg font-bold">Grocery List</h1>
            <div className="w-8"></div>
          </div>
        </div>

        <div className="text-center py-12 px-4">
          <p className="text-gray-600 mb-4">Please sign in to access your grocery list.</p>
          <Link href="/login">
            <Button className="bg-orange-600 hover:bg-orange-700">Sign In</Button>
          </Link>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="bg-background min-h-screen pb-20">
        {/* Mobile Header */}
        <div className="bg-white shadow-sm px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/mobile" className="flex items-center text-gray-600">
              <ArrowLeft className="h-5 w-5 mr-2" />
              Back
            </Link>
            <h1 className="text-lg font-bold">Grocery List</h1>
            <div className="w-8"></div>
          </div>
        </div>

        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your grocery list...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-background min-h-screen pb-20">
        {/* Mobile Header */}
        <div className="bg-white shadow-sm px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/mobile" className="flex items-center text-gray-600">
              <ArrowLeft className="h-5 w-5 mr-2" />
              Back
            </Link>
            <h1 className="text-lg font-bold">Grocery List</h1>
            <div className="w-8"></div>
          </div>
        </div>

        <div className="text-center py-12 px-4">
          <p className="text-red-600 mb-4">Error loading grocery list: {error}</p>
          <Button onClick={() => window.location.reload()}>Try Again</Button>
        </div>
      </div>
    )
  }

  // Group items by category
  const groupedItems =
    groceryList?.items?.reduce(
      (acc, item) => {
        const category = item.category || "other"
        if (!acc[category]) {
          acc[category] = []
        }
        acc[category].push(item)
        return acc
      },
      {} as Record<string, typeof groceryList extends { items: infer T } ? T : any>,
    ) || {}

  // Filter items based on search
  const filteredGroupedItems = searchQuery
    ? Object.entries(groupedItems).reduce(
        (acc, [category, items]) => {
          const filtered = items.filter((item: any) => item.name.toLowerCase().includes(searchQuery.toLowerCase()))
          if (filtered.length > 0) {
            acc[category] = filtered
          }
          return acc
        },
        {} as Record<string, typeof groceryList extends { items: infer T } ? T : any>,
      )
    : groupedItems

  const categories = [
    { key: "produce", name: "Produce", color: "bg-green-100 text-green-800" },
    { key: "protein", name: "Protein", color: "bg-red-100 text-red-800" },
    { key: "dairy", name: "Dairy", color: "bg-blue-100 text-blue-800" },
    { key: "grains", name: "Grains", color: "bg-yellow-100 text-yellow-800" },
    { key: "pantry", name: "Pantry", color: "bg-purple-100 text-purple-800" },
    { key: "other", name: "Other", color: "bg-gray-100 text-gray-800" },
  ]

  return (
    <div className="bg-background min-h-screen pb-20">
      {/* Mobile Header */}
      <div className="bg-white shadow-sm px-4 py-4">
        <div className="flex items-center justify-between">
          <Link href="/mobile" className="flex items-center text-gray-600">
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back
          </Link>
          <h1 className="text-lg font-bold">Grocery List</h1>
          <div className="flex space-x-2">
            <Button variant="ghost" size="sm">
              <Printer className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm">
              <Download className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

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

      {/* Add New Item Form */}
      {showAddForm && (
        <div className="px-4 mt-4">
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <h3 className="font-medium mb-3">Add New Item</h3>
            <form onSubmit={handleAddItem} className="space-y-3">
              <Input
                type="text"
                placeholder="Item name"
                value={newItemName}
                onChange={(e) => setNewItemName(e.target.value)}
              />
              <Input
                type="text"
                placeholder="Quantity (optional)"
                value={newItemQuantity}
                onChange={(e) => setNewItemQuantity(e.target.value)}
              />
              <div className="flex space-x-2">
                <Button type="submit" className="flex-1 bg-orange-600 hover:bg-orange-700">
                  Add Item
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowAddForm(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Categories */}
      <div className="px-4 mt-4 pb-20">
        {categories.map((category) => {
          const items = filteredGroupedItems[category.key] || []
          if (items.length === 0) return null

          return (
            <div key={category.key} className="mb-6">
              <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Badge className={category.color}>{category.name}</Badge>
                      <span className="text-sm text-gray-600">
                        {items.length} item{items.length !== 1 ? "s" : ""}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-4">
                  <div className="space-y-4">
                    {items.map((item: any) => (
                      <div key={item.id} className="flex items-center justify-between group">
                        <div className="flex items-center gap-3 flex-1">
                          <Checkbox
                            checked={item.is_checked}
                            onCheckedChange={(checked) => handleToggleItem(item.id, checked as boolean)}
                          />
                          <div className={`flex-1 ${item.is_checked ? "line-through text-gray-500" : ""}`}>
                            <span className="font-medium">{item.name}</span>
                            {item.quantity && (
                              <span className="text-gray-600 ml-2">
                                {item.quantity} {item.unit}
                              </span>
                            )}
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteItem(item.id)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )
        })}

        {(!groceryList?.items || groceryList.items.length === 0) && (
          <div className="text-center py-12 bg-white rounded-lg">
            <p className="text-gray-500 mb-4">Your grocery list is empty.</p>
            <p className="text-sm text-gray-400 mb-4">Add items manually or from recipe pages to get started.</p>
            <Button onClick={() => setShowAddForm(true)} className="bg-orange-600 hover:bg-orange-700">
              <Plus className="mr-2 h-4 w-4" />
              Add Your First Item
            </Button>
          </div>
        )}
      </div>

      {/* Add Button */}
      <button
        onClick={() => setShowAddForm(!showAddForm)}
        className="fixed bottom-20 right-4 bg-green-600 text-white rounded-full w-14 h-14 flex items-center justify-center shadow-lg"
      >
        <Plus className="h-6 w-6" />
      </button>
    </div>
  )
}
