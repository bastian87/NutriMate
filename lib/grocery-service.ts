export interface GroceryItem {
  id: string
  name: string
  quantity: string
  unit: string
  category: string
  completed: boolean
  recipes: string[] // Track which recipes this ingredient came from
}

export interface GroceryList {
  items: GroceryItem[]
  lastUpdated: string
}

export interface RecipeIngredient {
  id: string
  name: string
  quantity: string
  unit: string
}

// Categories for organizing grocery items
export const GROCERY_CATEGORIES = {
  PRODUCE: "produce",
  DAIRY: "dairy",
  PROTEIN: "protein",
  GRAINS: "grains",
  PANTRY: "pantry",
  OTHER: "other",
} as const

// Function to categorize ingredients
export function categorizeIngredient(ingredientName: string): string {
  const name = ingredientName.toLowerCase()

  // Produce
  if (
    name.includes("berries") ||
    name.includes("fruit") ||
    name.includes("vegetable") ||
    name.includes("lettuce") ||
    name.includes("tomato") ||
    name.includes("onion") ||
    name.includes("carrot") ||
    name.includes("pepper") ||
    name.includes("spinach")
  ) {
    return GROCERY_CATEGORIES.PRODUCE
  }

  // Dairy
  if (
    name.includes("milk") ||
    name.includes("cheese") ||
    name.includes("yogurt") ||
    name.includes("butter") ||
    name.includes("cream")
  ) {
    return GROCERY_CATEGORIES.DAIRY
  }

  // Protein
  if (
    name.includes("chicken") ||
    name.includes("beef") ||
    name.includes("fish") ||
    name.includes("egg") ||
    name.includes("tofu") ||
    name.includes("beans")
  ) {
    return GROCERY_CATEGORIES.PROTEIN
  }

  // Grains
  if (
    name.includes("rice") ||
    name.includes("pasta") ||
    name.includes("bread") ||
    name.includes("flour") ||
    name.includes("oats") ||
    name.includes("quinoa") ||
    name.includes("granola")
  ) {
    return GROCERY_CATEGORIES.GRAINS
  }

  // Pantry
  if (
    name.includes("oil") ||
    name.includes("vinegar") ||
    name.includes("salt") ||
    name.includes("pepper") ||
    name.includes("spice") ||
    name.includes("honey") ||
    name.includes("seeds") ||
    name.includes("nuts")
  ) {
    return GROCERY_CATEGORIES.PANTRY
  }

  return GROCERY_CATEGORIES.OTHER
}

// Load grocery list from localStorage
export async function loadGroceryList(): Promise<GroceryList> {
  try {
    const stored = localStorage.getItem("nutrimate-grocery-list")
    if (stored) {
      return JSON.parse(stored)
    }
  } catch (error) {
    console.error("Error loading grocery list:", error)
  }

  return {
    items: [],
    lastUpdated: new Date().toISOString(),
  }
}

// Save grocery list to localStorage
export async function saveGroceryList(groceryList: GroceryList): Promise<void> {
  try {
    groceryList.lastUpdated = new Date().toISOString()
    localStorage.setItem("nutrimate-grocery-list", JSON.stringify(groceryList))
  } catch (error) {
    console.error("Error saving grocery list:", error)
    throw new Error("Failed to save grocery list")
  }
}

// Add ingredients from a recipe to the grocery list
export async function addIngredientsToGroceryList(
  ingredients: RecipeIngredient[],
  recipeName: string,
  currentGroceryList: GroceryList,
): Promise<GroceryList> {
  const updatedItems = [...currentGroceryList.items]

  for (const ingredient of ingredients) {
    // Check if ingredient already exists
    const existingItemIndex = updatedItems.findIndex(
      (item) => item.name.toLowerCase() === ingredient.name.toLowerCase(),
    )

    if (existingItemIndex >= 0) {
      // Update existing item
      const existingItem = updatedItems[existingItemIndex]

      // Add recipe to the list if not already there
      if (!existingItem.recipes.includes(recipeName)) {
        existingItem.recipes.push(recipeName)
      }

      // For now, we'll just keep the existing quantity
      // In a more sophisticated system, we could merge quantities
      updatedItems[existingItemIndex] = existingItem
    } else {
      // Add new item
      const newItem: GroceryItem = {
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        name: ingredient.name,
        quantity: ingredient.quantity,
        unit: ingredient.unit,
        category: categorizeIngredient(ingredient.name),
        completed: false,
        recipes: [recipeName],
      }

      updatedItems.push(newItem)
    }
  }

  return {
    items: updatedItems,
    lastUpdated: new Date().toISOString(),
  }
}
