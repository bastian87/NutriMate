// LemonSqueezy configuration
export const LEMONSQUEEZY_BASE_URL = "https://api.lemonsqueezy.com/v1"

export const LEMONSQUEEZY_CONFIG = {
  apiKey: process.env.LEMONSQUEEZY_API_KEY!,
  storeId: process.env.NEXT_PUBLIC_LEMONSQUEEZY_STORE_ID!,
  monthlyVariantId: process.env.NEXT_PUBLIC_LEMONSQUEEZY_MONTHLY_VARIANT_ID!,
  annualVariantId: process.env.NEXT_PUBLIC_LEMONSQUEEZY_ANNUAL_VARIANT_ID!,
  webhookSecret: process.env.LEMONSQUEEZY_WEBHOOK_SECRET!,
}

export interface CheckoutData {
  checkoutUrl: string
  checkoutId: string
}

export async function createCheckoutSession(
  variantId: string,
  userEmail: string,
  userId: string,
): Promise<CheckoutData> {
  const response = await fetch(`${LEMONSQUEEZY_BASE_URL}/checkouts`, {
    method: "POST",
    headers: {
      Accept: "application/vnd.api+json",
      "Content-Type": "application/vnd.api+json",
      Authorization: `Bearer ${LEMONSQUEEZY_CONFIG.apiKey}`,
    },
    body: JSON.stringify({
      data: {
        type: "checkouts",
        attributes: {
          checkout_data: {
            email: userEmail,
            custom: {
              user_id: userId,
            },
          },
        },
        relationships: {
          store: {
            data: {
              type: "stores",
              id: LEMONSQUEEZY_CONFIG.storeId,
            },
          },
          variant: {
            data: {
              type: "variants",
              id: variantId,
            },
          },
        },
      },
    }),
  })

  if (!response.ok) {
    throw new Error("Failed to create checkout session")
  }

  const data = await response.json()
  return {
    checkoutUrl: data.data.attributes.url,
    checkoutId: data.data.id,
  }
}
