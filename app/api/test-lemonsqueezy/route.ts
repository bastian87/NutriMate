import { NextResponse } from "next/server"
import { LEMONSQUEEZY_BASE_URL, LEMONSQUEEZY_CONFIG } from "@/lib/stripe"

export async function GET() {
  try {
    console.log("Probando conectividad con LemonSqueezy...")
    console.log("API Key configurada:", LEMONSQUEEZY_CONFIG.apiKey ? "Sí" : "No")
    console.log("Store ID configurado:", LEMONSQUEEZY_CONFIG.storeId ? "Sí" : "No")

    // Probar la API key haciendo una petición simple
    const response = await fetch(`${LEMONSQUEEZY_BASE_URL}/stores/${LEMONSQUEEZY_CONFIG.storeId}`, {
      headers: {
        Accept: "application/vnd.api+json",
        Authorization: `Bearer ${LEMONSQUEEZY_CONFIG.apiKey}`,
      },
    })

    console.log("Respuesta de la API de LemonSqueezy:", response.status, response.statusText)

    if (!response.ok) {
      const errorText = await response.text()
      console.error("Error en la API de LemonSqueezy:", errorText)
      
      return NextResponse.json({
        success: false,
        error: `Error ${response.status}: ${response.statusText}`,
        details: errorText,
        apiKeyConfigured: !!LEMONSQUEEZY_CONFIG.apiKey,
        storeIdConfigured: !!LEMONSQUEEZY_CONFIG.storeId
      })
    }

    const data = await response.json()
    
    return NextResponse.json({
      success: true,
      storeInfo: data.data.attributes,
      apiKeyConfigured: !!LEMONSQUEEZY_CONFIG.apiKey,
      storeIdConfigured: !!LEMONSQUEEZY_CONFIG.storeId
    })

  } catch (error: any) {
    console.error("Error probando LemonSqueezy:", error)
    
    return NextResponse.json({
      success: false,
      error: error.message,
      apiKeyConfigured: !!LEMONSQUEEZY_CONFIG.apiKey,
      storeIdConfigured: !!LEMONSQUEEZY_CONFIG.storeId
    })
  }
} 