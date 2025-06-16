import { type NextRequest, NextResponse } from "next/server"
import { LEMONSQUEEZY_CONFIG, LEMONSQUEEZY_BASE_URL } from "@/lib/stripe"

export async function POST(req: NextRequest) {
  try {
    const { variantId, userId, email } = await req.json()

    if (!variantId || !userId || !email) {
      return NextResponse.json({ error: "Missing required parameters" }, { status: 400 })
    }

    const checkoutData = {
      data: {
        type: "checkouts",
        attributes: {
          checkout_options: {
            embed: false,
            media: false,
            logo: true,
          },
          checkout_data: {
            email: email,
            custom: {
              user_id: userId,
            },
          },
          product_options: {
            name: "NutriMate Premium",
            description: "Unlock unlimited AI-powered meal planning and nutrition insights",
            media: ["https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=400&h=300&fit=crop"],
            redirect_url: `${req.headers.get("origin")}/checkout/success`,
            receipt_button_text: "Go to Dashboard",
            receipt_link_url: `${req.headers.get("origin")}/dashboard`,
          },
          test_mode: process.env.NODE_ENV !== "production",
        },
        relationships: {
          store: {
            data: {
              type: "stores",
              id: LEMONSQUEEZY_CONFIG.storeId,
            },
          },
          variant: {
            data: {
              type: "variants",
              id: variantId,
            },
          },
        },
      },
    }

    const response = await fetch(`${LEMONSQUEEZY_BASE_URL}/checkouts`, {
      method: "POST",
      headers: {
        Accept: "application/vnd.api+json",
        "Content-Type": "application/vnd.api+json",
        Authorization: `Bearer ${LEMONSQUEEZY_CONFIG.apiKey}`,
      },
      body: JSON.stringify(checkoutData),
    })

    if (!response.ok) {
      const errorData = await response.text()
      console.error("LemonSqueezy API error:", errorData)
      throw new Error(`LemonSqueezy API error: ${response.status}`)
    }

    const checkout = await response.json()
    return NextResponse.json({
      checkoutUrl: checkout.data.attributes.url,
      checkoutId: checkout.data.id,
    })
  } catch (err: any) {
    console.error("LemonSqueezy error:", err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
