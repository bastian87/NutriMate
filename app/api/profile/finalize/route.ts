import { NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerClient()
    
    // 1. Obtener token de autorización
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: "Unauthorized", message: "Missing or invalid authorization header" },
        { status: 401 }
      )
    }

    const token = authHeader.substring(7) // Remove 'Bearer ' prefix

    // 2. Validar token con Supabase
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    
    if (authError || !user) {
      return NextResponse.json(
        { error: "Unauthorized", message: "Invalid or expired token" },
        { status: 401 }
      )
    }

    // 3. Obtener datos del request
    const body = await request.json()
    const {
      full_name,
      username,
      age,
      gender,
      height,
      weight,
      activity_level,
      health_goal,
      calorie_target,
      dietary_preferences = [],
      excluded_ingredients = [],
      include_snacks = false,
      allergies = [],
      intolerances = [],
      max_prep_time = 60,
      macro_priority = 'balanced'
    } = body

    // Validar datos requeridos
    if (!username || !age || !gender || !height || !weight || !activity_level || !health_goal) {
      return NextResponse.json(
        { error: "Bad Request", message: "Missing required fields" },
        { status: 400 }
      )
    }

    // 4. Resolver username único
    let finalUsername = username
    let counter = 1
    
    while (true) {
      const { data: usernameCheck, error: usernameError } = await supabase
        .from("users")
        .select("id")
        .eq("username", finalUsername)
        .neq("id", user.id) // Excluir el usuario actual
        .maybeSingle()

      if (usernameError) {
        console.error("Error checking username availability:", usernameError)
        return NextResponse.json(
          { error: "Database error", message: "Failed to check username availability" },
          { status: 500 }
        )
      }

      if (!usernameCheck) {
        break // Username is available
      }

      finalUsername = `${username}${counter}`
      counter++
    }

    // 5. Upsert en la tabla users
    const { data: userData, error: userError } = await supabase
      .from("users")
      .upsert({
        id: user.id,
        email: user.email!,
        full_name: full_name || null,
        username: finalUsername
      })
      .select()
      .single()

    if (userError) {
      console.error("Error upserting user profile:", userError)
      return NextResponse.json(
        { error: "Database error", message: "Failed to upsert user profile" },
        { status: 500 }
      )
    }

    // 6. Upsert en la tabla user_preferences
    const { data: preferencesData, error: preferencesError } = await supabase
      .from("user_preferences")
      .upsert({
        user_id: user.id,
        age,
        gender,
        height,
        weight,
        activity_level,
        health_goal,
        calorie_target: calorie_target || 2000,
        dietary_preferences,
        excluded_ingredients,
        include_snacks,
        allergies,
        intolerances,
        max_prep_time,
        macro_priority
      })
      .select()
      .single()

    if (preferencesError) {
      console.error("Error upserting user preferences:", preferencesError)
      return NextResponse.json(
        { error: "Database error", message: "Failed to upsert user preferences" },
        { status: 500 }
      )
    }

    // 7. Actualizar metadata del usuario para marcar onboarding como completo
    const { error: metadataError } = await supabase.auth.updateUser({
      data: {
        onboarding_complete: true,
        full_name: full_name || null,
        username: finalUsername
      }
    })

    if (metadataError) {
      console.error("Error updating user metadata:", metadataError)
      // No fallar aquí, el perfil ya está creado
    }

    // 8. Retornar éxito
    return NextResponse.json(
      {
        ok: true,
        message: "Profile finalized successfully",
        user: userData,
        preferences: preferencesData
      },
      { status: 200 }
    )

  } catch (error) {
    console.error("Error in profile finalize:", error)
    return NextResponse.json(
      { error: "Internal Server Error", message: "An unexpected error occurred" },
      { status: 500 }
    )
  }
}
