import { useEffect, useState } from "react"
import { useAuthContext } from "@/components/auth/auth-provider"
import { useIsPremium } from "@/components/auth/user-profile-provider"
import { supabase } from "@/lib/supabase/client"

export function usePremiumStatus() {
  const { user } = useAuthContext()
  const contextIsPremium = useIsPremium()
  const [dbIsPremium, setDbIsPremium] = useState<boolean | null>(null)
  const [isChecking, setIsChecking] = useState(false)

  // Verificar estado premium en la base de datos
  const checkPremiumStatus = async () => {
    if (!user) return

    setIsChecking(true)
    try {
      const { data, error } = await supabase
        .from("user_subscriptions")
        .select("status")
        .eq("user_id", user.id)
        .eq("status", "active")
        .single()

      const hasActiveSubscription = !!data
      setDbIsPremium(hasActiveSubscription)

      // Si hay discrepancia entre contexto y base de datos, log para debugging
      if (contextIsPremium !== hasActiveSubscription) {
        console.warn("Discrepancia detectada en estado premium:", {
          contextIsPremium,
          dbIsPremium: hasActiveSubscription,
          userId: user.id
        })
      }

      return hasActiveSubscription
    } catch (error) {
      console.error("Error checking premium status:", error)
      setDbIsPremium(false)
      return false
    } finally {
      setIsChecking(false)
    }
  }

  // Verificar al montar el hook
  useEffect(() => {
    checkPremiumStatus()
  }, [user])

  return {
    isPremium: contextIsPremium,
    dbIsPremium,
    isChecking,
    checkPremiumStatus,
    isConsistent: dbIsPremium === null || contextIsPremium === dbIsPremium
  }
} 