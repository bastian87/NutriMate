// Test User Management System
// This script helps create and manage test users for different subscription tiers

import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY! // Service role key for admin operations

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

export interface TestUser {
  email: string
  password: string
  fullName: string
  plan: "free" | "premium"
  status?: "active" | "trialing" | "canceled"
  preferences?: {
    age: number
    gender: string
    height: number
    weight: number
    activityLevel: string
    healthGoal: string
    dietaryPreferences: string[]
    excludedIngredients: string[]
  }
}

const testUsers: TestUser[] = [
  {
    email: "john.free@nutrimate.test",
    password: "testpass123",
    fullName: "John Free User",
    plan: "free",
    preferences: {
      age: 28,
      gender: "male",
      height: 175,
      weight: 70,
      activityLevel: "moderate",
      healthGoal: "weight_loss",
      dietaryPreferences: ["vegetarian"],
      excludedIngredients: ["nuts"],
    },
  },
  {
    email: "jane.premium@nutrimate.test",
    password: "testpass123",
    fullName: "Jane Premium User",
    plan: "premium",
    status: "active",
    preferences: {
      age: 32,
      gender: "female",
      height: 165,
      weight: 60,
      activityLevel: "high",
      healthGoal: "muscle_gain",
      dietaryPreferences: ["vegan", "gluten_free"],
      excludedIngredients: [],
    },
  },
  {
    email: "mike.trial@nutrimate.test",
    password: "testpass123",
    fullName: "Mike Trial User",
    plan: "premium",
    status: "trialing",
    preferences: {
      age: 25,
      gender: "male",
      height: 180,
      weight: 80,
      activityLevel: "low",
      healthGoal: "maintenance",
      dietaryPreferences: [],
      excludedIngredients: ["dairy"],
    },
  },
]

export async function createTestUsers() {
  console.log("🚀 Creating test users...")

  for (const testUser of testUsers) {
    try {
      // Create user through Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: testUser.email,
        password: testUser.password,
        email_confirm: true, // Skip email verification for test users
        user_metadata: {
          full_name: testUser.fullName,
        },
      })

      if (authError) {
        if (authError.message.includes("already registered")) {
          console.log(`⚠️  User ${testUser.email} already exists, skipping...`)
          continue
        }
        throw authError
      }

      console.log(`✅ Created auth user: ${testUser.email}`)

      // Create user profile
      const { error: profileError } = await supabase.from("users").insert({
        id: authData.user.id,
        email: testUser.email,
        full_name: testUser.fullName,
      })

      if (profileError && !profileError.message.includes("duplicate key")) {
        throw profileError
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

      const { error: subscriptionError } = await supabase.from("subscriptions").upsert(subscriptionData)

      if (subscriptionError) {
        console.error(`Failed to create subscription for ${testUser.email}:`, subscriptionError)
      }

      // Add user preferences if provided
      if (testUser.preferences) {
        const { error: preferencesError } = await supabase.from("user_preferences").upsert({
          user_id: authData.user.id,
          age: testUser.preferences.age,
          gender: testUser.preferences.gender,
          height: testUser.preferences.height,
          weight: testUser.preferences.weight,
          activity_level: testUser.preferences.activityLevel,
          health_goal: testUser.preferences.healthGoal,
          calorie_target: calculateCalorieTarget(testUser.preferences),
          dietary_preferences: testUser.preferences.dietaryPreferences,
          excluded_ingredients: testUser.preferences.excludedIngredients,
        })

        if (preferencesError) {
          console.error(`Failed to create preferences for ${testUser.email}:`, preferencesError)
        }
      }

      // Add some sample usage data
      const usageData = [
        {
          user_id: authData.user.id,
          feature: "ai_suggestions",
          usage_count: testUser.plan === "free" ? 2 : 15,
          reset_date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split("T")[0],
        },
        {
          user_id: authData.user.id,
          feature: "meal_plans",
          usage_count: testUser.plan === "free" ? 1 : 5,
          reset_date: new Date().toISOString().split("T")[0],
        },
      ]

      const { error: usageError } = await supabase.from("usage_tracking").upsert(usageData)

      if (usageError) {
        console.error(`Failed to create usage data for ${testUser.email}:`, usageError)
      }

      console.log(`✅ Setup complete for: ${testUser.email} (${testUser.plan} - ${testUser.status || "active"})`)
    } catch (error) {
      console.error(`❌ Error creating test user ${testUser.email}:`, error)
    }
  }

  console.log("\n🎉 Test user creation complete!")
  console.log("\n📧 Test Users Created:")
  console.log("Free User: john.free@nutrimate.test / testpass123")
  console.log("Premium User: jane.premium@nutrimate.test / testpass123")
  console.log("Trial User: mike.trial@nutrimate.test / testpass123")
  console.log("\n🔗 You can now test different subscription tiers and features!")
}

function calculateCalorieTarget(preferences: TestUser["preferences"]): number {
  if (!preferences) return 2000

  // Calculate BMR using Mifflin-St Jeor Equation
  let bmr: number
  if (preferences.gender === "male") {
    bmr = 10 * preferences.weight + 6.25 * preferences.height - 5 * preferences.age + 5
  } else {
    bmr = 10 * preferences.weight + 6.25 * preferences.height - 5 * preferences.age - 161
  }

  // Apply activity multiplier
  const activityMultipliers = {
    sedentary: 1.2,
    low: 1.375,
    moderate: 1.55,
    high: 1.725,
    very_active: 1.9,
  }

  const tdee = bmr * (activityMultipliers[preferences.activityLevel as keyof typeof activityMultipliers] || 1.55)

  // Adjust for health goal
  switch (preferences.healthGoal) {
    case "weight_loss":
      return Math.round(tdee * 0.8)
    case "muscle_gain":
      return Math.round(tdee * 1.1)
    default:
      return Math.round(tdee)
  }
}

export async function deleteTestUsers() {
  console.log("🗑️  Deleting test users...")

  for (const testUser of testUsers) {
    try {
      // Get user by email
      const { data: users } = await supabase.auth.admin.listUsers()
      const user = users.users.find((u) => u.email === testUser.email)

      if (user) {
        // Delete user (this will cascade delete related data due to foreign key constraints)
        const { error } = await supabase.auth.admin.deleteUser(user.id)
        if (error) throw error
        console.log(`✅ Deleted user: ${testUser.email}`)
      }
    } catch (error) {
      console.error(`❌ Error deleting test user ${testUser.email}:`, error)
    }
  }

  console.log("🎉 Test user deletion complete!")
}

// Export for use in browser console or Node.js
if (typeof window !== "undefined") {
  // Browser environment
  ;(window as any).createTestUsers = createTestUsers
  ;(window as any).deleteTestUsers = deleteTestUsers
  console.log("Test user functions available: createTestUsers(), deleteTestUsers()")
}
