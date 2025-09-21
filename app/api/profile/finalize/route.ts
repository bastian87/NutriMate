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

    // 5. Usar transacción para crear usuario y preferencias de forma atómica
    const { data: transactionData, error: transactionError } = await supabase.rpc('create_user_with_preferences', {
      p_user_id: user.id,
      p_email: user.email!,
      p_full_name: full_name || null,
      p_username: finalUsername,
      p_age: age,
      p_gender: gender,
      p_height: height,
      p_weight: weight,
      p_activity_level: activity_level,
      p_health_goal: health_goal,
      p_calorie_target: calorie_target || 2000,
      p_dietary_preferences: dietary_preferences,
      p_excluded_ingredients: excluded_ingredients,
      p_include_snacks: include_snacks,
      p_allergies: allergies,
      p_intolerances: intolerances,
      p_max_prep_time: max_prep_time,
      p_macro_priority: macro_priority
    })

    if (transactionError) {
      console.error("Error in transaction:", transactionError)
      return NextResponse.json(
        { error: "Database error", message: "Failed to create user profile and preferences" },
        { status: 500 }
      )
    }

    const { userData, preferencesData } = transactionData

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
