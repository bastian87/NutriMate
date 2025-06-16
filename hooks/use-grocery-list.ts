"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase/client"
import { useAuthContext } from "@/components/auth/auth-provider"

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

export function useGroceryList() {
  const { user } = useAuthContext()
  const [groceryList, setGroceryList] = useState<GroceryList | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (user) {
      fetchGroceryList()
    } else {
      setGroceryList(null)
      setLoading(false)
    }
  }, [user])

  const fetchGroceryList = async () => {
    if (!user) return

    try {
      setLoading(true)
      setError(null)

      // Get or create the user's default grocery list
      let { data: list, error: listError } = await supabase
        .from("grocery_lists")
        .select("*")
        .eq("user_id", user.id)
        .single()

      if (listError && listError.code === "PGRST116") {
        // No list found, create one
        const { data: newList, error: createError } = await supabase
          .from("grocery_lists")
          .insert({
            user_id: user.id,
            name: "My Grocery List",
          })
          .select()
          .single()

        if (createError) throw createError
        list = newList
      } else if (listError) {
        throw listError
      }

      // Get the items for this list
      const { data: items, error: itemsError } = await supabase
        .from("grocery_list_items")
        .select("*")
        .eq("grocery_list_id", list.id)
        .order("created_at", { ascending: false })

      if (itemsError) throw itemsError

      setGroceryList({
        ...list,
        items: items || [],
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
      const { data, error } = await supabase
        .from("grocery_list_items")
        .insert({
          grocery_list_id: groceryList.id,
          name: item.name,
          quantity: item.quantity,
          unit: item.unit,
          category: item.category || "other",
          recipe_id: item.recipe_id,
          is_checked: false,
        })
        .select()
        .single()

      if (error) throw error

      setGroceryList((prev) => ({
        ...prev!,
        items: [data, ...prev!.items],
      }))
    } catch (err) {
      console.error("Error adding item:", err)
      throw err
    }
  }

  const updateItem = async (itemId: string, updates: Partial<GroceryListItem>) => {
    if (!groceryList) return

    try {
      const { data, error } = await supabase
        .from("grocery_list_items")
        .update(updates)
        .eq("id", itemId)
        .select()
        .single()

      if (error) throw error

      setGroceryList((prev) => ({
        ...prev!,
        items: prev!.items.map((item) => (item.id === itemId ? data : item)),
      }))
    } catch (err) {
      console.error("Error updating item:", err)
      throw err
    }
  }

  const deleteItem = async (itemId: string) => {
    if (!groceryList) return

    try {
      const { error } = await supabase.from("grocery_list_items").delete().eq("id", itemId)

      if (error) throw error

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
    if (!user || !groceryList) return

    try {
      // Get recipe ingredients
      const { data: ingredients, error } = await supabase
        .from("recipe_ingredients")
        .select("*")
        .eq("recipe_id", recipeId)

      if (error) throw error

      if (!ingredients || ingredients.length === 0) {
        throw new Error("No ingredients found for this recipe")
      }

      // Filter ingredients if specific ones were selected
      const ingredientsToAdd = selectedIngredientIds
        ? ingredients.filter((ing) => selectedIngredientIds.includes(ing.id))
        : ingredients

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

      const { data, error: insertError } = await supabase.from("grocery_list_items").insert(itemsToInsert).select()

      if (insertError) throw insertError

      setGroceryList((prev) => ({
        ...prev!,
        items: [...(data || []), ...prev!.items],
      }))
    } catch (err) {
      console.error("Error adding recipe ingredients:", err)
      throw err
    }
  }

  const addAllMealPlanIngredients = async (mealPlanId: string) => {
    if (!user || !groceryList) return

    try {
      // Get all meals from the meal plan
      const { data: meals, error: mealsError } = await supabase
        .from("meal_plan_meals")
        .select("recipe_id")
        .eq("meal_plan_id", mealPlanId)

      if (mealsError) throw mealsError

      // Get ingredients for all recipes in the meal plan
      const recipeIds = meals.map((meal) => meal.recipe_id)

      const { data: ingredients, error: ingredientsError } = await supabase
        .from("recipe_ingredients")
        .select("*")
        .in("recipe_id", recipeIds)

      if (ingredientsError) throw ingredientsError

      if (!ingredients || ingredients.length === 0) {
        throw new Error("No ingredients found for this meal plan")
      }

      // Group ingredients by name and sum quantities
      const groupedIngredients = ingredients.reduce(
        (acc, ingredient) => {
          const key = `${ingredient.name}-${ingredient.unit || "item"}`
          if (acc[key]) {
            // Simple quantity addition (you might want more sophisticated logic)
            const existingQty = Number.parseFloat(acc[key].quantity) || 1
            const newQty = Number.parseFloat(ingredient.quantity) || 1
            acc[key].quantity = (existingQty + newQty).toString()
          } else {
            acc[key] = { ...ingredient }
          }
          return acc
        },
        {} as Record<string, any>,
      )

      // Add grouped ingredients to grocery list
      const itemsToInsert = Object.values(groupedIngredients).map((ingredient: any) => ({
        grocery_list_id: groceryList.id,
        name: ingredient.name,
        quantity: ingredient.quantity,
        unit: ingredient.unit,
        category: "other",
        is_checked: false,
      }))

      const { data, error: insertError } = await supabase.from("grocery_list_items").insert(itemsToInsert).select()

      if (insertError) throw insertError

      setGroceryList((prev) => ({
        ...prev!,
        items: [...(data || []), ...prev!.items],
      }))
    } catch (err) {
      console.error("Error adding meal plan ingredients:", err)
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
    addAllMealPlanIngredients,
    refetch: fetchGroceryList,
  }
}
