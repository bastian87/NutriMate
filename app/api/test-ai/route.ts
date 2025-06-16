import { NextResponse } from "next/server"

export async function GET() {
  try {
    // Test our local recipe service instead of external AI
    const { generateRecipeSuggestions } = await import("@/lib/ai-service")

    const testProfile = {
      dietaryRestrictions: ["vegetarian"],
      allergies: [],
      cuisinePreferences: ["mediterranean"],
      cookingSkill: "beginner" as const,
      cookingTime: "30 minutes",
      servings: 2,
      healthGoals: ["healthy"],
    }

    const result = await generateRecipeSuggestions(testProfile, "Suggest a healthy dinner")

    return NextResponse.json({
      success: result.success,
      hasGroqKey: false, // We're not using Groq anymore
      message: "Local recipe service is working",
      testResult: result.success ? "Recipe suggestions generated successfully" : result.error,
    })
  } catch (error) {
    console.error("Test AI Error:", error)
    return NextResponse.json(
      {
        success: false,
        hasGroqKey: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
