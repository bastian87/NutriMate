import { type NextRequest, NextResponse } from "next/server"
import { createCheckout } from "@/lib/lemonsqueezy"
import { createServerSupabaseClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  try {
    const { variantId, plan } = await request.json()
    console.log("Received checkout request:", { variantId, plan })

    if (!variantId) {
      console.error("Missing variant ID")
      return NextResponse.json({ error: "Variant ID is required" }, { status: 400 })
    }

    // Log environment variables (without exposing sensitive data)
    console.log("Environment check:", {
      hasStoreId: !!process.env.NEXT_PUBLIC_LEMONSQUEEZY_STORE_ID,
      hasApiKey: !!process.env.LEMONSQUEEZY_API_KEY,
      hasAppUrl: !!process.env.NEXT_PUBLIC_APP_URL,
      variantId,
    })

    const supabase = createServerSupabaseClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    console.log("User authentication:", { 
      isAuthenticated: !!user, 
      userId: user?.id,
      userEmail: user?.email 
    })

    // Handle both authenticated and guest users
    const checkoutData = {
      variantId,
      ...(user && {
        userId: user.id,
        userEmail: user.email,
      }),
      redirectUrl: `${process.env.NEXT_PUBLIC_APP_URL}/checkout/success`,
    }

    console.log("Creating checkout with data:", { 
      ...checkoutData, 
      variantId: checkoutData.variantId,
      redirectUrl: checkoutData.redirectUrl 
    })

    const checkoutUrl = await createCheckout(checkoutData)

    if (!checkoutUrl) {
      console.error("No checkout URL returned from Lemon Squeezy")
      throw new Error("No checkout URL returned from Lemon Squeezy")
    }

    console.log("Checkout created successfully:", { checkoutUrl })

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
