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
    needsOnboarding?: boolean
  } | null
  error: AuthError | Error | null
}

interface AuthContextType {
  user: User | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<AuthResponse>
  signUp: (email: string, password: string, fullName?: string, username?: string) => Promise<AuthResponse>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function SimpleAuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [initialized, setInitialized] = useState(false)

  useEffect(() => {
    let mounted = true

    const initializeAuth = async () => {
      try {
        console.log("🚀 Initializing auth...")
        
        // Obtener la sesión inicial
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error("Error getting initial session:", error)
          
          // Si es un error de token de actualización, limpiar la sesión
          if (error.message?.includes("Invalid Refresh Token") || error.message?.includes("Refresh Token Not Found")) {
            console.log("🧹 Clearing invalid refresh token...")
            await supabase.auth.signOut()
            // Limpiar también el localStorage manualmente
            if (typeof window !== 'undefined') {
              localStorage.removeItem('sb-wlqsitedbkghsucxoyoc-auth-token')
              localStorage.removeItem('supabase.auth.token')
            }
          }
        }

        if (mounted) {
          console.log("📊 Initial session:", session?.user?.id || "No user")
          
          if (session?.user) {
            // Validar que el usuario realmente existe en la base de datos
            try {
              console.log("🔍 Validating user exists in database...")
              const { data: userProfile, error: profileError } = await supabase
                .from("users")
                .select("id")
                .eq("id", session.user.id)
                .maybeSingle()
              
              if (profileError || !userProfile) {
                // Verificar si estamos en una ruta de callback de OAuth o onboarding
                const isOAuthCallback = window.location.pathname === '/auth/callback'
                const isOnboarding = window.location.pathname === '/onboarding'
                const isDashboard = window.location.pathname === '/dashboard'
                
                console.log("🔍 User validation check:", {
                  profileError: profileError?.message,
                  userProfile: !!userProfile,
                  isOAuthCallback,
                  isOnboarding,
                  isDashboard,
                  currentPath: window.location.pathname
                })
                
                if (isOAuthCallback || isOnboarding) {
                  console.log("🔄 OAuth callback or onboarding detected, allowing user session...")
                  setUser(session.user)
                } else if (isDashboard) {
                  // En dashboard, si no hay perfil, permitir pero registrar el problema
                  console.log("⚠️ User in dashboard but no profile found, allowing session but may need onboarding")
                  setUser(session.user)
                } else {
                  console.log("❌ User not found in database, signing out")
                  await supabase.auth.signOut()
                  setUser(null)
                }
              } else {
                console.log("✅ User validated in database")
                setUser(session.user)
              }
            } catch (validationError) {
              console.error("❌ Error validating user:", validationError)
              // Si hay error validando, cerrar sesión por seguridad
              await supabase.auth.signOut()
              setUser(null)
            }
          } else {
            setUser(null)
          }
          
          // Solo actualizar el estado una vez al final
          setLoading(false)
          setInitialized(true)
          console.log("✅ Auth initialization complete")
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

    // Inicializar autenticación
    initializeAuth()

    return () => {
      mounted = false
    }
  }, [])

  // Listener de cambios de autenticación
  useEffect(() => {
    if (!initialized) return

    let mounted = true

    const subscription = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return

        console.log("🔄 Auth state change:", event, session?.user?.id || "No user")

        // Manejar eventos específicos
        if (event === 'SIGNED_OUT') {
          console.log("👤 User signed out")
          setUser(null)
          return
        }

        if (event === 'TOKEN_REFRESHED') {
          console.log("🔄 Token refreshed successfully")
          return
        }

        // Solo actualizar si el usuario realmente cambió
        const newUser = session?.user ?? null
        if (user?.id !== newUser?.id) {
          console.log("👤 Setting user:", newUser?.id || "No user")
          setUser(newUser)
        }
      }
    )

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [initialized, user?.id])

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

  const signUp = async (email: string, password: string, fullName?: string, username?: string): Promise<AuthResponse> => {
    setLoading(true)
    try {
      const response = await authService.signUp(email, password, fullName, username)
      
      // Si el signup fue exitoso y necesita onboarding, no establecer el usuario
      if (response.data?.needsOnboarding) {
        setUser(null)
        return response
      }
      
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
  if (!initialized) {
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

export default SimpleAuthProvider
