import { type NextRequest, NextResponse } from "next/server"
import { createCheckout } from "@/lib/lemonsqueezy"
import { createServerSupabaseClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  try {
    const { variantId, plan } = await request.json()

    if (!variantId) {
      return NextResponse.json({ error: "Variant ID is required" }, { status: 400 })
    }

    // Validar variables de entorno críticas
    if (!process.env.NEXT_PUBLIC_LEMONSQUEEZY_STORE_ID || !process.env.LEMONSQUEEZY_API_KEY || !process.env.NEXT_PUBLIC_APP_URL) {
      return NextResponse.json({
        error: "Faltan variables de entorno requeridas para el checkout. Contacta al administrador."
      }, { status: 500 })
    }

    const supabase = createServerSupabaseClient()
    console.log("Supabase session check")
    console.log(await supabase.auth.getSession())

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Debes iniciar sesión para suscribirte." }, { status: 401 })
    }

    const checkoutData = {
      variantId,
      userId: user.id,
      userEmail: user.email,
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
