import { mockMealPlan, mockGroceryList, mockRecipes, mockUserPreferences } from "./mock-data"
import type { MealPlan, Recipe, UserPreferences } from "./mock-data"

// Mock service functions to simulate API calls

// User preferences
export async function saveUserPreferences(preferences: Partial<UserPreferences>): Promise<UserPreferences> {
  // In a real app, this would make an API call to save preferences
  console.log("Saving user preferences:", preferences)

  // Return mock data with updated preferences
  return {
    ...mockUserPreferences,
    ...preferences,
  }
}

export async function getUserPreferences(): Promise<UserPreferences> {
  // In a real app, this would fetch preferences from the API
  return mockUserPreferences
}

// Meal plans
export async function generateMealPlan(): Promise<MealPlan> {
  // In a real app, this would call an API to generate a meal plan
  console.log("Generating meal plan")

  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 1000))

  return mockMealPlan
}

export async function getMealPlan(id: string): Promise<MealPlan> {
  // In a real app, this would fetch a specific meal plan
  console.log("Fetching meal plan:", id)

  return mockMealPlan
}

export async function regenerateMeal(mealId: string): Promise<MealPlan> {
  // In a real app, this would call an API to regenerate a specific meal
  console.log("Regenerating meal:", mealId)

  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 1000))

  // For the mock, we'll just return the same meal plan
  return mockMealPlan
}

// Grocery list
export async function getGroceryList(mealPlanId: string): Promise<any> {
  // In a real app, this would generate a grocery list based on the meal plan
  console.log("Generating grocery list for meal plan:", mealPlanId)

  return mockGroceryList
}

// Recipes
export async function getRecipes(filters?: any): Promise<Recipe[]> {
  // In a real app, this would fetch recipes with filters
  console.log("Fetching recipes with filters:", filters)

  return mockRecipes
}

export async function getRecipe(id: string): Promise<Recipe | undefined> {
  // In a real app, this would fetch a specific recipe
  console.log("Fetching recipe:", id)

  return mockRecipes.find((recipe) => recipe.id === id)
}

// Feedback
export async function submitFeedback(feedback: { message: string; email?: string }): Promise<{ success: boolean }> {
  // In a real app, this would submit feedback to an API
  console.log("Submitting feedback:", feedback)

  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 1000))

  return { success: true }
}

// Auth
export async function loginUser(credentials: { email: string; password: string }): Promise<{
  success: boolean
  userId?: string
}> {
  // In a real app, this would authenticate the user
  console.log("Logging in user:", credentials)

  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 1000))

  // For the mock, we'll just return success
  return { success: true, userId: "user1" }
}

export async function registerUser(userData: { name: string; email: string; password: string }): Promise<{
  success: boolean
  userId?: string
}> {
  // In a real app, this would register a new user
  console.log("Registering user:", userData)

  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 1000))

  // For the mock, we'll just return success
  return { success: true, userId: "user1" }
}
