import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

// Create admin client with service role key
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

async function createTestUser() {
  try {
    console.log("Creating test user...")

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
      return
    }

    console.log("Auth user created:", authData.user.email)

    // Create user profile
    const { error: profileError } = await supabaseAdmin.from("users").insert({
      id: authData.user.id,
      email: authData.user.email!,
      full_name: "Test User",
    })

    if (profileError) {
      console.error("Error creating user profile:", profileError)
    } else {
      console.log("User profile created successfully")
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

    if (prefsError) {
      console.error("Error creating user preferences:", prefsError)
    } else {
      console.log("User preferences created successfully")
    }

    console.log("✅ Test user created successfully!")
    console.log("Email: test@nutrimate.com")
    console.log("Password: testpassword123")
  } catch (error) {
    console.error("Error creating test user:", error)
  }
}

// Run the script
createTestUser()
