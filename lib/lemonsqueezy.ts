const LEMONSQUEEZY_API_URL = "https://api.lemonsqueezy.com/v1"

interface CreateCheckoutData {
  variantId: string
  userId?: string
  userEmail?: string
  redirectUrl?: string
}

async function makeRequest(endpoint: string, options: RequestInit = {}) {
  console.log(`Making request to LemonSqueezy: ${LEMONSQUEEZY_API_URL}${endpoint}`)
  
  const response = await fetch(`${LEMONSQUEEZY_API_URL}${endpoint}`, {
    ...options,
    headers: {
      Accept: "application/vnd.api+json",
      "Content-Type": "application/vnd.api+json",
      Authorization: `Bearer ${process.env.LEMONSQUEEZY_API_KEY}`,
      ...options.headers,
    },
  })

  console.log(`LemonSqueezy response status: ${response.status}`)

  if (!response.ok) {
    const errorText = await response.text()
    console.error(`Lemon Squeezy API error: ${response.status} - ${errorText}`)
    throw new Error(`Lemon Squeezy API error: ${response.status} - ${errorText}`)
  }

  return response.json()
}

export async function createCheckout(data: CreateCheckoutData) {
  try {
    console.log("createCheckout called with data:", { 
      variantId: data.variantId,
      hasUserId: !!data.userId,
      hasUserEmail: !!data.userEmail,
      hasRedirectUrl: !!data.redirectUrl
    })

    // Validate required environment variables
    if (!process.env.NEXT_PUBLIC_LEMONSQUEEZY_STORE_ID) {
      throw new Error("NEXT_PUBLIC_LEMONSQUEEZY_STORE_ID is not configured")
    }
    if (!process.env.LEMONSQUEEZY_API_KEY) {
      throw new Error("LEMONSQUEEZY_API_KEY is not configured")
    }

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

    console.log("Sending checkout data to LemonSqueezy:", {
      storeId: process.env.NEXT_PUBLIC_LEMONSQUEEZY_STORE_ID,
      variantId: data.variantId,
      testMode: process.env.NODE_ENV !== "production"
    })

    const response = await makeRequest("/checkouts", {
      method: "POST",
      body: JSON.stringify(checkoutData),
    })

    console.log("LemonSqueezy response received:", {
      hasData: !!response.data,
      hasAttributes: !!response.data?.attributes,
      hasUrl: !!response.data?.attributes?.url
    })

    const checkoutUrl = response.data?.attributes?.url
    if (!checkoutUrl) {
      console.error("No checkout URL in response:", response)
      throw new Error("No checkout URL returned from Lemon Squeezy")
    }

    console.log("Checkout URL generated successfully:", checkoutUrl)
    return checkoutUrl
  } catch (error) {
    console.error("Error creating checkout:", error)
    throw new Error(`Failed to create checkout session: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

export async function getSubscription(subscriptionId: string) {
  try {
    const response = await makeRequest(`/subscriptions/${subscriptionId}`)
    return response.data
  } catch (error) {
    console.error("Error fetching subscription:", error)
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
    console.error("Error canceling subscription:", error)
    throw new Error("Failed to cancel subscription")
  }
}
