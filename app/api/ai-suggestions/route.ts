import { type NextRequest, NextResponse } from "next/server"
import { generateRecipeSuggestions } from "@/lib/ai-service"

export async function POST(request: NextRequest) {
  try {
    const { prompt, userProfile } = await request.json()

    if (!prompt) {
      return NextResponse.json({ success: false, error: "Prompt is required" }, { status: 400 })
    }

    // Use our local recipe suggestion service instead of external AI
    const result = await generateRecipeSuggestions(userProfile, prompt)

    return NextResponse.json(result)
  } catch (error) {
    console.error("API Error:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
