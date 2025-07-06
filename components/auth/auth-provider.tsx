"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import { supabase } from "@/lib/supabase/client"
import type { User, Session, AuthError } from "@supabase/supabase-js"
import { authService } from "@/lib/services/auth-service"

// Define a more specific type for the signup/signin response
interface AuthResponse {
  data: {
    user: User | null
    session: Session | null
  } | null
  error: AuthError | Error | null
}

interface AuthContextType {
  user: User | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<AuthResponse>
  signUp: (email: string, password: string, fullName?: string) => Promise<AuthResponse>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [initialized, setInitialized] = useState(false)

  useEffect(() => {
    let mounted = true

    const initializeAuth = async () => {
      try {
        // 1. Obtener la sesión inicial
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error("Error getting initial session:", error)
        }

        if (mounted) {
        setUser(session?.user ?? null)
          setLoading(false)
          setInitialized(true)
        }
      } catch (error) {
        console.error("Error in initializeAuth:", error)
        if (mounted) {
          setUser(null)
        setLoading(false)
          setInitialized(true)
        }
      }
    }

    // 2. Configurar el listener de cambios de autenticación
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log("Auth state change:", event, session?.user?.id)

        if (mounted) {
      setUser(session?.user ?? null)
          
          // Solo cambiar loading a false si ya se inicializó
          if (initialized) {
            setLoading(false)
          }
        }
      }
    )

    // Inicializar autenticación
    initializeAuth()

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [initialized])

  const signIn = async (email: string, password: string): Promise<AuthResponse> => {
    setLoading(true)
    try {
      const response = await authService.signIn(email, password)
      return response as AuthResponse
    } catch (error) {
      console.error("Error signing in (AuthProvider):", error)
      return { data: null, error: error instanceof Error ? error : new Error("Sign in failed") }
    } finally {
      setLoading(false)
    }
  }

  const signUp = async (email: string, password: string, fullName?: string): Promise<AuthResponse> => {
    setLoading(true)
    try {
      const response = await authService.signUp(email, password, fullName)
      return response as AuthResponse
    } catch (error) {
      console.error("Error signing up (AuthProvider):", error)
      return { data: null, error: error instanceof Error ? error : new Error("Sign up failed") }
    } finally {
      setLoading(false)
    }
  }

  const signOut = async (): Promise<void> => {
    try {
      // Limpiar estado inmediatamente
      setUser(null)
      localStorage.removeItem("userPreferences")
      
      // Limpiar cualquier otro estado local
      if (typeof window !== 'undefined') {
        sessionStorage.clear()
      }
      
      // Hacer logout en Supabase
      await authService.signOut()
    } catch (error) {
      console.error("Error signing out (AuthProvider):", error)
      // Asegurar que el usuario se marque como null incluso si hay error
      setUser(null)
      localStorage.removeItem("userPreferences")
    }
  }

  // Mostrar loader global mientras se inicializa la autenticación
  if (!initialized || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Cargando NutriMate...</p>
          <p className="text-gray-400 text-sm mt-2">Inicializando sesión</p>
        </div>
      </div>
    )
  }

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuthContext() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuthContext must be used within an AuthProvider")
  }
  return context
}

export default AuthProvider
