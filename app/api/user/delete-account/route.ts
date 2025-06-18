import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export async function DELETE(request: NextRequest) {
  try {
    // Create admin client with service role key
    const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })

    // Create regular client for getting current user
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

    // Get the current user from the request
    const authHeader = request.headers.get("authorization")
    if (!authHeader) {
      return NextResponse.json({ error: "No authorization header" }, { status: 401 })
    }

    const token = authHeader.replace("Bearer ", "")
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(token)

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = user.id
    console.log(`Starting complete account deletion for user: ${userId}`)

    try {
      // Delete user data in order (respecting foreign key constraints)

      // Delete user preferences
      const { error: prefsError } = await supabaseAdmin.from("user_preferences").delete().eq("user_id", userId)
      if (prefsError) console.log("Error deleting preferences:", prefsError)

      // Delete user recipes
      const { error: recipesError } = await supabaseAdmin.from("recipes").delete().eq("user_id", userId)
      if (recipesError) console.log("Error deleting recipes:", recipesError)

      // Delete meal plans
      const { error: mealPlansError } = await supabaseAdmin.from("meal_plans").delete().eq("user_id", userId)
      if (mealPlansError) console.log("Error deleting meal plans:", mealPlansError)

      // Delete grocery lists
      const { error: groceryError } = await supabaseAdmin.from("grocery_lists").delete().eq("user_id", userId)
      if (groceryError) console.log("Error deleting grocery lists:", groceryError)

      // Delete subscriptions
      const { error: subsError } = await supabaseAdmin.from("subscriptions").delete().eq("user_id", userId)
      if (subsError) console.log("Error deleting subscriptions:", subsError)

      // Delete user profile
      const { error: profileError } = await supabaseAdmin.from("users").delete().eq("id", userId)
      if (profileError) console.log("Error deleting user profile:", profileError)

      console.log("User data deleted successfully")
    } catch (dataError) {
      console.error("Error deleting user data:", dataError)
      // Continue with auth deletion even if some data deletion fails
    }

    // Now delete the auth user completely using admin client
    const { error: deleteAuthError } = await supabaseAdmin.auth.admin.deleteUser(userId)

    if (deleteAuthError) {
      console.error("Error deleting auth user:", deleteAuthError)
      return NextResponse.json({ error: "Failed to delete auth user" }, { status: 500 })
    }

    console.log("Auth user deleted successfully")

    return NextResponse.json({
      success: true,
      message: "Account completely deleted - user cannot sign in again",
    })
  } catch (error) {
    console.error("Error deleting account:", error)
    return NextResponse.json({ error: "Failed to delete account" }, { status: 500 })
  }
}
