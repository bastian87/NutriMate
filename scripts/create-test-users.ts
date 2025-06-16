// This is a helper script to create test users
// Run this in your browser console or as a Node.js script

import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY! // Service role key for admin operations

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

export async function createTestUsers() {
  const testUsers = [
    {
      email: "john.free@test.com",
      password: "testpass123",
      fullName: "John Free User",
      plan: "free",
    },
    {
      email: "jane.premium@test.com",
      password: "testpass123",
      fullName: "Jane Premium User",
      plan: "premium",
    },
    {
      email: "mike.trial@test.com",
      password: "testpass123",
      fullName: "Mike Trial User",
      plan: "premium",
      status: "trialing",
    },
  ]

  for (const testUser of testUsers) {
    try {
      // Create user with admin API
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: testUser.email,
        password: testUser.password,
        email_confirm: true, // Skip email verification for test users
        user_metadata: {
          full_name: testUser.fullName,
        },
      })

      if (authError) {
        console.error(`Failed to create user ${testUser.email}:`, authError)
        continue
      }

      console.log(`✅ Created user: ${testUser.email}`)

      // Create user profile
      const { error: profileError } = await supabase.from("users").insert({
        id: authData.user.id,
        email: testUser.email,
        full_name: testUser.fullName,
      })

      if (profileError) {
        console.error(`Failed to create profile for ${testUser.email}:`, profileError)
      }

      // Create subscription
      const subscriptionData: any = {
        user_id: authData.user.id,
        plan: testUser.plan,
        status: testUser.status || "active",
      }

      if (testUser.plan === "premium") {
        subscriptionData.current_period_start = new Date().toISOString()
        subscriptionData.current_period_end = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()

        if (testUser.status === "trialing") {
          subscriptionData.trial_end = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
        }
      }

      const { error: subscriptionError } = await supabase.from("subscriptions").insert(subscriptionData)

      if (subscriptionError) {
        console.error(`Failed to create subscription for ${testUser.email}:`, subscriptionError)
      }

      // Add some sample preferences
      const { error: preferencesError } = await supabase.from("user_preferences").insert({
        user_id: authData.user.id,
        dietary_restrictions: testUser.plan === "premium" ? ["vegetarian"] : [],
        health_goals: ["maintain_weight"],
        activity_level: "moderate",
        allergies: [],
      })

      if (preferencesError) {
        console.error(`Failed to create preferences for ${testUser.email}:`, preferencesError)
      }

      console.log(`✅ Setup complete for: ${testUser.email} (${testUser.plan})`)
    } catch (error) {
      console.error(`Error creating test user ${testUser.email}:`, error)
    }
  }

  console.log("\n🎉 Test users created! You can now log in with:")
  console.log("Free User: john.free@test.com / testpass123")
  console.log("Premium User: jane.premium@test.com / testpass123")
  console.log("Trial User: mike.trial@test.com / testpass123")
}

// Uncomment to run
// createTestUsers()
