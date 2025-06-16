import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

// Create admin client with service role key
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

export async function POST() {
  try {
    console.log("Creating test user via API...")

    // Create user in Supabase Auth
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: "test@nutrimate.com",
      password: "testpassword123",
      email_confirm: true, // Auto-confirm the email
      user_metadata: {
        full_name: "Test User",
      },
    })

    if (authError) {
      console.error("Error creating auth user:", authError)
      return NextResponse.json({ error: authError.message }, { status: 400 })
    }

    console.log("Auth user created:", authData.user.email)

    // Create user profile
    const { error: profileError } = await supabaseAdmin.from("users").insert({
      id: authData.user.id,
      email: authData.user.email!,
      full_name: "Test User",
    })

    if (profileError && !profileError.message.includes("duplicate key")) {
      console.error("Error creating user profile:", profileError)
      return NextResponse.json({ error: profileError.message }, { status: 400 })
    }

    // Create user preferences
    const { error: prefsError } = await supabaseAdmin.from("user_preferences").insert({
      user_id: authData.user.id,
      age: 30,
      gender: "other",
      height: 170,
      weight: 70,
      activity_level: "moderate",
      health_goal: "maintain_weight",
      calorie_target: 2000,
      dietary_preferences: ["vegetarian"],
      excluded_ingredients: ["nuts"],
    })

    if (prefsError && !prefsError.message.includes("duplicate key")) {
      console.error("Error creating user preferences:", prefsError)
    }

    return NextResponse.json({
      success: true,
      message: "Test user created successfully",
      email: "test@nutrimate.com",
      password: "testpassword123",
    })
  } catch (error) {
    console.error("Error creating test user:", error)
    return NextResponse.json({ error: "Failed to create test user" }, { status: 500 })
  }
}
