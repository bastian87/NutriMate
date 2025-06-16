import { type NextRequest, NextResponse } from "next/server"

export const maxDuration = 30

export async function POST(req: NextRequest) {
  try {
    console.log("AI Assistant API called")

    const body = await req.json()
    console.log("Request body:", {
      messagesCount: body.messages?.length,
      hasUserProfile: !!body.userProfile,
    })

    const { messages, userProfile } = body

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: "Invalid messages format" }, { status: 400 })
    }

    // Get the last user message
    const lastMessage = messages[messages.length - 1]
    const userPrompt = lastMessage?.content || ""

    // Use our local recipe suggestion service
    const { generateRecipeSuggestions } = await import("@/lib/ai-service")

    const result = await generateRecipeSuggestions(
      userProfile || {
        dietaryRestrictions: [],
        allergies: [],
        cuisinePreferences: [],
        cookingSkill: "beginner",
        cookingTime: "30 minutes",
        servings: 2,
        healthGoals: [],
      },
      userPrompt,
    )

    if (!result.success) {
      throw new Error(result.error)
    }

    console.log("Recipe suggestion successful")

    // Return in the format expected by the frontend
    return NextResponse.json({
      choices: [
        {
          message: {
            content: result.suggestion,
          },
        },
      ],
    })
  } catch (error) {
    console.error("AI Assistant API Error:", error)

    // Return detailed error information
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred"

    return NextResponse.json(
      {
        error: errorMessage,
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}
