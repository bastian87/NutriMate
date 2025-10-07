import { type NextRequest, NextResponse } from "next/server"
import { createCheckout } from "@/lib/lemonsqueezy"
import { createServerClient } from "@/lib/supabase/server"
import { getUserId } from "@/lib/auth/getUserId"

export async function POST(request: NextRequest) {
  try {
    console.log('🔍 Create Checkout: Starting request')
    console.log('🔍 Create Checkout: Headers:', Object.fromEntries(request.headers.entries()))
    
    const { variantId, plan } = await request.json()
    console.log('🔍 Create Checkout: Request body:', { variantId, plan })

    if (!variantId) {
      return NextResponse.json({ error: "Variant ID is required" }, { status: 400 })
    }

    // Validar variables de entorno críticas
    if (!process.env.NEXT_PUBLIC_LEMONSQUEEZY_STORE_ID || !process.env.LEMONSQUEEZY_API_KEY || !process.env.NEXT_PUBLIC_APP_URL) {
      return NextResponse.json({
        error: "Faltan variables de entorno requeridas para el checkout. Contacta al administrador."
      }, { status: 500 })
    }

    const supabase = createServerClient()
    console.log('🔍 Create Checkout: Attempting to get user ID')
    
    let userId: string
    try {
      userId = await getUserId(request)
      console.log('🔍 Create Checkout: User ID obtained:', userId)
    } catch (error) {
      console.error('🔍 Create Checkout: Error getting user ID:', error)
      return NextResponse.json({ error: "No se pudo obtener el ID del usuario." }, { status: 401 })
    }
    
    // Get user email from the user_id
    console.log('🔍 Create Checkout: Querying user_profiles for userId:', userId)
    const { data: userData, error: userError } = await supabase
      .from('user_profiles')
      .select('email')
      .eq('id', userId)
      .single()

    console.log('🔍 Create Checkout: User data query result:', { userData, userError })

    if (userError || !userData) {
      console.error('🔍 Create Checkout: Error getting user data:', userError)
      return NextResponse.json({ error: "No se pudo obtener la información del usuario." }, { status: 401 })
    }

    const checkoutData = {
      variantId,
      userId: userId,
      userEmail: userData.email,
      redirectUrl: `${process.env.NEXT_PUBLIC_APP_URL}/checkout/success`,
    }

    console.log("Checkout data:", checkoutData)

    let checkoutUrl: string | null = null
    try {
      checkoutUrl = await createCheckout(checkoutData)
    } catch (err: any) {
      // Error de red o LemonSqueezy
      return NextResponse.json({
        error: "No se pudo crear el checkout. Intenta de nuevo más tarde.",
        details: err instanceof Error ? err.message : "Unknown error",
      }, { status: 502 })
    }

    if (!checkoutUrl) {
      return NextResponse.json({ error: "No se pudo obtener la URL de pago." }, { status: 500 })
    }

    return NextResponse.json({
      checkoutUrl,
      success: true,
    })
  } catch (error: any) {
    // Error inesperado
    return NextResponse.json(
      {
        error: "Error interno al procesar el checkout.",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
