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
    console.error(`Lemon Squeezy API error: ${response.status} - ${errorText}`)
    throw new Error(`Lemon Squeezy API error: ${response.status}`)
  }

  return response.json()
}

export async function createCheckout(data: CreateCheckoutData) {
  try {
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

    const response = await makeRequest("/checkouts", {
      method: "POST",
      body: JSON.stringify(checkoutData),
    })

    return response.data?.attributes?.url
  } catch (error) {
    console.error("Error creating checkout:", error)
    throw new Error("Failed to create checkout session")
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
