"use client"

import { useState, useEffect } from "react"
import { useAuthContext } from "@/components/auth/simple-auth-provider"
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
    if (!user) {
      setSubscription(null)
      setLoading(false)
      return
    }

    try {
      const { data, error } = await supabase
        .from("user_subscriptions")
        .select("*")
        .eq("user_id", user.id)
        .eq("status", "active")
        .maybeSingle()

      if (error) {
        // Solo logear errores que no sean "no encontrado"
        if (error.code !== "PGRST116") {
          console.error("Error fetching subscription:", error)
        }
        setSubscription(null)
      } else {
        setSubscription(data)
      }
    } catch (error) {
      console.error("Exception fetching subscription:", error)
      setSubscription(null)
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
