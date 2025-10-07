"use client"

import { useState, useEffect, useCallback } from "react"
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
  estimated_cost?: number
}

export interface GroceryList {
  id: string
  user_id: string
  name: string
  description?: string
  created_at: string
  updated_at: string
  items: GroceryListItem[]
}

export function useMultipleGroceryLists() {
  const { user } = useAuthContext()
  const [groceryLists, setGroceryLists] = useState<GroceryList[]>([])
  const [selectedListId, setSelectedListId] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [hasInitialized, setHasInitialized] = useState(false)

  const fetchAllGroceryLists = useCallback(async () => {
    if (!user) return

    try {
      setLoading(true)
      setError(null)

      // Get all grocery lists for the user
      const { data: lists, error: listsError } = await supabase
        .from("grocery_lists")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })

      if (listsError) throw listsError

      if (!lists || lists.length === 0) {
        console.log('🛒 fetchAllGroceryLists: No lists found, creating default list for user:', user.id)
        // Create a default list if none exist
        const { data: newList, error: createError } = await supabase
          .from("grocery_lists")
          .insert({
            user_id: user.id,
            name: "My Grocery List",
            description: "Default grocery list"
          })
          .select()
          .single()

        if (createError) {
          console.error('🛒 fetchAllGroceryLists: Error creating default list:', createError)
          throw createError
        }

        console.log('🛒 fetchAllGroceryLists: Default list created successfully:', newList.id)
        setGroceryLists([{ ...newList, items: [] }])
        setSelectedListId(newList.id)
      } else {
        console.log('🛒 fetchAllGroceryLists: Found existing lists:', lists.length)
        // Fetch items for each list
        const listsWithItems = await Promise.all(
          lists.map(async (list) => {
            const { data: items, error: itemsError } = await supabase
              .from("grocery_list_items")
              .select("*")
              .eq("grocery_list_id", list.id)
              .order("created_at", { ascending: false })

            if (itemsError) throw itemsError

            return {
              ...list,
              items: items || []
            }
          })
        )

        console.log('🛒 fetchAllGroceryLists: Lists with items loaded:', listsWithItems.length)
        setGroceryLists(listsWithItems)
        if (listsWithItems.length > 0) {
          setSelectedListId(listsWithItems[0].id)
        }
      }
    } catch (err) {
      console.error("Error fetching grocery lists:", err)
      setError(err instanceof Error ? err.message : "Failed to fetch grocery lists")
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    if (user && !hasInitialized) {
      console.log('🛒 useMultipleGroceryLists: User found, fetching lists for user:', user.id)
      setHasInitialized(true)
      fetchAllGroceryLists()
    } else if (!user) {
      console.log('🛒 useMultipleGroceryLists: No user, clearing lists')
      setGroceryLists([])
      setSelectedListId('')
      setLoading(false)
      setHasInitialized(false)
    }
  }, [user, hasInitialized, fetchAllGroceryLists])

  const createGroceryList = async (name: string, description?: string) => {
    if (!user) {
      throw new Error("Usuario no autenticado")
    }

    if (!name.trim()) {
      throw new Error("El nombre de la lista es requerido")
    }

    try {
      // Insertar todos los campos de la tabla
      const insertData: any = {
        user_id: user.id,
        name: name.trim(),
        description: description?.trim() || ""
      }

      const { data, error } = await supabase
        .from("grocery_lists")
        .insert(insertData)
        .select()
        .single()

      if (error) {
        console.error("Supabase error:", error)
        throw new Error(`Error de base de datos: ${error.message}`)
      }

      const newList = { 
        ...data, 
        items: [] 
      }
      setGroceryLists(prev => [newList, ...prev])
      setSelectedListId(data.id)
      return newList
    } catch (err) {
      console.error("Error creating grocery list:", err)
      if (err instanceof Error) {
        throw err
      }
      throw new Error("Error desconocido al crear la lista")
    }
  }

  const deleteGroceryList = async (listId: string) => {
    if (!user) return

    try {
      // First delete all items in the list
      const { error: itemsError } = await supabase
        .from("grocery_list_items")
        .delete()
        .eq("grocery_list_id", listId)

      if (itemsError) throw itemsError

      // Then delete the list
      const { error: listError } = await supabase
        .from("grocery_lists")
        .delete()
        .eq("id", listId)

      if (listError) throw listError

      setGroceryLists(prev => {
        const updated = prev.filter(list => list.id !== listId)
        if (selectedListId === listId && updated.length > 0) {
          setSelectedListId(updated[0].id)
        } else if (updated.length === 0) {
          setSelectedListId('')
        }
        return updated
      })
    } catch (err) {
      console.error("Error deleting grocery list:", err)
      throw err
    }
  }

  const addItemToList = async (listId: string, item: {
    name: string
    quantity?: string
    category?: string
    estimatedCost?: number
  }) => {
    if (!user) return

    try {
      const { data, error } = await supabase
        .from("grocery_list_items")
        .insert({
          grocery_list_id: listId,
          name: item.name,
          quantity: item.quantity,
          category: item.category || "other",
           estimated_cost: item.estimatedCost,
          is_checked: false,
        })
        .select()
        .single()

      if (error) throw error

      setGroceryLists(prev => 
        prev.map(list => 
          list.id === listId 
            ? { ...list, items: [data, ...list.items] }
            : list
        )
      )
    } catch (err) {
      console.error("Error adding item:", err)
      throw err
    }
  }

  const updateItem = async (itemId: string, updates: Partial<GroceryListItem>) => {
    try {
      const { data, error } = await supabase
        .from("grocery_list_items")
        .update(updates)
        .eq("id", itemId)
        .select()
        .single()

      if (error) throw error

      setGroceryLists(prev => 
        prev.map(list => ({
          ...list,
          items: list.items.map(item => item.id === itemId ? data : item)
        }))
      )
    } catch (err) {
      console.error("Error updating item:", err)
      throw err
    }
  }

  const deleteItem = async (itemId: string) => {
    try {
      const { error } = await supabase
        .from("grocery_list_items")
        .delete()
        .eq("id", itemId)

      if (error) throw error

      setGroceryLists(prev => 
        prev.map(list => ({
          ...list,
          items: list.items.filter(item => item.id !== itemId)
        }))
      )
    } catch (err) {
      console.error("Error deleting item:", err)
      throw err
    }
  }

  const clearAllItems = async (listId: string) => {
    try {
      const { error } = await supabase
        .from("grocery_list_items")
        .delete()
        .eq("grocery_list_id", listId)

      if (error) throw error

      setGroceryLists(prev => 
        prev.map(list => 
          list.id === listId 
            ? { ...list, items: [] }
            : list
        )
      )
    } catch (err) {
      console.error("Error clearing items:", err)
      throw err
    }
  }

  const selectedList = groceryLists.find(list => list.id === selectedListId)

  return {
    groceryLists,
    selectedList,
    selectedListId,
    setSelectedListId,
    loading,
    error,
    createGroceryList,
    deleteGroceryList,
    addItemToList,
    updateItem,
    deleteItem,
    clearAllItems,
    refetch: fetchAllGroceryLists
  }
}
