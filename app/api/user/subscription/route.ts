import { type NextRequest, NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase/server"
import { cancelSubscription, resumeSubscription, getCustomerPortalUrl, getSubscription, getDirectBillingPortalUrl } from "@/lib/lemonsqueezy-service"

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
    console.log("GET /api/user/subscription - Iniciando solicitud de portal de facturación")
    
    const supabase = createServerSupabaseClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      console.error("Error de autenticación:", authError)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    console.log("Usuario autenticado:", user.id)

    // Buscar el subscription_id del usuario
    const { data: subData, error: subError } = await supabase
      .from("user_subscriptions")
      .select("subscription_id, status, customer_id")
      .eq("user_id", user.id)
      .single()

    if (subError || !subData?.subscription_id) {
      console.error("Error al buscar suscripción:", subError)
      return NextResponse.json({ 
        error: "No subscription found", 
        details: "User does not have an active subscription" 
      }, { status: 404 })
    }

    console.log("Suscripción encontrada:", { 
      subscriptionId: subData.subscription_id, 
      status: subData.status 
    })
    
    // Intentar obtener la URL del portal usando la API de LemonSqueezy
    const url = await getCustomerPortalUrl(subData.subscription_id)
    
    if (!url) {
      console.log("No se pudo generar URL del portal con la API, usando método directo")
      
      // Usar el método directo como fallback
      const directUrl = getDirectBillingPortalUrl(subData.customer_id)
      console.log("URL directa generada:", directUrl)
      
      return NextResponse.json({ 
        url: directUrl,
        method: "direct",
        customerId: subData.customer_id
      })
    }

    console.log("URL del portal generada exitosamente con API")
    return NextResponse.json({ 
      url,
      method: "api"
    })
  } catch (error) {
    console.error("Error in GET /api/user/subscription:", error)
    
    // Como último recurso, intentar generar la URL directa
    try {
      const supabase = createServerSupabaseClient()
      const { data: { user } } = await supabase.auth.getUser()
      
      if (user) {
        const { data: subData } = await supabase
          .from("user_subscriptions")
          .select("customer_id")
          .eq("user_id", user.id)
          .single()
        
        if (subData?.customer_id) {
          const directUrl = getDirectBillingPortalUrl(subData.customer_id)
          console.log("URL directa generada como último recurso:", directUrl)
          
          return NextResponse.json({ 
            url: directUrl,
            method: "direct_fallback",
            customerId: subData.customer_id
          })
        }
      }
    } catch (fallbackError) {
      console.error("Error en fallback:", fallbackError)
    }
    
    return NextResponse.json({ 
      error: "Internal server error",
      details: "An unexpected error occurred while generating the billing portal URL"
    }, { status: 500 })
  }
} 