import { type NextRequest, NextResponse } from "next/server"
import { createClient } from '@supabase/supabase-js'
import crypto from "crypto"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const signature = request.headers.get("x-signature")

    // LOG: Verifica que el webhook llega
    console.log("LemonSqueezy Webhook recibido")
    console.log("Body:", body)
    console.log("Signature:", signature)

    // Verify webhook signature
    const secret = process.env.LEMONSQUEEZY_WEBHOOK_SECRET!
    const hmac = crypto.createHmac("sha256", secret)
    hmac.update(body)
    const digest = hmac.digest("hex")

    if (signature !== digest) {
      console.log("Firma inválida")
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 })
    }

    const event = JSON.parse(body)

    console.log("Evento recibido:", event.meta.event_name)
    console.log("Datos del evento:", event.data)

    switch (event.meta.event_name) {
      case "subscription_created":
      case "subscription_updated": {
        console.log("Evento de suscripción recibido:", event.meta.event_name, event.data)
        const subscription = event.data
        const userId =
          subscription.attributes.custom_data?.user_id ||
          event.meta.custom_data?.user_id;
        console.log("userId extraído:", userId)

        if (userId) {
          const { error, data } = await supabase.from("user_subscriptions").upsert({
            user_id: userId,
            subscription_id: subscription.id,
            status: subscription.attributes.status,
            plan_name: subscription.attributes.product_name,
            current_period_start: subscription.attributes.current_period_start,
            current_period_end: subscription.attributes.current_period_end,
            updated_at: new Date().toISOString(),
          });
          if (error) {
            console.error("Error al hacer upsert en user_subscriptions:", error);
          } else {
            console.log("Upsert exitoso en user_subscriptions:", data);
          }
        }
        break
      }

      case "subscription_cancelled": {
        const subscription = event.data
        const userId =
          subscription.attributes.custom_data?.user_id ||
          event.meta.custom_data?.user_id;

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
