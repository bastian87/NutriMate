import { NextResponse } from "next/server"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export async function POST() {
  try {
    console.log("Creating test user via API...")

    // Create user in Supabase Auth using direct API call
    const authResponse = await fetch(`${supabaseUrl}/auth/v1/admin/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseServiceKey,
        'Authorization': `Bearer ${supabaseServiceKey}`
      },
      body: JSON.stringify({
        email: "test@nutrimate.com",
        password: "testpassword123",
        email_confirm: true,
        user_metadata: {
          full_name: "Test User",
        },
      })
    })

    if (!authResponse.ok) {
      const errorData = await authResponse.json()
      console.error("Error creating auth user:", errorData)
      return NextResponse.json({ error: errorData.message || "Failed to create user" }, { status: 400 })
    }

    const authData = await authResponse.json()
    console.log("Auth user created:", authData.user.email)

    // Create user profile using direct API call
    const profileResponse = await fetch(`${supabaseUrl}/rest/v1/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseServiceKey,
        'Authorization': `Bearer ${supabaseServiceKey}`,
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify({
        id: authData.user.id,
        email: authData.user.email,
        full_name: "Test User",
      })
    })

    if (!profileResponse.ok && profileResponse.status !== 409) {
      const errorText = await profileResponse.text()
      if (!errorText.includes("duplicate key")) {
        console.error("Error creating user profile:", errorText)
        return NextResponse.json({ error: errorText }, { status: 400 })
      }
    }

    // Create user preferences using direct API call
    const prefsResponse = await fetch(`${supabaseUrl}/rest/v1/user_preferences`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseServiceKey,
        'Authorization': `Bearer ${supabaseServiceKey}`,
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify({
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
    })

    if (!prefsResponse.ok && prefsResponse.status !== 409) {
      const errorText = await prefsResponse.text()
      if (!errorText.includes("duplicate key")) {
        console.error("Error creating user preferences:", errorText)
      }
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
