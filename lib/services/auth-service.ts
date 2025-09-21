import { supabase } from "@/lib/supabase/client"
import type { User, Session } from "@supabase/supabase-js"
import { AuthError } from "@supabase/supabase-js"

export interface UserProfile {
  id: string
  email: string
  full_name?: string
  username?: string
  avatar_url?: string
  created_at: string
  updated_at: string
}

export interface UserPreferences {
  id: string
  user_id: string
  age?: number
  gender?: string
  height?: number
  weight?: number
  activity_level?: "low" | "moderate" | "high"
  health_goal?: string
  calorie_target?: number
  dietary_preferences?: string[]
  excluded_ingredients?: string[]
  created_at: string
  updated_at: string
}

interface AuthResponseData {
  user: User | null
  session: Session | null
  needsOnboarding?: boolean
  needsEmailConfirmation?: boolean
}

interface AuthServiceResponse {
  data: AuthResponseData | null
  error: AuthError | Error | null
}

class AuthService {
  async signUp(email: string, password: string, fullName?: string, username?: string): Promise<AuthServiceResponse> {
    try {
      console.log("🔐 Starting user registration...")
      
      // Crear usuario en Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { 
            full_name: fullName, 
            username: username 
          }
        }
      })

      if (authError) {
        console.error("❌ Auth error:", authError)
        
        // Manejo específico para rate limits
        if (authError.message?.includes("Request rate limit reached") || authError.status === 429) {
          return { 
            data: null, 
            error: new AuthError("Demasiados intentos de registro. Por favor, espera unos minutos antes de intentar nuevamente.") 
          }
        }
        
        return { 
          data: null, 
          error: authError 
        }
      }

      // Si el usuario necesita confirmación de email
      if (authData.user && !authData.session) {
        console.log("📧 User needs email confirmation")
        return { 
          data: { 
            user: authData.user, 
            session: null, 
            needsEmailConfirmation: true 
          }, 
          error: null 
        }
      }

      // Si el usuario está autenticado (confirmación automática)
      if (authData.session?.user) {
        console.log("✅ User authenticated, needs onboarding")
        return { 
          data: { 
            user: authData.user, 
            session: authData.session, 
            needsOnboarding: true 
          }, 
          error: null 
        }
      }

      // Caso inesperado
      return { 
        data: null, 
        error: new AuthError("Error inesperado durante el registro") 
      }
    } catch (error) {
      console.error("❌ Error in signUp:", error)
      return {
        data: null,
        error: error instanceof Error ? error : new AuthError("Error inesperado durante el registro")
      }
    }
  }

  async signIn(email: string, password: string): Promise<AuthServiceResponse> {
    try {
      console.log("🔐 Starting user sign in...")
      
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (authError) {
        console.error("❌ Auth error:", authError)
        
        // Manejo específico para rate limits
        if (authError.message?.includes("Request rate limit reached") || authError.status === 429) {
          return { 
            data: null, 
            error: new AuthError("Demasiados intentos de inicio de sesión. Por favor, espera unos minutos antes de intentar nuevamente.") 
          }
        }
        
        return { 
          data: null, 
          error: authError 
        }
      }

      if (authData.session?.user) {
        console.log("✅ User signed in successfully")
        return { 
          data: { 
            user: authData.user, 
            session: authData.session 
          }, 
          error: null 
        }
      }

      return { 
        data: null, 
        error: new AuthError("Error inesperado durante el inicio de sesión") 
      }
    } catch (error) {
      console.error("❌ Error in signIn:", error)
      return {
        data: null,
        error: error instanceof Error ? error : new AuthError("Error inesperado durante el inicio de sesión")
      }
    }
  }

  async signOut(): Promise<{ error: AuthError | null }> {
    try {
      const { error } = await supabase.auth.signOut()
      return { error }
    } catch (error) {
      return { 
        error: error instanceof AuthError ? error : new AuthError("Error al cerrar sesión") 
      }
    }
  }

  async updateUserPassword(newPassword: string): Promise<{ error: AuthError | null }> {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      })
      return { error }
    } catch (error) {
      return { 
        error: error instanceof AuthError ? error : new AuthError("Error al actualizar contraseña") 
      }
    }
  }
}

export const authService = new AuthService()
export default authService