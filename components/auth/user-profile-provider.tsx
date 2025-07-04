"use client"

import React, { createContext, useContext, useState, useEffect, useCallback } from "react"
import { useAuthContext } from "./auth-provider"
import { supabase } from "@/lib/supabase/client"
import type { UserPreferences } from "@/lib/types/database"
import { Subscription, UsageLimit, getUserSubscription, getUserUsage } from "@/lib/subscription-service"

// Tipos para el perfil completo del usuario
interface UserProfile {
  id: string
  email: string
  full_name: string | null
  avatar_url: string | null
  created_at: string
  updated_at: string
}

interface UserProfileData {
  profile: UserProfile | null
  preferences: UserPreferences | null
  subscription: Subscription | null
  usage: UsageLimit | null
  isPremium: boolean
  accountType: "free" | "premium"
}

interface UserProfileContextType {
  userData: UserProfileData | null
  loading: boolean
  error: string | null
  fetchUserProfile: () => Promise<void>
  refreshUserProfile: () => Promise<void>
  updateUserProfile: (updates: Partial<UserProfile>) => Promise<void>
  updateUserPreferences: (updates: Partial<UserPreferences>) => Promise<void>
}

const UserProfileContext = createContext<UserProfileContextType | undefined>(undefined)

// Función para obtener datos iniciales del localStorage
const getInitialUserData = (): UserProfileData | null => {
  if (typeof window === 'undefined') return null
  try {
    const stored = localStorage.getItem("userProfileData")
    if (stored) {
      const parsed = JSON.parse(stored)
      // Verificar que los datos no sean muy antiguos (máximo 1 hora)
      const oneHourAgo = Date.now() - (60 * 60 * 1000)
      if (parsed.timestamp && parsed.timestamp > oneHourAgo) {
        return parsed.data
      }
    }
  } catch (error) {
    console.error("Error reading user profile data from localStorage:", error)
  }
  return null
}

// Función para guardar datos en localStorage
const saveUserDataToStorage = (data: UserProfileData) => {
  if (typeof window === 'undefined') return
  try {
    const storageData = {
      data,
      timestamp: Date.now()
    }
    localStorage.setItem("userProfileData", JSON.stringify(storageData))
  } catch (error) {
    console.error("Error saving user profile data to localStorage:", error)
  }
}

// Función para limpiar datos del localStorage
const clearUserDataFromStorage = () => {
  if (typeof window === 'undefined') return
  try {
    localStorage.removeItem("userProfileData")
  } catch (error) {
    console.error("Error clearing user profile data from localStorage:", error)
  }
}

