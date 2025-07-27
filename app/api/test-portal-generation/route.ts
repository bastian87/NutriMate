import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase/server"
import { LEMONSQUEEZY_BASE_URL, LEMONSQUEEZY_CONFIG } from "@/lib/stripe"

export async function GET() {
  try {
    console.log("Probando diferentes métodos de generación de portal...")
    
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

    const customerId = subData.customer_id
    console.log("Customer ID:", customerId)

    // Probar diferentes URLs de retorno
    const returnUrls = [
      "https://nutrimate.app/account/subscription",
      "https://nutrimate.net/account/subscription",
      "http://localhost:3000/account/subscription",
      "https://nutrimate.lemonsqueezy.com"
    ]

    const results = []

    for (const returnUrl of returnUrls) {
      console.log(`Probando con return_url: ${returnUrl}`)
      
      try {
        const response = await fetch(`${LEMONSQUEEZY_BASE_URL}/customers/${customerId}/portal`, {
          method: "POST",
          headers: {
            Accept: "application/vnd.api+json",
            "Content-Type": "application/vnd.api+json",
            Authorization: `Bearer ${LEMONSQUEEZY_CONFIG.apiKey}`,
          },
          body: JSON.stringify({
            data: {
              type: "customer-portals",
              attributes: {
                return_url: returnUrl,
              },
            },
          }),
        })

        const result: {
          returnUrl: string;
          status: number;
          statusText: string;
          success: boolean;
          error: string | null;
          url: string | null;
        } = {
          returnUrl,
          status: response.status,
          statusText: response.statusText,
          success: response.ok,
          error: null,
          url: null
        }

        if (response.ok) {
          const data = await response.json()
          result.url = data.data.attributes.url
          console.log(`✅ Éxito con ${returnUrl}:`, result.url)
        } else {
          const errorText = await response.text()
          result.error = errorText
          console.log(`❌ Error con ${returnUrl}:`, response.status, errorText)
        }

        results.push(result)

        // Si encontramos una URL exitosa, no necesitamos probar más
        if (result.success) {
          break
        }

      } catch (error: any) {
        console.error(`Error probando ${returnUrl}:`, error)
        results.push({
          returnUrl,
          status: 0,
          statusText: "Network Error",
          success: false,
          error: error.message,
          url: null
        })
      }
    }

    // Verificar si alguna prueba fue exitosa
    const successfulResult = results.find(r => r.success)
    
    return NextResponse.json({
      success: !!successfulResult,
      results,
      successfulUrl: successfulResult?.url || null,
      customerId,
      subscriptionId: subData.subscription_id
    })

  } catch (error: any) {
    console.error("Error en test-portal-generation:", error)
    
    return NextResponse.json({
      success: false,
      error: error.message
    })
  }
} 