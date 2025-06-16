import { type NextRequest, NextResponse } from "next/server"
import { createCheckout } from "@/lib/lemonsqueezy"
import { createServerSupabaseClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  try {
    const { variantId, plan } = await request.json()

    const supabase = createServerSupabaseClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const checkoutUrl = await createCheckout({
      variantId,
      userId: user.id,
      userEmail: user.email!,
      redirectUrl: `${process.env.NEXT_PUBLIC_APP_URL}/checkout/success`,
    })

    return NextResponse.json({ checkoutUrl })
  } catch (error) {
    console.error("Checkout creation error:", error)
    return NextResponse.json({ error: "Failed to create checkout" }, { status: 500 })
  }
}
