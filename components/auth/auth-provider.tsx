"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import { supabase } from "@/lib/supabase/client"
import type { User, Session, AuthError } from "@supabase/supabase-js"
import { authService } from "@/lib/services/auth-service" // Import the service
import { useRouter } from "next/navigation"

// Define a more specific type for the signup/signin response
interface AuthResponse {
  data: {
    user: User | null
    session: Session | null
  } | null // data can be null if there's a major issue before Supabase call
  error: AuthError | Error | null // Allow for general errors too
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

  useEffect(() => {
    const getInitialSession = async () => {
      try {
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession()
        if (error) {
          console.error("Error getting initial session:", error)
        }
        setUser(session?.user ?? null)
      } catch (error) {
        console.error("Error in getInitialSession:", error)
      } finally {
        setLoading(false)
      }
    }

    getInitialSession()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setUser(session?.user ?? null)
      setLoading(false) // Also set loading to false here
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const signIn = async (email: string, password: string): Promise<AuthResponse> => {
    setLoading(true)
    try {
      // Use the authService for consistency
      const response = await authService.signIn(email, password)
      // onAuthStateChange should handle setting the user if successful
      return response as AuthResponse // Cast to ensure type compatibility
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
      // Delegate to authService.signUp and return its response
      const response = await authService.signUp(email, password, fullName)
      // onAuthStateChange should handle setting the user if successful and email confirmation is off
      return response as AuthResponse // Cast to ensure type compatibility
    } catch (error) {
      // This catch might be redundant if authService.signUp already catches and returns an error structure
      console.error("Error signing up (AuthProvider):", error)
      return { data: null, error: error instanceof Error ? error : new Error("Sign up failed") }
    } finally {
      setLoading(false)
    }
  }

  const signOut = async (): Promise<void> => {
    setLoading(true)
    try {
      await authService.signOut()
      setUser(null) // Explicitly set user to null
    } catch (error) {
      console.error("Error signing out (AuthProvider):", error)
      // Optionally rethrow or handle
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    // Mostrar loader global y bloquear renderizado de hijos mientras loading sea true
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
      </div>
    );
  }

  return <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut }}>
    <AuthRedirector />
    {children}
  </AuthContext.Provider>
}

function AuthRedirector() {
  const router = useRouter();
  useEffect(() => {
    const { data: listener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_IN" && session?.user) {
        // Consultar si el usuario ya tiene perfil
        const { data } = await supabase
          .from("users")
          .select("id")
          .eq("id", session.user.id)
          .single();
        if (data) {
          router.push("/dashboard");
        } else {
          router.push("/onboarding");
        }
      }
    });
    return () => {
      listener?.subscription.unsubscribe();
    };
  }, [router]);
  return null;
}

export function useAuthContext() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuthContext must be used within an AuthProvider")
  }
  return context
}

export default AuthProvider
