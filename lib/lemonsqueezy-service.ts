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
    // Primero obtener la suscripción para obtener el customer_id
    const subscription = await getSubscription(subscriptionId)
    if (!subscription) {
      console.error("Could not fetch subscription to get customer_id")
      return null
    }

    // URL de retorno por defecto
    const returnUrl = process.env.NEXT_PUBLIC_APP_URL 
      ? `${process.env.NEXT_PUBLIC_APP_URL}/account/subscription`
      : "https://nutrimate.app/account/subscription"

    // Generar el portal del cliente usando el customer_id
    const response = await fetch(`${LEMONSQUEEZY_BASE_URL}/customers/${subscription.customer_id}/portal`, {
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

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`Failed to create customer portal: ${response.status} - ${errorText}`)
      
      // Si es un error 404, probablemente es una suscripción de prueba
      if (response.status === 404) {
        console.error("Customer portal not available for test subscription")
        return null
      }
      
      return null
    }

    const data = await response.json()
    return data.data.attributes.url
  } catch (error) {
    console.error("Error getting customer portal URL:", error)
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
