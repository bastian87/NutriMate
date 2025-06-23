"use client"

import { useState, useEffect } from "react"
import { authService } from "@/lib/services/auth-service"
import type { User } from "@supabase/supabase-js"

interface AuthContextType {
  user: User | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, name: string) => Promise<void>
  signOut: () => Promise<void>
}

// Create the hook as a named export
export const useAuth = (): AuthContextType => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState<boolean>(true)

  useEffect(() => {
    const loadUser = async () => {
      try {
        const fetchedUser = await authService.getCurrentUser()
        if (fetchedUser) {
          setUser(fetchedUser)
        }
      } catch (error) {
        setUser(null)
      } finally {
        setLoading(false)
      }
    }

    loadUser()
  }, [])

  const signIn = async (email: string, password: string) => {
    setLoading(true)
    try {
      const signedInUser = await authService.signIn(email, password)
      setUser(signedInUser.data?.user ?? null)
    } catch (error) {
      setUser(null)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const signUp = async (email: string, password: string, name: string) => {
    setLoading(true)
    try {
      const signedUpUser = await authService.signUp(email, password, name)
      setUser(signedUpUser.data?.user ?? null)
    } catch (error) {
      setUser(null)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const signOut = async () => {
    setLoading(true)
    try {
      await authService.signOut()
      setUser(null)
    } catch (error) {
      console.error("Sign out error:", error)
    } finally {
      setLoading(false)
    }
  }

  return { user, loading, signIn, signUp, signOut }
}

// Also keep the default export for backward compatibility
export default useAuth
