"use client"

import { useState, useEffect } from "react"
import { useAuthContext } from "@/components/auth/auth-provider"
import { createClient } from "@/lib/supabase/client"

interface Subscription {
  id: string
  user_id: string
  subscription_id: string
  status: string
  plan_name: string
  current_period_start: string
  current_period_end: string
}

export function useSubscription() {
  const { user } = useAuthContext()
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    if (user) {
      fetchSubscription()
    } else {
      setSubscription(null)
      setLoading(false)
    }
  }, [user])

  const fetchSubscription = async () => {
    if (!user) return

    try {
      const { data, error } = await supabase
        .from("user_subscriptions")
        .select("*")
        .eq("user_id", user.id)
        .eq("status", "active")
        .single()

      if (error && error.code !== "PGRST116") {
        console.error("Error fetching subscription:", error)
      } else {
        setSubscription(data)
      }
    } catch (error) {
      console.error("Error fetching subscription:", error)
    } finally {
      setLoading(false)
    }
  }

  const isPremium = subscription?.status === "active"
  const isActive = subscription?.status === "active"

  return {
    subscription,
    loading,
    isPremium,
    isActive,
    refetch: fetchSubscription,
  }
}
