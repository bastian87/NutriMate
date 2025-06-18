import { type NextRequest, NextResponse } from "next/server"
import { createCheckout } from "@/lib/lemonsqueezy"
import { createServerSupabaseClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  try {
    const { variantId, plan } = await request.json()

    if (!variantId) {
      return NextResponse.json({ error: "Variant ID is required" }, { status: 400 })
    }

    const supabase = createServerSupabaseClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    // Handle both authenticated and guest users
    const checkoutData = {
      variantId,
      ...(user && {
        userId: user.id,
        userEmail: user.email,
      }),
      redirectUrl: `${process.env.NEXT_PUBLIC_APP_URL}/checkout/success`,
    }

    const checkoutUrl = await createCheckout(checkoutData)

    if (!checkoutUrl) {
      throw new Error("No checkout URL returned from Lemon Squeezy")
    }

    return NextResponse.json({
      checkoutUrl,
      success: true,
    })
  } catch (error) {
    console.error("Checkout creation error:", error)
    return NextResponse.json(
      {
        error: "Failed to create checkout",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
