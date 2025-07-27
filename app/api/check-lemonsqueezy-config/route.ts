import { NextResponse } from "next/server"
import { LEMONSQUEEZY_BASE_URL, LEMONSQUEEZY_CONFIG } from "@/lib/stripe"

export async function GET() {
  try {
    console.log("Verificando configuración de LemonSqueezy...")
    
    // Obtener información de la tienda para ver la configuración
    const response = await fetch(`${LEMONSQUEEZY_BASE_URL}/stores/${LEMONSQUEEZY_CONFIG.storeId}`, {
      headers: {
        Accept: "application/vnd.api+json",
        Authorization: `Bearer ${LEMONSQUEEZY_CONFIG.apiKey}`,
      },
    })

    if (!response.ok) {
      const errorText = await response.text()
      return NextResponse.json({
        success: false,
        error: `Error ${response.status}: ${response.statusText}`,
        details: errorText
      })
    }

    const data = await response.json()
    const storeInfo = data.data.attributes
    
    // Verificar si hay configuración específica del portal de clientes
    // Nota: LemonSqueezy no expone directamente la URL de retorno del portal en la API
    // pero podemos verificar la configuración general de la tienda
    
    return NextResponse.json({
      success: true,
      storeInfo: {
        name: storeInfo.name,
        slug: storeInfo.slug,
        domain: storeInfo.domain,
        url: storeInfo.url,
        country: storeInfo.country,
        currency: storeInfo.currency
      },
      recommendations: [
        "1. Ve a https://app.lemonsqueezy.com",
        "2. Selecciona tu tienda (Nutrimate)",
        "3. Ve a Settings > Store Settings",
        "4. Busca 'Customer Portal' o 'Billing Portal'",
        "5. Configura la URL de retorno como: https://nutrimate.app/account/subscription"
      ],
      manualCheckRequired: true
    })

  } catch (error: any) {
    console.error("Error verificando configuración de LemonSqueezy:", error)
    
    return NextResponse.json({
      success: false,
      error: error.message,
      recommendations: [
        "Verifica manualmente en https://app.lemonsqueezy.com",
        "Busca la configuración del portal de clientes",
        "Configura la URL de retorno como: https://nutrimate.app/account/subscription"
      ]
    })
  }
} 