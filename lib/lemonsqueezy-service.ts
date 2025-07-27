import { LEMONSQUEEZY_CONFIG, LEMONSQUEEZY_BASE_URL } from "./stripe"

export interface LemonSqueezySubscription {
  id: string
  status: string
  customer_id: string
  order_id: string
  product_id: string
  variant_id: string
  product_name: string
  variant_name: string
  user_name: string
  user_email: string
  status_formatted: string
  card_brand: string
  card_last_four: string
  pause: any
  cancelled: boolean
  trial_ends_at: string | null
  billing_anchor: number
  created_at: string
  updated_at: string
  ends_at: string | null
  renews_at: string
}

export interface LemonSqueezyOrder {
  id: string
  store_id: string
  customer_id: string
  identifier: string
  order_number: number
  user_name: string
  user_email: string
  currency: string
  currency_rate: string
  subtotal: number
  discount_total: number
  tax: number
  total: number
  subtotal_usd: number
  discount_total_usd: number
  tax_usd: number
  total_usd: number
  tax_name: string
  tax_rate: string
  status: string
  status_formatted: string
  refunded: boolean
  refunded_at: string | null
  created_at: string
  updated_at: string
}

export async function getSubscription(subscriptionId: string): Promise<LemonSqueezySubscription | null> {
  try {
    const response = await fetch(`${LEMONSQUEEZY_BASE_URL}/subscriptions/${subscriptionId}`, {
      headers: {
        Accept: "application/vnd.api+json",
        "Content-Type": "application/vnd.api+json",
        Authorization: `Bearer ${LEMONSQUEEZY_CONFIG.apiKey}`,
      },
    })

    if (!response.ok) {
      if (response.status === 404) {
        console.error(`Subscription ${subscriptionId} not found in LemonSqueezy (possibly a test subscription)`)
        return null
      }
      throw new Error(`Failed to fetch subscription: ${response.status}`)
    }

    const data = await response.json()
    return data.data.attributes
  } catch (error) {
    console.error("Error fetching subscription:", error)
    return null
  }
}

export async function cancelSubscription(subscriptionId: string): Promise<boolean> {
  try {
    const response = await fetch(`${LEMONSQUEEZY_BASE_URL}/subscriptions/${subscriptionId}`, {
      method: "PATCH",
      headers: {
        Accept: "application/vnd.api+json",
        "Content-Type": "application/vnd.api+json",
        Authorization: `Bearer ${LEMONSQUEEZY_CONFIG.apiKey}`,
      },
      body: JSON.stringify({
        data: {
          type: "subscriptions",
          id: subscriptionId,
          attributes: {
            cancelled: true,
          },
        },
      }),
    })

    return response.ok
  } catch (error) {
    console.error("Error cancelling subscription:", error)
    return false
  }
}

export async function resumeSubscription(subscriptionId: string): Promise<boolean> {
  try {
    const response = await fetch(`${LEMONSQUEEZY_BASE_URL}/subscriptions/${subscriptionId}`, {
      method: "PATCH",
      headers: {
        Accept: "application/vnd.api+json",
        "Content-Type": "application/vnd.api+json",
        Authorization: `Bearer ${LEMONSQUEEZY_CONFIG.apiKey}`,
      },
      body: JSON.stringify({
        data: {
          type: "subscriptions",
          id: subscriptionId,
          attributes: {
            cancelled: false,
          },
        },
      }),
    })

    return response.ok
  } catch (error) {
    console.error("Error resuming subscription:", error)
    return false
  }
}

