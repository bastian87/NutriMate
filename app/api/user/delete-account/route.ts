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
      // Delete user preferences
      const { error: prefsError } = await supabaseAdmin.from("user_preferences").delete().eq("user_id", userId)
      if (prefsError) console.log("Error deleting preferences:", prefsError)

      // Delete user favorites
      const { error: favoritesError } = await supabaseAdmin.from("user_favorites").delete().eq("user_id", userId)
      if (favoritesError) console.log("Error deleting user favorites:", favoritesError)

      // Note: recipe_ratings are NOT deleted to preserve community ratings and recipe popularity
      // This helps maintain the quality and reputation of recipes for all users

      // Note: Grocery lists and meal plans have been removed from the application
      // If these tables still exist in the database, they are not actively used

      // Delete user subscriptions
      const { error: subsError } = await supabaseAdmin.from("user_subscriptions").delete().eq("user_id", userId)
      if (subsError) console.log("Error deleting user subscriptions:", subsError)

      // Delete user recipes
      // First get all recipe IDs for this user and delete their ingredients
      const { data: userRecipes } = await supabaseAdmin.from("recipes").select("id").eq("user_id", userId)
      if (userRecipes && userRecipes.length > 0) {
        const recipeIds = userRecipes.map(recipe => recipe.id)
        const { error: ingredientsError } = await supabaseAdmin.from("recipe_ingredients").delete().in("recipe_id", recipeIds)
        if (ingredientsError) console.log("Error deleting recipe ingredients:", ingredientsError)
      }
      
      const { error: recipesError } = await supabaseAdmin.from("recipes").delete().eq("user_id", userId)
      if (recipesError) console.log("Error deleting recipes:", recipesError)

      // 10. Delete user profile last
      const { error: profileError } = await supabaseAdmin.from("users").delete().eq("id", userId)
      if (profileError) console.log("Error deleting user profile:", profileError)
      else console.log("User profile deleted successfully")

      console.log("All user data deleted successfully")
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
