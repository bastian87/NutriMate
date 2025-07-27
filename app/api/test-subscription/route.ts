import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase/server"
import { getSubscription } from "@/lib/lemonsqueezy-service"

export async function GET() {
  try {
    console.log("Probando suscripción específica en LemonSqueezy...")
    
    const supabase = createServerSupabaseClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Buscar la suscripción del usuario
    const { data: subData, error: subError } = await supabase
      .from("user_subscriptions")
      .select("subscription_id, status, customer_id")
      .eq("user_id", user.id)
      .single()

    if (subError || !subData?.subscription_id) {
      return NextResponse.json({ 
        error: "No subscription found", 
        details: "User does not have an active subscription" 
      }, { status: 404 })
    }

    console.log("Suscripción encontrada:", subData)

    // Probar obtener la suscripción desde LemonSqueezy
    const subscription = await getSubscription(subData.subscription_id)
    
    if (!subscription) {
      return NextResponse.json({
        success: false,
        error: "Subscription not found in LemonSqueezy",
        details: "La suscripción existe en la base de datos pero no se encuentra en LemonSqueezy",
        subscriptionId: subData.subscription_id,
        customerId: subData.customer_id,
        status: subData.status
      })
    }

    return NextResponse.json({
      success: true,
      subscription: {
        id: subscription.id,
        status: subscription.status,
        customer_id: subscription.customer_id,
        product_name: subscription.product_name,
        variant_name: subscription.variant_name,
        cancelled: subscription.cancelled,
        ends_at: subscription.ends_at,
        renews_at: subscription.renews_at
      },
      databaseSubscription: subData
    })

  } catch (error: any) {
    console.error("Error probando suscripción:", error)
    
    return NextResponse.json({
      success: false,
      error: error.message
    })
  }
} 