export async function getCustomerPortalUrl(subscriptionId: string): Promise<string | null> {
  try {
    console.log("getCustomerPortalUrl - Iniciando para subscriptionId:", subscriptionId)
    
    // Primero obtener la suscripción para obtener el customer_id
    const subscription = await getSubscription(subscriptionId)
    if (!subscription) {
      console.error("Could not fetch subscription to get customer_id")
      return null
    }

    console.log("Suscripción obtenida, customer_id:", subscription.customer_id)

    // URL de retorno por defecto
    const returnUrl = process.env.NEXT_PUBLIC_APP_URL 
      ? `${process.env.NEXT_PUBLIC_APP_URL}/account/subscription`
      : "https://nutrimate.app/account/subscription"

    console.log("URL de retorno configurada:", returnUrl)
    console.log("API Key configurada:", LEMONSQUEEZY_CONFIG.apiKey ? "Sí" : "No")
    console.log("API Key (primeros 10 caracteres):", LEMONSQUEEZY_CONFIG.apiKey ? LEMONSQUEEZY_CONFIG.apiKey.substring(0, 10) + "..." : "No configurada")

    // Generar el portal del cliente usando el customer_id
    const portalUrl = `${LEMONSQUEEZY_BASE_URL}/customers/${subscription.customer_id}/portal`
    console.log("URL del portal a llamar:", portalUrl)
    
    const requestBody = {
      data: {
        type: "customer-portals",
        attributes: {
          return_url: returnUrl,
        },
      },
    }
    
    console.log("Cuerpo de la petición:", JSON.stringify(requestBody, null, 2))

    const response = await fetch(portalUrl, {
      method: "POST",
      headers: {
        Accept: "application/vnd.api+json",
        "Content-Type": "application/vnd.api+json",
        Authorization: `Bearer ${LEMONSQUEEZY_CONFIG.apiKey}`,
      },
      body: JSON.stringify(requestBody),
    })

    console.log("Respuesta del portal de facturación:", response.status, response.statusText)
    console.log("Headers de respuesta:", Object.fromEntries(response.headers.entries()))

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`Failed to create customer portal: ${response.status} - ${errorText}`)
      
      // Si es un error 404, probablemente es una suscripción de prueba
      if (response.status === 404) {
        console.error("Customer portal not available for test subscription")
        return null
      }
      
      // Log adicional para otros errores
      if (response.status === 401) {
        console.error("Error de autenticación - API key inválida")
      } else if (response.status === 403) {
        console.error("Error de permisos - API key no tiene permisos para crear portales")
      } else if (response.status === 422) {
        console.error("Error de validación - datos de la petición inválidos")
      } else if (response.status === 500) {
        console.error("Error interno del servidor de LemonSqueezy")
      }
      
      // Intentar método alternativo: generar URL directa del portal
      console.log("Intentando método alternativo: URL directa del portal")
      const alternativeUrl = generateAlternativePortalUrl(subscription.customer_id, returnUrl)
      if (alternativeUrl) {
        console.log("URL alternativa generada:", alternativeUrl)
        return alternativeUrl
      }
      
      return null
    }

    const data = await response.json()
    console.log("Respuesta completa del portal:", JSON.stringify(data, null, 2))
    console.log("Portal URL generada exitosamente:", data.data.attributes.url)
    return data.data.attributes.url
  } catch (error) {
    console.error("Error getting customer portal URL:", error)
    console.error("Stack trace:", error instanceof Error ? error.stack : "No stack trace available")
    
    // Intentar método alternativo en caso de error
    try {
      const subscription = await getSubscription(subscriptionId)
      if (subscription) {
        const returnUrl = process.env.NEXT_PUBLIC_APP_URL 
          ? `${process.env.NEXT_PUBLIC_APP_URL}/account/subscription`
          : "https://nutrimate.app/account/subscription"
        
        const alternativeUrl = generateAlternativePortalUrl(subscription.customer_id, returnUrl)
        if (alternativeUrl) {
          console.log("URL alternativa generada después de error:", alternativeUrl)
          return alternativeUrl
        }
      }
    } catch (altError) {
      console.error("Error en método alternativo:", altError)
    }
    
    return null
  }
}

// Función alternativa para generar URL del portal
function generateAlternativePortalUrl(customerId: string, returnUrl: string): string | null {
  try {
    // Generar una URL del portal usando el customer_id directamente
    // Esta es una URL que debería funcionar para acceder al portal de facturación
    const portalUrl = `https://app.lemonsqueezy.com/billing?customer=${customerId}&return_url=${encodeURIComponent(returnUrl)}`
    console.log("URL alternativa generada:", portalUrl)
    return portalUrl
  } catch (error) {
    console.error("Error generando URL alternativa:", error)
    return null
  }
}

export async function validateWebhookSignature(payload: string, signature: string): Promise<boolean> {
  const crypto = require("crypto")
  const secret = process.env.LEMONSQUEEZY_WEBHOOK_SECRET!

  const hmac = crypto.createHmac("sha256", secret)
  hmac.update(payload)
  const digest = hmac.digest("hex")

  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(digest))
}
