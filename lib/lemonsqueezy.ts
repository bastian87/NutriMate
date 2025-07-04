const LEMONSQUEEZY_API_URL = "https://api.lemonsqueezy.com/v1"

interface CreateCheckoutData {
  variantId: string
  userId?: string
  userEmail?: string
  redirectUrl?: string
}

async function makeRequest(endpoint: string, options: RequestInit = {}) {
  const response = await fetch(`${LEMONSQUEEZY_API_URL}${endpoint}`, {
    ...options,
    headers: {
      Accept: "application/vnd.api+json",
      "Content-Type": "application/vnd.api+json",
      Authorization: `Bearer ${process.env.LEMONSQUEEZY_API_KEY}`,
      ...options.headers,
    },
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`Lemon Squeezy API error: ${response.status} - ${errorText}`)
  }

  return response.json()
}

export async function createCheckout(data: CreateCheckoutData) {
  try {
    // LOGS DE DEPURACIÓN
    console.log("[LemonSqueezy] Store ID:", process.env.NEXT_PUBLIC_LEMONSQUEEZY_STORE_ID);
    console.log("[LemonSqueezy] API Key exists:", !!process.env.LEMONSQUEEZY_API_KEY);
    console.log("[LemonSqueezy] Variant ID:", data.variantId);
    console.log("[LemonSqueezy] Checkout data:", JSON.stringify(data, null, 2));

    const checkoutData = {
      data: {
        type: "checkouts",
        attributes: {
          checkout_options: {
            embed: false,
            media: true,
            logo: true,
          },
          checkout_data: {
            ...(data.userEmail && { email: data.userEmail }),
            ...(data.userId && {
              custom: {
                user_id: data.userId,
              },
            }),
          },
          expires_at: null,
          preview: false,
          test_mode: process.env.NODE_ENV !== "production",
        },
        relationships: {
          store: {
            data: {
              type: "stores",
              id: process.env.NEXT_PUBLIC_LEMONSQUEEZY_STORE_ID!,
            },
          },
          variant: {
            data: {
              type: "variants",
              id: data.variantId,
            },
          },
        },
      },
    }

    // LOG antes de la petición
    console.log("[LemonSqueezy] Payload enviado:", JSON.stringify(checkoutData, null, 2));

    const response = await makeRequest("/checkouts", {
      method: "POST",
      body: JSON.stringify(checkoutData),
    })

    // LOG de la respuesta
    console.log("[LemonSqueezy] Respuesta:", JSON.stringify(response, null, 2));

    const checkoutUrl = response.data?.attributes?.url
    if (!checkoutUrl) {
      throw new Error("No checkout URL returned from Lemon Squeezy")
    }

    return checkoutUrl
  } catch (error) {
    // LOG del error
    console.error("[LemonSqueezy] Error al crear checkout:", error);
    throw new Error(`Failed to create checkout session: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

export async function getSubscription(subscriptionId: string) {
  try {
    const response = await makeRequest(`/subscriptions/${subscriptionId}`)
    return response.data
  } catch (error) {
    return null
  }
}

export async function cancelSubscription(subscriptionId: string) {
  try {
    const response = await makeRequest(`/subscriptions/${subscriptionId}`, {
      method: "PATCH",
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
    return response.data
  } catch (error) {
    throw new Error("Failed to cancel subscription")
  }
}
