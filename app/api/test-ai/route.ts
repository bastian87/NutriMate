import { NextResponse } from "next/server"

export async function GET() {
  try {
    // AI service has been removed - this endpoint is no longer needed
    return NextResponse.json({
      success: false,
      message: "AI service has been removed from NutriMate",
      note: "This endpoint is deprecated and will be removed in a future update",
    })
  } catch (error) {
    console.error("Test AI Error:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
