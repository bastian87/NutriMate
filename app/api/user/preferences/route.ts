import { type NextRequest, NextResponse } from "next/server"
import { userService } from "@/lib/services/user-service"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 })
    }

    // Get user preferences from the service
    const preferences = await userService.getUserPreferences(userId)

    // Return preferences or empty object if none found
    return NextResponse.json(preferences || {})
  } catch (error) {
    console.error("Error fetching user preferences:", error)
    return NextResponse.json({ error: "Failed to fetch user preferences" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, preferences } = body

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 })
    }

    if (!preferences) {
      return NextResponse.json({ error: "Preferences data is required" }, { status: 400 })
    }

    // Save user preferences using the service
    const savedPreferences = await userService.saveUserPreferences(userId, preferences)

    if (!savedPreferences) {
      return NextResponse.json({ error: "Failed to save preferences" }, { status: 500 })
    }

    return NextResponse.json(savedPreferences)
  } catch (error) {
    console.error("Error saving user preferences:", error)
    return NextResponse.json({ error: "Failed to save user preferences" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, preferences } = body

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 })
    }

    if (!preferences) {
      return NextResponse.json({ error: "Preferences data is required" }, { status: 400 })
    }

    // Update user preferences using the service
    const updatedPreferences = await userService.updateUserPreferences(userId, preferences)

    if (!updatedPreferences) {
      return NextResponse.json({ error: "Failed to update preferences" }, { status: 500 })
    }

    return NextResponse.json(updatedPreferences)
  } catch (error) {
    console.error("Error updating user preferences:", error)
    return NextResponse.json({ error: "Failed to update user preferences" }, { status: 500 })
  }
}
