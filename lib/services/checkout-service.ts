interface CreateCheckoutParams {
  plan: "monthly" | "annual"
}

interface CheckoutResponse {
  checkoutUrl: string
  success: boolean
}

class CheckoutService {
  async createCheckout({ plan }: CreateCheckoutParams): Promise<CheckoutResponse> {
    try {
      // Get the correct variant ID based on plan
      const variantId =
        plan === "monthly"
          ? process.env.NEXT_PUBLIC_LEMONSQUEEZY_MONTHLY_VARIANT_ID
          : process.env.NEXT_PUBLIC_LEMONSQUEEZY_ANNUAL_VARIANT_ID

      if (!variantId) {
        throw new Error(`No variant ID configured for ${plan} plan`)
      }

      const response = await fetch("/api/create-checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          variantId,
          plan,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.details || errorData.error || "Failed to create checkout")
      }

      const data = await response.json()
      return data
    } catch (error) {
      console.error("Checkout service error:", error)
      throw error
    }
  }

  // Helper method to redirect to checkout
  async redirectToCheckout(plan: "monthly" | "annual") {
    try {
      const { checkoutUrl } = await this.createCheckout({ plan })
      window.location.href = checkoutUrl
    } catch (error) {
      console.error("Failed to redirect to checkout:", error)
      throw error
    }
  }
}

export const checkoutService = new CheckoutService()
