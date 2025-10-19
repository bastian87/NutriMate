"use client"

import { useState } from "react"
import { Plus, Search, Check, Trash2, Edit3, ShoppingCart } from "lucide-react"
import { useLanguage } from "@/lib/i18n/context"

interface GroceryItem {
  id: string
  name: string
  category: string
  quantity: string
  completed: boolean
}

export default function MobileGroceryListPage() {
  const { t } = useLanguage()
  const [searchQuery, setSearchQuery] = useState("")
  const [items, setItems] = useState<GroceryItem[]>([
    { id: "1", name: "Leche", category: "Lácteos", quantity: "1 litro", completed: false },
    { id: "2", name: "Pan integral", category: "Panadería", quantity: "1 unidad", completed: true },
    { id: "3", name: "Tomates", category: "Verduras", quantity: "500g", completed: false },
    { id: "4", name: "Pollo", category: "Carnes", quantity: "1 kg", completed: false },
    { id: "5", name: "Arroz", category: "Granos", quantity: "2 kg", completed: true },
  ])

  const categories = ["Todas", "Lácteos", "Panadería", "Verduras", "Carnes", "Granos"]
  const [selectedCategory, setSelectedCategory] = useState("Todas")

  const filteredItems = items.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === "Todas" || item.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const completedCount = items.filter(item => item.completed).length
  const totalCount = items.length

  const toggleItem = (id: string) => {
    setItems(items.map(item => 
      item.id === id ? { ...item, completed: !item.completed } : item
    ))
  }

  const deleteItem = (id: string) => {
    setItems(items.filter(item => item.id !== id))
  }

  const addItem = () => {
    const newItem: GroceryItem = {
      id: Date.now().toString(),
      name: "Nuevo artículo",
      category: "Otros",
      quantity: "1",
      completed: false
    }
    setItems([...items, newItem])
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white px-6 py-4 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Lista de compras</h1>
            <p className="text-sm text-gray-500">
              {completedCount} de {totalCount} completados
            </p>
          </div>
          <button
            onClick={addItem}
            className="p-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors"
          >
            <Plus className="h-5 w-5" />
          </button>
      </div>

        {/* Barra de búsqueda */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar en la lista..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-gray-100 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-300 focus:bg-white"
          />
        </div>

        {/* Categorías */}
        <div className="flex space-x-2 overflow-x-auto pb-2">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                selectedCategory === category
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Lista de artículos */}
      <div className="px-6 py-4">
        {filteredItems.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <ShoppingCart className="h-8 w-8 text-gray-400" />
              </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Lista vacía</h3>
            <p className="text-gray-500">Agrega artículos para comenzar</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredItems.map((item) => (
              <div
                key={item.id}
                className={`bg-white rounded-xl p-4 shadow-sm transition-all ${
                  item.completed ? 'opacity-60' : ''
                }`}
              >
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => toggleItem(item.id)}
                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                      item.completed
                        ? 'bg-green-600 border-green-600 text-white'
                        : 'border-gray-300 hover:border-green-600'
                    }`}
                  >
                    {item.completed && <Check className="h-4 w-4" />}
                  </button>
                  
                  <div className="flex-1">
                    <h3 className={`font-medium ${
                      item.completed ? 'line-through text-gray-500' : 'text-gray-900'
                    }`}>
                      {item.name}
                    </h3>
                    <div className="flex items-center space-x-2 text-sm text-gray-500">
                      <span>{item.category}</span>
                      <span>•</span>
                      <span>{item.quantity}</span>
                  </div>
                </div>

                  <div className="flex items-center space-x-2">
                    <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                      <Edit3 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => deleteItem(item.id)}
                      className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Progreso */}
      {totalCount > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-900">Progreso</span>
            <span className="text-sm text-gray-500">{completedCount}/{totalCount}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-green-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(completedCount / totalCount) * 100}%` }}
            />
          </div>
        </div>
      )}
    </div>
  )
}