export function UserProfileProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuthContext()
  const [userData, setUserData] = useState<UserProfileData | null>(getInitialUserData)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Función para cargar todos los datos del usuario en una sola operación
  const fetchUserProfile = useCallback(async () => {
    if (!user) return

    setLoading(true)
    setError(null)

    try {
      // Cargar todos los datos en paralelo para máxima velocidad
      const [profileResult, preferencesResult, subscriptionResult, usageResult] = await Promise.allSettled([
        // Perfil del usuario
        supabase
          .from("users")
          .select("*")
          .eq("id", user.id)
          .single(),
        
        // Preferencias del usuario
        supabase
          .from("user_preferences")
          .select("*")
          .eq("user_id", user.id)
          .single(),
        
        // Suscripción del usuario
        getUserSubscription(user.id),
        
        // Uso del usuario
        getUserUsage(user.id)
      ])

      // Procesar resultados
      const profile = profileResult.status === 'fulfilled' ? profileResult.value.data : null
      const preferences = preferencesResult.status === 'fulfilled' ? preferencesResult.value.data : null
      const subscription = subscriptionResult.status === 'fulfilled' ? subscriptionResult.value : null
      const usage = usageResult.status === 'fulfilled' ? usageResult.value : null

      // Determinar si es premium
      const isPremium = !!(subscription && 
        subscription.plan === "premium" && 
        (subscription.status === "active" || subscription.status === "trialing"))

      const accountType = isPremium ? "premium" : "free"

      // Normalizar preferencias
      const normalizedPreferences = preferences ? {
        ...preferences,
        dietary_preferences: preferences.dietary_preferences ?? [],
        excluded_ingredients: preferences.excluded_ingredients ?? [],
        allergies: preferences.allergies ?? [],
        intolerances: preferences.intolerances ?? [],
      } : null

      const newUserData: UserProfileData = {
        profile,
        preferences: normalizedPreferences,
        subscription,
        usage,
        isPremium,
        accountType
      }

      setUserData(newUserData)
      saveUserDataToStorage(newUserData)

    } catch (err) {
      console.error("Error fetching user profile:", err)
      setError(err instanceof Error ? err.message : "Failed to load user profile")
    } finally {
      setLoading(false)
    }
  }, [user])

  // Función para refrescar los datos manualmente
  const refreshUserProfile = useCallback(async () => {
    await fetchUserProfile()
  }, [fetchUserProfile])

  // Función para actualizar el perfil del usuario
  const updateUserProfile = useCallback(async (updates: Partial<UserProfile>) => {
    if (!user || !userData?.profile) return

    try {
      const { data, error } = await supabase
        .from("users")
        .update(updates)
        .eq("id", user.id)
        .select()
        .single()

      if (error) throw error

      const updatedUserData = {
        ...userData,
        profile: data
      }

      setUserData(updatedUserData)
      saveUserDataToStorage(updatedUserData)

    } catch (err) {
      console.error("Error updating user profile:", err)
      throw err
    }
  }, [user, userData])

  // Función para actualizar las preferencias del usuario
  const updateUserPreferences = useCallback(async (updates: Partial<UserPreferences>) => {
    if (!user || !userData?.preferences) return

    try {
      const { data, error } = await supabase
        .from("user_preferences")
        .update(updates)
        .eq("user_id", user.id)
        .select()
        .single()

      if (error) throw error

      const normalizedPreferences = {
        ...data,
        dietary_preferences: data.dietary_preferences ?? [],
        excluded_ingredients: data.excluded_ingredients ?? [],
        allergies: data.allergies ?? [],
        intolerances: data.intolerances ?? [],
      }

      const updatedUserData = {
        ...userData,
        preferences: normalizedPreferences
      }

      setUserData(updatedUserData)
      saveUserDataToStorage(updatedUserData)

    } catch (err) {
      console.error("Error updating user preferences:", err)
      throw err
    }
  }, [user, userData])

  // Efecto para cargar datos cuando el usuario cambia
  useEffect(() => {
    if (user) {
      // Si no tenemos datos o los datos son de otro usuario, cargar
      if (!userData || userData.profile?.id !== user.id) {
        fetchUserProfile()
      }
    } else {
      // Limpiar datos cuando no hay usuario
      setUserData(null)
      setError(null)
      clearUserDataFromStorage()
    }
  }, [user, userData?.profile?.id, fetchUserProfile])

  return (
    <UserProfileContext.Provider value={{
      userData,
      loading,
      error,
      fetchUserProfile,
      refreshUserProfile,
      updateUserProfile,
      updateUserPreferences
    }}>
      {children}
    </UserProfileContext.Provider>
  )
}

export function useUserProfile() {
  const context = useContext(UserProfileContext)
  if (context === undefined) {
    throw new Error("useUserProfile must be used within a UserProfileProvider")
  }
  return context
}

// Hook de conveniencia para verificar si el usuario es premium
export function useIsPremium() {
  const { userData } = useUserProfile()
  return userData?.isPremium ?? false
}

// Hook de conveniencia para obtener el tipo de cuenta
export function useAccountType() {
  const { userData } = useUserProfile()
  return userData?.accountType ?? "free"
}

// Hook de conveniencia para verificar acceso a características
export function useFeatureAccess(feature: string) {
  const { userData } = useUserProfile()
  
  if (!userData) return { canAccess: false, reason: "User not loaded" }
  
  // Usuarios premium tienen acceso completo
  if (userData.isPremium) {
    return { canAccess: true }
  }

  // Verificar límites para usuarios free
  const usage = userData.usage
  if (!usage) return { canAccess: false, reason: "Usage data not available" }

  switch (feature) {
    case "save_recipes":
      return {
        canAccess: usage.recipes.saved < usage.recipes.maxSaved,
        reason: usage.recipes.saved >= usage.recipes.maxSaved 
          ? `You've reached the limit of ${usage.recipes.maxSaved} saved recipes` 
          : undefined
      }
    case "create_meal_plans":
      return {
        canAccess: usage.mealPlans.created < usage.mealPlans.maxCreated,
        reason: usage.mealPlans.created >= usage.mealPlans.maxCreated 
          ? `You've reached the limit of ${usage.mealPlans.maxCreated} meal plans` 
          : undefined
      }
    case "create_custom_recipes":
      return {
        canAccess: usage.customRecipes.created < usage.customRecipes.maxCreated,
        reason: usage.customRecipes.created >= usage.customRecipes.maxCreated 
          ? `You've reached the limit of ${usage.customRecipes.maxCreated} custom recipes` 
          : undefined
      }
    case "export_meal_plans":
    case "priority_support":
    case "advanced_nutrition_analysis":
    case "unlimited_meal_plans":
    case "unlimited_custom_recipes":
    case "unlimited_saved_recipes":
    case "advanced_meal_planning":
    case "smart_grocery_lists":
      return {
        canAccess: false,
        reason: "This feature is available for Premium users only"
      }
    default:
      return { canAccess: true }
  }
} 