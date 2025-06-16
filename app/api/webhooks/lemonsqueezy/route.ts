import { type NextRequest, NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase/server"
import crypto from "crypto"

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const signature = request.headers.get("x-signature")

    // Verify webhook signature
    const secret = process.env.LEMONSQUEEZY_WEBHOOK_SECRET!
    const hmac = crypto.createHmac("sha256", secret)
    hmac.update(body)
    const digest = hmac.digest("hex")

    if (signature !== digest) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 })
    }

    const event = JSON.parse(body)
    const supabase = createServerSupabaseClient()

    switch (event.meta.event_name) {
      case "subscription_created":
      case "subscription_updated": {
        const subscription = event.data
        const userId = subscription.attributes.custom_data?.user_id

        if (userId) {
          await supabase.from("user_subscriptions").upsert({
            user_id: userId,
            subscription_id: subscription.id,
            status: subscription.attributes.status,
            plan_name: subscription.attributes.product_name,
            current_period_start: subscription.attributes.current_period_start,
            current_period_end: subscription.attributes.current_period_end,
            updated_at: new Date().toISOString(),
          })
        }
        break
      }

      case "subscription_cancelled": {
        const subscription = event.data
        const userId = subscription.attributes.custom_data?.user_id

        if (userId) {
          await supabase
            .from("user_subscriptions")
            .update({
              status: "cancelled",
              updated_at: new Date().toISOString(),
            })
            .eq("subscription_id", subscription.id)
        }
        break
      }
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error("Webhook error:", error)
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 })
  }
}
