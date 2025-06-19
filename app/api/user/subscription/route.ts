import { type NextRequest, NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase/server"
import { cancelSubscription, resumeSubscription, getCustomerPortalUrl } from "@/lib/lemonsqueezy-service"

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
      .select("subscription_id")
      .eq("user_id", user.id)
      .single()

    if (subError || !subData?.subscription_id) {
      return NextResponse.json({ error: "No subscription found" }, { status: 404 })
    }

    const url = await getCustomerPortalUrl(subData.subscription_id)
    if (!url) {
      return NextResponse.json({ error: "No portal URL available" }, { status: 500 })
    }

    return NextResponse.json({ url })
  } catch (error) {
    console.error("Get billing portal URL error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
} 