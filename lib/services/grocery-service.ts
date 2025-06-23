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
    const { data, error } = await this.supabase.from("grocery_list_items").update(updates).eq("id", id).select().single()

    if (error) {
      console.error("Error updating grocery:", error)
      return null
    }

    return data
  }

  async deleteGrocery(id: string): Promise<boolean> {
    const { error } = await this.supabase.from("grocery_list_items").delete().eq("id", id)

    if (error) {
      console.error("Error deleting grocery:", error)
      return false
    }

    return true
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

      // Add to grocery list
      const groceryItems = ingredientsToAdd.map((ingredient) => ({
        user_id: userId,
        name: ingredient.name,
        quantity: ingredient.quantity,
        unit: ingredient.unit,
        is_completed: false,
      }))

      const { error: insertError } = await this.supabase.from("grocery_list_items").insert(groceryItems)

      if (insertError) throw insertError

      return true
    } catch (error) {
      console.error("Error adding recipe ingredients:", error)
      return false
    }
  }

  async clearCompleted(userId: string): Promise<boolean> {
    const { error } = await this.supabase.from("grocery_list_items").delete().eq("user_id", userId).eq("is_completed", true)

    if (error) {
      console.error("Error clearing completed items:", error)
      return false
    }

    return true
  }
}

// Export the service instance
export const groceryService = new GroceryService()

// Legacy exports for backward compatibility
export const getGroceries = (userId: string) => groceryService.getGroceries(userId)
export const addGrocery = (userId: string, name: string) => groceryService.addGrocery(userId, name)
export const updateGrocery = (id: string, updates: any) => groceryService.updateGrocery(id, updates)
export const deleteGrocery = (id: string) => groceryService.deleteGrocery(id)
