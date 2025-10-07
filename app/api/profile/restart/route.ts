import { NextRequest, NextResponse } from "next/server"
import { createServerClientWithCookies } from "@/lib/supabase/server"
import type { Database } from '@/lib/types/database'

export async function POST(request: NextRequest) {
  try {
    const response = NextResponse.next()
    const supabase = createServerClientWithCookies(request, response)
    
    const { data: { session }, error: authError } = await supabase.auth.getSession()
    if (authError || !session) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }
    
    const { user } = session
    
    if (authError || !user) {
      return NextResponse.json(
        { error: "Unauthorized", message: "Invalid or missing authentication" },
        { status: 401 }
      )
    }

    // 2. Verificar que el onboarding NO está completo
    const onboardingComplete = user.user_metadata?.onboarding_complete === true
    
    if (onboardingComplete) {
      return NextResponse.json(
        { error: "Bad Request", message: "User onboarding is already complete" },
        { status: 400 }
      )
    }

    // 3. Verificar que NO existe una fila en public.users
    const { data: existingUser, error: checkError } = await supabase
      .from("users")
      .select("id")
      .eq("id", user.id as Database['public']['Tables']['users']['Row']['id'])
      .maybeSingle()

    if (checkError) {
      console.error("Error checking existing user:", checkError)
      return NextResponse.json(
        { error: "Database error", message: "Failed to check existing user" },
        { status: 500 }
      )
    }

    if (existingUser) {
      return NextResponse.json(
        { error: "Bad Request", message: "User profile already exists in database" },
        { status: 400 }
      )
    }

    // 4. Verificar que NO tiene preferencias
    const { data: existingPreferences, error: prefsError } = await supabase
      .from("user_preferences")
      .select("id")
      .eq("user_id", user.id as Database['public']['Tables']['user_preferences']['Row']['user_id'])
      .maybeSingle()

    if (prefsError) {
      console.error("Error checking existing preferences:", prefsError)
      return NextResponse.json(
        { error: "Database error", message: "Failed to check existing preferences" },
        { status: 500 }
      )
    }

    if (existingPreferences) {
      return NextResponse.json(
        { error: "Bad Request", message: "User preferences already exist in database" },
        { status: 400 }
      )
    }

    // 5. Eliminar el usuario de Supabase Auth
    const { error: deleteError } = await supabase.auth.admin.deleteUser(user.id)

    if (deleteError) {
      console.error("Error deleting user from auth:", deleteError)
      return NextResponse.json(
        { error: "Database error", message: "Failed to delete user from authentication" },
        { status: 500 }
      )
    }

    // 6. Log de la operación
    console.log(`✅ User ${user.id} (${user.email}) restarted - deleted from auth`)

    // 7. Retornar éxito
    return NextResponse.json(
      {
        message: "User account restarted successfully",
        userId: user.id,
        email: user.email
      },
      { status: 200 }
    )

  } catch (error) {
    console.error("Error in profile restart:", error)
    return NextResponse.json(
      { error: "Internal Server Error", message: "An unexpected error occurred" },
      { status: 500 }
    )
  }
}
