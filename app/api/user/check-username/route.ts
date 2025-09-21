import { NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  try {
    const { username } = await request.json()

    if (!username || typeof username !== "string") {
      return NextResponse.json({ error: "Username is required" }, { status: 400 })
    }

    // Validate username format
    const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/
    if (!usernameRegex.test(username)) {
      return NextResponse.json({ 
        error: "Username must be 3-20 characters long and contain only letters, numbers, and underscores" 
      }, { status: 400 })
    }

    // Check username availability directly with server-side Supabase client
    const supabase = createServerClient()
    const { data, error } = await supabase
      .from("users")
      .select("username")
      .eq("username", username)
      .maybeSingle()

    if (error) {
      console.error("Error checking username availability:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ available: !data })
  } catch (error) {
    console.error("Error checking username availability:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
