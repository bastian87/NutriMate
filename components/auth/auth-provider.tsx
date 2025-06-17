"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import { supabase } from "@/lib/supabase/client"
import type { User } from "@supabase/supabase-js"

interface AuthContextType {
  user: User | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, fullName?: string) => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession()
        if (error) {
          console.error("Error getting session:", error)
        } else {
          setUser(session?.user ?? null)
        }
      } catch (error) {
        console.error("Error in getInitialSession:", error)
      } finally {
        setLoading(false)
      }
    }

    getInitialSession()

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state changed:", event, session?.user?.email)
      setUser(session?.user ?? null)
      setLoading(false)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const signIn = async (email: string, password: string): Promise<void> => {
    try {
      setLoading(true)
      console.log("Attempting to sign in with email:", email)

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        console.error("Supabase auth error:", error)
        throw error
      }

      console.log("Sign in successful:", data.user?.email)
      setUser(data.user)
    } catch (error) {
      console.error("Error signing in:", error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const signUp = async (email: string, password: string, fullName?: string): Promise<void> => {
    try {
      console.log("Starting signUp process for:", email)

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      })

      if (error) {
        console.error("Supabase signup error:", error)
        throw error
      }

      console.log("Supabase signup successful:", {
        user: data.user?.email,
        needsConfirmation: !data.user?.email_confirmed_at,
      })

      // Don't set loading or user state here - let the auth state change handle it
      // Just resolve the promise to indicate success
      return Promise.resolve()
    } catch (error) {
      console.error("Error in signUp:", error)
      throw error
    }
  }

  const signOut = async (): Promise<void> => {
    try {
      setLoading(true)
      const { error } = await supabase.auth.signOut()
      if (error) {
        throw error
      }
      setUser(null)
    } catch (error) {
      console.error("Error signing out:", error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  return <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut }}>{children}</AuthContext.Provider>
}

export function useAuthContext() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuthContext must be used within an AuthProvider")
  }
  return context
}

// Also export as default for compatibility
export default AuthProvider
