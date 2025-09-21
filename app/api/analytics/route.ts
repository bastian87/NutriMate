import { type NextRequest, NextResponse } from "next/server"

// Helper function to validate UUID format
function isValidUUID(str: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
  return uuidRegex.test(str)
}

export async function POST(request: NextRequest) {
  try {
    const { event, properties, userId } = await request.json()

    console.log("Analytics event received:", { event, properties, userId })

    // Prepare user_id - only use if it's a valid UUID, otherwise set to null
    let validUserId = null
    if (userId && typeof userId === "string") {
      if (isValidUUID(userId)) {
        validUserId = userId
      } else {
        // For non-UUID user IDs, we'll store them in properties instead
        console.log("Non-UUID user ID detected, storing in properties:", userId)
      }
    }

    // Store analytics event in database using direct fetch to Supabase REST API
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
    
    const response = await fetch(`${supabaseUrl}/rest/v1/analytics_events`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': serviceRoleKey,
        'Authorization': `Bearer ${serviceRoleKey}`,
        'Prefer': 'return=representation'
      },
      body: JSON.stringify({
        event_name: event,
        properties: {
          ...(properties || {}),
          // Store non-UUID user IDs in properties
          ...(userId && !validUserId ? { user_identifier: userId } : {}),
        },
        user_id: validUserId,
        created_at: new Date().toISOString(),
      })
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error("Analytics storage error:", errorText)

      // If table doesn't exist, provide helpful error message
      if (errorText.includes("does not exist") || response.status === 404) {
        return NextResponse.json(
          {
            error: "Analytics table not found",
            details: "Please run the database setup script to create the analytics_events table",
            suggestion: "Run the 'create-analytics-table.sql' script in your database",
          },
          { status: 500 },
        )
      }

      return NextResponse.json(
        {
          error: "Failed to store analytics",
          details: errorText,
        },
        { status: 500 },
      )
    }

    const data = await response.json()
    console.log("Analytics event stored successfully:", data)
    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error("Analytics API error:", error)
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
