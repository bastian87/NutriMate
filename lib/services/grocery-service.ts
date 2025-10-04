import { createClient } from "@/lib/supabase/client"
import type { Database } from "@/lib/types/database"

type GroceryItem = Database["public"]["Tables"]["grocery_list_items"]["Row"]
type GroceryItemInsert = Database["public"]["Tables"]["grocery_list_items"]["Insert"]

export class GroceryService {
  private supabase = createClient()

  async getGroceries(userId: string): Promise<GroceryItem[]> {
    const { data, error } = await this.supabase
      .from("grocery_list_items")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching groceries:", error)
      return []
    }

    return data || []
  }

  async addGrocery(userId: string, name: string, quantity?: string, unit?: string): Promise<GroceryItem | null> {
    const { data, error } = await this.supabase
      .from("grocery_list_items")
      .insert([
        {
          user_id: userId,
          name,
          quantity: quantity || "1",
          unit: unit || "item",
          is_completed: false,
        },
      ])
      .select()
      .single()

    if (error) {
      console.error("Error adding grocery:", error)
      return null
    }

    return data
  }

  async updateGrocery(id: string, updates: Partial<GroceryItem>): Promise<GroceryItem | null> {
    try {
      const response = await fetch('/api/grocery-lists/items', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id,
          ...updates
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        console.error("Error updating grocery:", errorData.error)
        return null
      }

      const { item } = await response.json()
      return item
    } catch (error) {
      console.error("Error updating grocery:", error)
      return null
    }
  }

  async deleteGrocery(id: string): Promise<boolean> {
    try {
      const response = await fetch(`/api/grocery-lists/items?id=${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        }
      })

      if (!response.ok) {
        const errorData = await response.json()
        console.error("Error deleting grocery:", errorData.error)
        return false
      }

      return true
    } catch (error) {
      console.error("Error deleting grocery:", error)
      return false
    }
  }

  async addRecipeIngredients(userId: string, recipeId: string, selectedIngredientIds?: string[]): Promise<boolean> {
    try {
      // Get recipe ingredients
      const { data: ingredients, error: ingredientsError } = await this.supabase
        .from("recipe_ingredients")
        .select("*")
        .eq("recipe_id", recipeId)

      if (ingredientsError) throw ingredientsError

      // Filter ingredients if specific ones were selected
      const ingredientsToAdd = selectedIngredientIds
        ? ingredients.filter((ing) => selectedIngredientIds.includes(ing.id))
        : ingredients

      // Add to grocery list using API
      for (const ingredient of ingredientsToAdd) {
        try {
          const response = await fetch('/api/grocery-lists/items', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              name: ingredient.name,
              quantity: ingredient.quantity,
              unit: ingredient.unit,
              is_checked: false,
            })
          })

          if (!response.ok) {
            console.error("Error adding ingredient to grocery list:", ingredient.name)
          }
        } catch (error) {
          console.error("Error adding ingredient to grocery list:", ingredient.name, error)
        }
      }

      return true
    } catch (error) {
      console.error("Error adding recipe ingredients:", error)
      return false
    }
  }

  async clearCompleted(userId: string): Promise<boolean> {
    try {
      // Get user's grocery lists first
      const listsResponse = await fetch('/api/grocery-lists', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      })

      if (!listsResponse.ok) {
        console.error("Error fetching grocery lists for clear completed")
        return false
      }

      const { lists } = await listsResponse.json()
      
      // Clear completed items from each list
      for (const list of lists) {
        const itemsResponse = await fetch(`/api/grocery-lists/items?list_id=${list.id}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          }
        })

        if (itemsResponse.ok) {
          const { items } = await itemsResponse.json()
          const completedItems = items.filter((item: any) => item.is_checked)
          
          for (const item of completedItems) {
            await fetch(`/api/grocery-lists/items?id=${item.id}`, {
              method: 'DELETE',
              headers: {
                'Content-Type': 'application/json',
              }
            })
          }
        }
      }

      return true
    } catch (error) {
      console.error("Error clearing completed items:", error)
      return false
    }
  }
}

// Export the service instance
export const groceryService = new GroceryService()

// Legacy exports for backward compatibility
export const getGroceries = (userId: string) => groceryService.getGroceries(userId)
export const addGrocery = (userId: string, name: string) => groceryService.addGrocery(userId, name)
export const updateGrocery = (id: string, updates: any) => groceryService.updateGrocery(id, updates)
export const deleteGrocery = (id: string) => groceryService.deleteGrocery(id)
