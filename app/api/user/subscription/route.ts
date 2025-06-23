import { type NextRequest, NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase/server"
import { cancelSubscription, resumeSubscription, getCustomerPortalUrl, getSubscription } from "@/lib/lemonsqueezy-service"

export async function POST(request: NextRequest) {
  // Cancelar suscripción
  try {
    const supabase = createServerSupabaseClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Buscar el subscription_id del usuario
    const { data: subData, error: subError } = await supabase
      .from("user_subscriptions")
      .select("subscription_id")
      .eq("user_id", user.id)
      .single()

    if (subError || !subData?.subscription_id) {
      return NextResponse.json({ error: "No subscription found" }, { status: 404 })
    }

    // Cancelar en LemonSqueezy
    const ok = await cancelSubscription(subData.subscription_id)
    if (!ok) {
      return NextResponse.json({ error: "Failed to cancel subscription in LemonSqueezy" }, { status: 500 })
    }

    // Actualizar estado en la base de datos
    await supabase
      .from("user_subscriptions")
      .update({ status: "cancelled", updated_at: new Date().toISOString() })
      .eq("user_id", user.id)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Cancel subscription error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  // Reactivar suscripción
  try {
    const supabase = createServerSupabaseClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Buscar el subscription_id del usuario
    const { data: subData, error: subError } = await supabase
      .from("user_subscriptions")
      .select("subscription_id")
      .eq("user_id", user.id)
      .single()

    if (subError || !subData?.subscription_id) {
      return NextResponse.json({ error: "No subscription found" }, { status: 404 })
    }

    // Reactivar en LemonSqueezy
    const ok = await resumeSubscription(subData.subscription_id)
    if (!ok) {
      return NextResponse.json({ error: "Failed to reactivate subscription in LemonSqueezy" }, { status: 500 })
    }

    // Actualizar estado en la base de datos
    await supabase
      .from("user_subscriptions")
      .update({ status: "active", updated_at: new Date().toISOString() })
      .eq("user_id", user.id)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Reactivate subscription error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  // Obtener URL del portal de facturación
  try {
    const supabase = createServerSupabaseClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Buscar el subscription_id del usuario
    const { data: subData, error: subError } = await supabase
      .from("user_subscriptions")
      .select("subscription_id, status")
      .eq("user_id", user.id)
      .single()

    if (subError || !subData?.subscription_id) {
      console.error("Subscription lookup error:", subError)
      return NextResponse.json({ 
        error: "No subscription found", 
        details: "User does not have an active subscription" 
      }, { status: 404 })
    }

    console.log("Attempting to get portal URL for subscription:", subData.subscription_id)
    
    const url = await getCustomerPortalUrl(subData.subscription_id)
    if (!url) {
      console.error("Failed to generate customer portal URL")
      
      // Verificar si la suscripción existe en LemonSqueezy
      const subscription = await getSubscription(subData.subscription_id)
      if (!subscription) {
        // Verificar si estamos en modo de desarrollo
        const isDevelopment = process.env.NODE_ENV !== "production"
        
        if (isDevelopment) {
          return NextResponse.json({ 
            error: "Test subscription portal not available", 
            details: "You are using a test subscription in development mode. Test subscriptions may not have access to the billing portal. Please create a new subscription in production mode to access billing features.",
            subscriptionId: subData.subscription_id,
            status: subData.status,
            isTestMode: true
          }, { status: 400 })
        } else {
          return NextResponse.json({ 
            error: "Subscription not found in LemonSqueezy", 
            details: "Your subscription exists in our database but not in the payment system. Please contact support to resolve this issue.",
            subscriptionId: subData.subscription_id,
            status: subData.status
          }, { status: 500 })
        }
      }
      
      return NextResponse.json({ 
        error: "No portal URL available", 
        details: "Could not generate billing portal URL. Please try again later." 
      }, { status: 500 })
    }

    console.log("Successfully generated portal URL")
    return NextResponse.json({ url })
  } catch (error) {
    console.error("Get billing portal URL error:", error)
    return NextResponse.json({ 
      error: "Internal server error",
      details: "An unexpected error occurred while generating the billing portal URL"
    }, { status: 500 })
  }
} 