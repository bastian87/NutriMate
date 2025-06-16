// Simple recipe suggestion service without external AI
export interface UserProfile {
  dietaryRestrictions: string[]
  allergies: string[]
  cuisinePreferences: string[]
  cookingSkill: "beginner" | "intermediate" | "advanced"
  cookingTime: string
  servings: number
  healthGoals: string[]
}

// Pre-defined recipe suggestions based on common patterns
const recipeDatabase = [
  {
    name: "Mediterranean Quinoa Bowl",
    description: "A nutritious bowl with quinoa, fresh vegetables, and feta cheese",
    cookingTime: "25 minutes",
    difficulty: "beginner",
    tags: ["vegetarian", "mediterranean", "healthy"],
    ingredients: ["quinoa", "cucumber", "tomatoes", "feta", "olive oil"],
    benefits: "High in protein and fiber, rich in antioxidants",
  },
  {
    name: "Grilled Chicken with Vegetables",
    description: "Simple grilled chicken breast with seasonal roasted vegetables",
    cookingTime: "30 minutes",
    difficulty: "intermediate",
    tags: ["high-protein", "gluten-free", "healthy"],
    ingredients: ["chicken breast", "broccoli", "bell peppers", "olive oil"],
    benefits: "Lean protein source, rich in vitamins",
  },
  {
    name: "Vegan Buddha Bowl",
    description: "Colorful plant-based bowl with chickpeas and tahini dressing",
    cookingTime: "35 minutes",
    difficulty: "intermediate",
    tags: ["vegan", "vegetarian", "high-protein"],
    ingredients: ["chickpeas", "sweet potato", "kale", "tahini"],
    benefits: "Plant-based protein, rich in fiber and nutrients",
  },
  {
    name: "Quick Pasta Primavera",
    description: "Fresh pasta with seasonal vegetables in a light sauce",
    cookingTime: "20 minutes",
    difficulty: "beginner",
    tags: ["vegetarian", "quick", "family-friendly"],
    ingredients: ["pasta", "zucchini", "cherry tomatoes", "parmesan"],
    benefits: "Quick and satisfying, packed with vegetables",
  },
  {
    name: "Salmon with Asparagus",
    description: "Pan-seared salmon with garlic roasted asparagus",
    cookingTime: "25 minutes",
    difficulty: "intermediate",
    tags: ["high-protein", "omega-3", "gluten-free"],
    ingredients: ["salmon", "asparagus", "garlic", "lemon"],
    benefits: "Rich in omega-3 fatty acids and protein",
  },
  {
    name: "Lentil Curry",
    description: "Hearty red lentil curry with coconut milk and spices",
    cookingTime: "40 minutes",
    difficulty: "beginner",
    tags: ["vegan", "vegetarian", "indian", "high-protein"],
    ingredients: ["red lentils", "coconut milk", "curry spices", "onion"],
    benefits: "High in plant protein and fiber",
  },
]

export async function generateRecipeSuggestions(userProfile: UserProfile, prompt: string) {
  try {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Filter recipes based on user profile
    let filteredRecipes = recipeDatabase.filter((recipe) => {
      // Check dietary restrictions
      if (userProfile.dietaryRestrictions.includes("vegetarian") && !recipe.tags.includes("vegetarian")) {
        return false
      }
      if (userProfile.dietaryRestrictions.includes("vegan") && !recipe.tags.includes("vegan")) {
        return false
      }

      // Check cooking skill
      if (userProfile.cookingSkill === "beginner" && recipe.difficulty === "advanced") {
        return false
      }

      // Check cooking time preference
      const timeLimit = Number.parseInt(userProfile.cookingTime) || 60
      const recipeTime = Number.parseInt(recipe.cookingTime) || 30
      if (recipeTime > timeLimit) {
        return false
      }

      return true
    })

    // If no matches, show some beginner-friendly options
    if (filteredRecipes.length === 0) {
      filteredRecipes = recipeDatabase.filter((r) => r.difficulty === "beginner").slice(0, 2)
    }

    // Limit to 2-3 suggestions
    const suggestions = filteredRecipes.slice(0, 3)

    // Generate response text
    let responseText = "Based on your preferences, here are some great recipe suggestions:\n\n"

    suggestions.forEach((recipe, index) => {
      responseText += `${index + 1}. **${recipe.name}**\n`
      responseText += `${recipe.description}\n`
      responseText += `⏱️ Cooking time: ${recipe.cookingTime}\n`
      responseText += `👨‍🍳 Difficulty: ${recipe.difficulty}\n`
      responseText += `💚 Benefits: ${recipe.benefits}\n`
      responseText += `🥘 Key ingredients: ${recipe.ingredients.join(", ")}\n\n`
    })

    responseText += "Would you like the full recipe for any of these dishes? Just ask!"

    return { success: true, suggestion: responseText }
  } catch (error) {
    console.error("Recipe Service Error:", error)
    return {
      success: false,
      error: "Sorry, I couldn't generate suggestions right now. Please try again.",
    }
  }
}
