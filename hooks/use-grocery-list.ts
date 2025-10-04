"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase/client"
import { useAuthContext } from "@/components/auth/simple-auth-provider"

export interface GroceryListItem {
  id: string
  grocery_list_id: string
  recipe_id?: string
  name: string
  quantity?: string
  unit?: string
  category?: string
  is_checked: boolean
  created_at: string
  updated_at: string
}

export interface GroceryList {
  id: string
  user_id: string
  name: string
  created_at: string
  updated_at: string
  items: GroceryListItem[]
}

export function useGroceryList(shouldFetch = true) {
  const { user } = useAuthContext()
  const [groceryList, setGroceryList] = useState<GroceryList | null>(null)
  const [loading, setLoading] = useState(shouldFetch)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (user && shouldFetch) {
      fetchGroceryList()
    } else {
      setGroceryList(null)
      setLoading(false)
    }
  }, [user, shouldFetch])

  const fetchGroceryList = async () => {
    if (!user) return

    try {
      setLoading(true)
      setError(null)

      // Get the user's grocery lists
      const response = await fetch('/api/grocery-lists', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to fetch grocery lists')
      }

      const { lists } = await response.json()

      let list
      if (!lists || lists.length === 0) {
        // No lists found, create one
        const createResponse = await fetch('/api/grocery-lists', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: "My Grocery List"
          })
        })

        if (!createResponse.ok) {
          const errorData = await createResponse.json()
          throw new Error(errorData.error || 'Failed to create grocery list')
        }

        const { list: newList } = await createResponse.json()
        list = newList
      } else {
        // Use the first (most recent) list
        list = lists[0]
      }

      setGroceryList({
        ...list,
        items: list.grocery_list_items || [],
      })
    } catch (err) {
      console.error("Error fetching grocery list:", err)
      setError(err instanceof Error ? err.message : "Failed to fetch grocery list")
    } finally {
      setLoading(false)
    }
  }

  const addItem = async (item: {
    name: string
    quantity?: string
    unit?: string
    category?: string
    recipe_id?: string
  }) => {
    if (!user || !groceryList) return

    try {
      const response = await fetch('/api/grocery-lists/items', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          grocery_list_id: groceryList.id,
          name: item.name,
          quantity: item.quantity,
          unit: item.unit,
          category: item.category || "other",
          recipe_id: item.recipe_id,
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to add item')
      }

      const { item: newItem } = await response.json()

      setGroceryList((prev) => ({
        ...prev!,
        items: [newItem, ...prev!.items],
      }))
    } catch (err) {
      console.error("Error adding item:", err)
      throw err
    }
  }

  const updateItem = async (itemId: string, updates: Partial<GroceryListItem>) => {
    if (!groceryList) return

    try {
      const response = await fetch('/api/grocery-lists/items', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: itemId,
          ...updates
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to update item')
      }

      const { item: updatedItem } = await response.json()

      setGroceryList((prev) => ({
        ...prev!,
        items: prev!.items.map((item) => (item.id === itemId ? updatedItem : item)),
      }))
    } catch (err) {
      console.error("Error updating item:", err)
      throw err
    }
  }

  const deleteItem = async (itemId: string) => {
    if (!groceryList) return

    try {
      const response = await fetch(`/api/grocery-lists/items?id=${itemId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        }
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to delete item')
      }

      setGroceryList((prev) => ({
        ...prev!,
        items: prev!.items.filter((item) => item.id !== itemId),
      }))
    } catch (err) {
      console.error("Error deleting item:", err)
      throw err
    }
  }

  const addRecipeIngredients = async (recipeId: string, selectedIngredientIds?: string[]) => {
    if (!user || !groceryList) {
      console.error("❌ addRecipeIngredients: Usuario o lista de compras no disponible", {
        user: !!user,
        groceryList: !!groceryList
      })
      return
    }

    console.log("🔍 addRecipeIngredients: Iniciando proceso", {
      recipeId,
      selectedIngredientIds,
      groceryListId: groceryList.id,
      userId: user.id
    })

    try {
      // Get recipe ingredients
      console.log("📋 Buscando ingredientes para receta:", recipeId)
      const { data: ingredients, error } = await supabase
        .from("recipe_ingredients")
        .select("*")
        .eq("recipe_id", recipeId)

      if (error) {
        console.error("❌ Error obteniendo ingredientes:", error)
        throw error
      }

      console.log("📋 Ingredientes encontrados:", ingredients?.length || 0)

      if (!ingredients || ingredients.length === 0) {
        console.error("❌ No se encontraron ingredientes para la receta:", recipeId)
        throw new Error("No ingredients found for this recipe")
      }

      // Filter ingredients if specific ones were selected
      const ingredientsToAdd = selectedIngredientIds
        ? ingredients.filter((ing) => selectedIngredientIds.includes(ing.id))
        : ingredients

      console.log("📋 Ingredientes a agregar:", ingredientsToAdd.length)

      // Add each ingredient to the grocery list
      const itemsToInsert = ingredientsToAdd.map((ingredient) => ({
        grocery_list_id: groceryList.id,
        recipe_id: recipeId,
        name: ingredient.name,
        quantity: ingredient.quantity,
        unit: ingredient.unit,
        category: "other", // You could categorize ingredients better
        is_checked: false,
      }))

      console.log("📋 Items a insertar:", itemsToInsert.length)

      // Insert items one by one using the API
      const insertedItems: any[] = []
      for (const item of itemsToInsert) {
        try {
          const response = await fetch('/api/grocery-lists/items', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(item)
          })

          if (response.ok) {
            const { item: newItem } = await response.json()
            insertedItems.push(newItem)
          } else {
            console.error("❌ Error inserting item:", item.name)
          }
        } catch (error) {
          console.error("❌ Error inserting item:", item.name, error)
        }
      }

      console.log("✅ Items insertados exitosamente:", insertedItems.length)

      setGroceryList((prev) => {
        const updated = {
          ...prev!,
          items: [...insertedItems, ...prev!.items],
        }
        console.log("🔄 Lista de compras actualizada:", {
          itemsAnteriores: prev!.items.length,
          itemsNuevos: insertedItems.length,
          itemsTotales: updated.items.length
        })
        return updated
      })

      console.log("✅ addRecipeIngredients: Proceso completado exitosamente")
    } catch (err) {
      console.error("❌ Error adding recipe ingredients:", err)
      throw err
    }
  }

  // Legacy function - meal planning removed
  // const addAllMealPlanIngredients = async (mealPlanId: string) => {
  //   // Function removed - meal planning no longer available
  // }

  const clearAllItems = async () => {
    if (!groceryList) return
    try {
      const { error } = await supabase
        .from("grocery_list_items")
        .delete()
        .eq("grocery_list_id", groceryList.id)
      if (error) throw error
      setGroceryList((prev) => ({ ...prev!, items: [] }))
    } catch (err) {
      console.error("Error clearing grocery list:", err)
      throw err
    }
  }

  return {
    groceryList,
    loading,
    error,
    addItem,
    updateItem,
    deleteItem,
    addRecipeIngredients,
    refetch: fetchGroceryList,
    clearAllItems,
  }
}
