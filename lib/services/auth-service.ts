import { supabase } from "@/lib/supabase/client"
import type { User, Session, SignUpWithPasswordCredentials } from "@supabase/supabase-js"
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
}

interface AuthServiceResponse {
  data: AuthResponseData | null
  error: AuthError | Error | null
}

class AuthService {
  async signUp(email: string, password: string, fullName?: string, username?: string): Promise<AuthServiceResponse> {
    try {
      // En lugar de verificar si existe, simplemente almacenamos los datos temporalmente
      // La verificación real se hará cuando se complete el signup

      // Almacenar datos temporalmente
      const tempUserData = {
        email,
        password,
        fullName,
        username,
        timestamp: new Date().toISOString()
      }

      // Guardar en localStorage para usar después del onboarding
      localStorage.setItem('temp_user_data', JSON.stringify(tempUserData))

      // Retornar respuesta indicando que necesita onboarding
      return {
        data: {
          user: null,
          session: null,
          needsOnboarding: true
        },
        error: null
      }
    } catch (error) {
      console.error("Error in temporary signUp:", error)
      return {
        data: null,
        error: error instanceof Error ? error : new AuthError("El registro falló debido a un error inesperado.")
      }
    }
  }

  async completeSignUp(): Promise<AuthServiceResponse> {
    try {
      // Recuperar datos temporales
      const tempUserDataStr = localStorage.getItem('temp_user_data')
      if (!tempUserDataStr) {
        return {
          data: null,
          error: new Error("No hay datos de registro temporal")
        }
      }

      const tempUserData = JSON.parse(tempUserDataStr)
      const { email, password, fullName, username } = tempUserData

      // Primero intentar iniciar sesión
      console.log("🔐 Intentando iniciar sesión...")
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      let currentUser: User | null = null
      let currentSession: Session | null = null

      if (signInError?.message?.includes("Invalid login credentials")) {
        // Si el login falla porque las credenciales son inválidas, intentar crear el usuario
        console.log("🔐 Usuario no existe, creándolo...")
        const credentials: SignUpWithPasswordCredentials = { 
          email, 
          password,
          options: {
            data: { full_name: fullName }
          }
        }

        const { data: signUpData, error: signUpError } = await supabase.auth.signUp(credentials)

        if (signUpError) {
          console.error("❌ Error creating user:", signUpError)
          return { data: null, error: signUpError }
        }

        currentUser = signUpData?.user
        currentSession = signUpData?.session
      } else if (signInError) {
        // Si hay otro tipo de error en el login
        console.error("❌ Error en login:", signInError)
        return { data: null, error: signInError }
      } else {
        // Si el login fue exitoso
        console.log("✅ Login exitoso")
        currentUser = signInData?.user
        currentSession = signInData?.session
      }

      if (!currentUser) {
        return { 
          data: null, 
          error: new Error("La creación/autenticación del usuario falló: No se retornó objeto de usuario.") 
        }
      }

      // Asegurarnos de que estamos autenticados antes de crear el perfil
      const { data: { session: newSession }, error: sessionError } = await supabase.auth.getSession()
      
      if (sessionError || !newSession) {
        console.error("❌ Error getting session:", sessionError)
        return { data: null, error: new Error("Error getting session after signup") }
      }

      // Crear o actualizar el perfil del usuario
      const { error: profileError } = await this.createUserProfile(
        currentUser.id,
        email,
        fullName,
        username
      )

      if (profileError) {
        return { data: null, error: profileError }
      }

      // Limpiar datos temporales
      localStorage.removeItem('temp_user_data')

      return { 
        data: { 
          user: currentUser, 
          session: currentSession 
        }, 
        error: null 
      }
    } catch (error) {
      console.error("Error completing signUp:", error)
      return {
        data: null,
        error: error instanceof Error ? error : new AuthError("Error completando el registro")
      }
    }
  }

