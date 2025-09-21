import { supabase } from "@/lib/supabase/client"

export interface OnboardingData {
  // Datos básicos
  full_name: string
  username: string
  email: string
  password?: string // Solo para registro con email/password
  
  // Datos de salud
  age: number
  gender: string
  height: number
  weight: number
  activity_level: string
  health_goal: string
  calorie_target: number
  
  // Preferencias dietarias
  dietary_preferences: string[]
  excluded_ingredients: string[]
  include_snacks: boolean
  max_prep_time: number
  macro_priority: string
  allergies: string[]
  intolerances: string[]
}

export interface OnboardingStep {
  id: string
  title: string
  description: string
  component: string
  isRequired: boolean
}

class OnboardingService {
  private readonly STORAGE_KEY = 'nutrimate_onboarding_data'
  private readonly STEPS_KEY = 'nutrimate_onboarding_step'

  // Guardar datos de onboarding en localStorage
  saveOnboardingData(data: Partial<OnboardingData>): void {
    const existingData = this.getOnboardingData()
    const updatedData = { ...existingData, ...data }
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(updatedData))
    console.log("💾 Onboarding data saved:", updatedData)
  }

  // Obtener datos de onboarding desde localStorage
  getOnboardingData(): Partial<OnboardingData> {
    if (typeof window === 'undefined') return {}
    
    try {
      const data = localStorage.getItem(this.STORAGE_KEY)
      return data ? JSON.parse(data) : {}
    } catch (error) {
      console.error("Error loading onboarding data:", error)
      return {}
    }
  }

  // Limpiar datos de onboarding
  clearOnboardingData(): void {
    localStorage.removeItem(this.STORAGE_KEY)
    localStorage.removeItem(this.STEPS_KEY)
    console.log("🗑️ Onboarding data cleared")
  }

  // Guardar paso actual
  saveCurrentStep(step: string): void {
    localStorage.setItem(this.STEPS_KEY, step)
  }

  // Obtener paso actual
  getCurrentStep(): string {
    if (typeof window === 'undefined') return 'welcome'
    return localStorage.getItem(this.STEPS_KEY) || 'welcome'
  }

  // Validar si los datos están completos
  isOnboardingComplete(): boolean {
    const data = this.getOnboardingData()
    return !!(
      data.full_name &&
      data.username &&
      data.email &&
      data.age &&
      data.gender &&
      data.height &&
      data.weight &&
      data.activity_level &&
      data.health_goal
    )
  }

  // Crear cuenta y finalizar onboarding
  async createAccountAndFinalize(): Promise<{ success: boolean; error?: string; redirect?: boolean }> {
    try {
      const data = this.getOnboardingData()
      
      if (!this.isOnboardingComplete()) {
        return { success: false, error: "Onboarding data is incomplete" }
      }

      console.log("🚀 Starting account creation and finalization...")

      // 1. Crear cuenta de Supabase Auth
      let authResult
      if (data.password) {
        // Registro con email/password
        authResult = await supabase.auth.signUp({
          email: data.email!,
          password: data.password,
          options: {
            data: {
              full_name: data.full_name,
              username: data.username
            }
          }
        })
      } else {
        // OAuth (Google) - iniciar el flujo de OAuth
        const { error } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo: `${window.location.origin}/auth/callback?onboarding=true`
          }
        })
        
        if (error) {
          return { success: false, error: error.message }
        }
        
        // El usuario será redirigido, no continuamos aquí
        return { success: true, redirect: true }
      }

      if (authResult.error) {
        console.error("❌ Auth error:", authResult.error)
        return { success: false, error: authResult.error.message }
      }

      if (!authResult.data?.user) {
        return { success: false, error: "Failed to create user account" }
      }

      // 2. Finalizar perfil con los datos recolectados
      const finalizeResponse = await fetch('/api/profile/finalize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authResult.data.session?.access_token || ''}`
        },
        body: JSON.stringify({
          full_name: data.full_name,
          username: data.username,
          email: data.email,
          age: data.age,
          gender: data.gender,
          height: data.height,
          weight: data.weight,
          activity_level: data.activity_level,
          health_goal: data.health_goal,
          calorie_target: data.calorie_target || 2000,
          dietary_preferences: data.dietary_preferences || [],
          excluded_ingredients: data.excluded_ingredients || [],
          include_snacks: data.include_snacks || false,
          max_prep_time: data.max_prep_time || 60,
          macro_priority: data.macro_priority || 'balanced',
          allergies: data.allergies || [],
          intolerances: data.intolerances || []
        })
      })

      if (!finalizeResponse.ok) {
        const errorData = await finalizeResponse.json()
        console.error("❌ Finalize error:", errorData)
        return { success: false, error: errorData.message || "Failed to finalize profile" }
      }

      // 3. Limpiar datos de onboarding
      this.clearOnboardingData()

      console.log("✅ Account created and profile finalized successfully")
      return { success: true }

    } catch (error) {
      console.error("❌ Error in createAccountAndFinalize:", error)
      return { 
        success: false, 
        error: error instanceof Error ? error.message : "Unknown error occurred" 
      }
    }
  }

  // Obtener pasos del onboarding
  getOnboardingSteps(): OnboardingStep[] {
    return [
      {
        id: 'welcome',
        title: 'Welcome to NutriMate',
        description: 'Let\'s create your personalized nutrition plan',
        component: 'WelcomeStep',
        isRequired: true
      },
      {
        id: 'personal-info',
        title: 'Personal Information',
        description: 'Tell us about yourself',
        component: 'PersonalInfoStep',
        isRequired: true
      },
      {
        id: 'health-metrics',
        title: 'Health Metrics',
        description: 'Your basic health information',
        component: 'HealthMetricsStep',
        isRequired: true
      },
      {
        id: 'goals',
        title: 'Health Goals',
        description: 'What do you want to achieve?',
        component: 'GoalsStep',
        isRequired: true
      },
      {
        id: 'preferences',
        title: 'Dietary Preferences',
        description: 'Your food preferences and restrictions',
        component: 'PreferencesStep',
        isRequired: false
      },
      {
        id: 'create-account',
        title: 'Create Your Account',
        description: 'Save your personalized plan',
        component: 'CreateAccountStep',
        isRequired: true
      }
    ]
  }
}

export const onboardingService = new OnboardingService()
export default onboardingService