  async signIn(email: string, password: string): Promise<AuthServiceResponse> {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        return { data: null, error }
      }
      return { data: { user: data.user, session: data.session }, error: null }
    } catch (error) {
      console.error("Catch block error in authService.signIn:", error)
      return {
        data: null,
        error: error instanceof Error ? error : new AuthError("Sign in failed due to an unexpected error."),
      }
    }
  }

  async signOut(): Promise<{ error: AuthError | null }> {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      return { error: null }
    } catch (error) {
      return { error: error as AuthError }
    }
  }

  async getCurrentUser(): Promise<User | null> {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    return user
  }

  async getCurrentSession(): Promise<Session | null> {
    const {
      data: { session },
    } = await supabase.auth.getSession()
    return session
  }

  async updateUserPassword(newPassword: string): Promise<{ error: AuthError | null }> {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      })

      if (error) {
        console.error("Password update error:", error)
        return { error }
      }

      return { error: null }
    } catch (error) {
      console.error("Catch block error in updateUserPassword:", error)
      return {
        error: error instanceof AuthError ? error : new AuthError("Failed to update password"),
      }
    }
  }

  async createUserProfile(
    userId: string,
    email: string,
    fullName?: string,
    username?: string,
  ): Promise<{ data: UserProfile[] | null; error: Error | null }> {
    try {
      console.log("🔍 Checking if user profile already exists for:", userId)
      
      // Primero verificar si el usuario ya existe
      const { data: existingUser, error: checkError } = await supabase
        .from("users")
        .select("id, username, full_name")
        .eq("id", userId)
        .single()

      console.log("📊 Existing user check result:", { existingUser, checkError })

      if (existingUser && !checkError) {
        // El usuario ya existe, no es un error
        console.log("✅ User profile already exists:", existingUser)
        return { data: [existingUser as UserProfile], error: null }
      }

      console.log("👤 Creating new user profile...")
      const { data, error } = await supabase
        .from("users")
        .insert([{ id: userId, email, full_name: fullName, username }])
        .select()

      console.log("📊 Profile creation result:", { data, error })

      if (error) {
        // Si es un error de duplicación, no es realmente un error
        if (error.code === '23505' || error.message.includes('duplicate key')) {
          console.log("✅ User profile already exists (duplicate key)")
          return { data: null, error: null }
        }
        throw error
      }
      
      console.log("✅ User profile created successfully:", data)
      return { data, error: null }
    } catch (error) {
      console.error("❌ Error in createUserProfile:", error)
      return { data: null, error: error instanceof Error ? error : new Error("Failed to create user profile.") }
    }
  }

  async updateUserProfile(
    userId: string,
    updates: Partial<UserProfile>,
  ): Promise<{ data: UserProfile[] | null; error: Error | null }> {
    try {
      const { data, error } = await supabase.from("users").update(updates).eq("id", userId).select()
      if (error) throw error
      return { data, error: null }
    } catch (error) {
      return { data: null, error: error instanceof Error ? error : new Error("Failed to update user profile.") }
    }
  }

  async getUserProfile(userId: string): Promise<UserProfile | null> {
    const { data, error } = await supabase.from("users").select("*").eq("id", userId).maybeSingle()
    if (error) {
      console.error("Error getting user profile:", error)
      return null
    }
    return data
  }

  async createUserPreferences(
    userId: string,
    preferences: Omit<UserPreferences, "id" | "user_id" | "created_at" | "updated_at">,
  ) {
    try {
      const { data, error } = await supabase
        .from("user_preferences")
        .insert([{ ...preferences, user_id: userId }])
        .select()
      if (error) throw error
      return { data, error: null }
    } catch (error) {
      return { data: null, error }
    }
  }

  async updateUserPreferences(userId: string, updates: Partial<UserPreferences>) {
    try {
      const { data, error } = await supabase.from("user_preferences").update(updates).eq("user_id", userId).select()
      if (error) throw error
      return { data, error: null }
    } catch (error) {
      return { data: null, error }
    }
  }

  async getUserPreferences(userId: string): Promise<UserPreferences | null> {
    const { data, error } = await supabase.from("user_preferences").select("*").eq("user_id", userId).single()
    if (error) {
      // It's common for preferences not to exist initially, so don't log as a severe error unless it's unexpected.
      // console.error("Error getting user preferences:", error.message);
      return null
    }
    return data
  }

  onAuthStateChange(callback: (event: string, session: Session | null) => void) {
    return supabase.auth.onAuthStateChange(callback)
  }
}

export const authService = new AuthService()
export default authService
