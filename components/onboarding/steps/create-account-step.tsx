"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Check, Mail, Lock, User, Target, Activity, Heart } from "lucide-react"
import { supabase } from "@/lib/supabase/client"
import type { OnboardingData } from "@/lib/services/onboarding-service"

interface CreateAccountStepProps {
  data: Partial<OnboardingData>
  onChange: (data: Partial<OnboardingData>) => void
  onCreateAccount: () => void
  isLoading: boolean
}

export function CreateAccountStep({ data, onChange, onCreateAccount, isLoading }: CreateAccountStepProps) {
  const [authMethod, setAuthMethod] = useState<'email' | 'google'>('email')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordError, setPasswordError] = useState('')

  const handlePasswordChange = (value: string) => {
    setPassword(value)
    setPasswordError('')
    
    if (value && confirmPassword && value !== confirmPassword) {
      setPasswordError('Las contraseñas no coinciden')
    } else if (value && value.length < 6) {
      setPasswordError('La contraseña debe tener al menos 6 caracteres')
    }
  }

  const handleConfirmPasswordChange = (value: string) => {
    setConfirmPassword(value)
    setPasswordError('')
    
    if (password && value && password !== value) {
      setPasswordError('Las contraseñas no coinciden')
    }
  }

  const handleEmailPasswordSignUp = async () => {
    if (password !== confirmPassword) {
      setPasswordError('Las contraseñas no coinciden')
      return
    }
    
    if (password.length < 6) {
      setPasswordError('La contraseña debe tener al menos 6 caracteres')
      return
    }

    // Actualizar los datos con la contraseña y todos los datos actuales
    const updatedData = {
      ...data,
      password: password
    }
    
    // Actualizar el estado del onboarding con todos los datos
    onChange(updatedData)
    
    // Esperar un momento para que se actualice el estado
    setTimeout(() => {
      onCreateAccount()
    }, 100)
  }

  const handleGoogleSignUp = async () => {
    // Obtener los datos del onboarding actuales
    const onboardingData = {
      full_name: data.full_name,
      username: data.username,
      email: data.email,
      age: data.age,
      gender: data.gender,
      height: data.height,
      weight: data.weight,
      activity_level: data.activity_level,
      health_goal: data.health_goal,
      calorie_target: data.calorie_target,
      dietary_preferences: data.dietary_preferences,
      excluded_ingredients: data.excluded_ingredients,
      include_snacks: data.include_snacks,
      max_prep_time: data.max_prep_time,
      macro_priority: data.macro_priority,
      allergies: data.allergies,
      intolerances: data.intolerances
    }

    // Codificar los datos para pasarlos en la URL
    const encodedData = encodeURIComponent(JSON.stringify(onboardingData))
    const redirectUrl = `${window.location.origin}/auth/callback?onboarding=true&data=${encodedData}`

    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: redirectUrl
      }
    })

    if (error) {
      console.error('Error signing in with Google:', error)
    }
  }

  const isEmailPasswordValid = password && confirmPassword && password === confirmPassword && password.length >= 6

  return (
    <div className="space-y-6">
      {/* Resumen del plan */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5 text-orange-600" />
            Tu Plan Personalizado
          </CardTitle>
          <CardDescription>
            Revisa tu plan antes de crear tu cuenta
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium text-gray-500">Nombre</Label>
              <p className="text-lg font-semibold">{data.full_name}</p>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-500">Usuario</Label>
              <p className="text-lg font-semibold">@{data.username}</p>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-500">Email</Label>
              <p className="text-lg font-semibold">{data.email}</p>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-500">Edad</Label>
              <p className="text-lg font-semibold">{data.age} años</p>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-500">Género</Label>
              <p className="text-lg font-semibold capitalize">{data.gender}</p>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-500">Altura</Label>
              <p className="text-lg font-semibold">{data.height} cm</p>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-500">Peso</Label>
              <p className="text-lg font-semibold">{data.weight} kg</p>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-500">Nivel de actividad</Label>
              <p className="text-lg font-semibold capitalize">{data.activity_level}</p>
            </div>
          </div>
          
          <div>
            <Label className="text-sm font-medium text-gray-500">Objetivo de salud</Label>
            <p className="text-lg font-semibold capitalize">{data.health_goal}</p>
          </div>

          {data.dietary_preferences && data.dietary_preferences.length > 0 && (
            <div>
              <Label className="text-sm font-medium text-gray-500">Preferencias dietarias</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {data.dietary_preferences.map((pref, index) => (
                  <Badge key={index} variant="outline">{pref}</Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Método de autenticación */}
      <Card>
        <CardHeader>
          <CardTitle>Crear tu cuenta</CardTitle>
          <CardDescription>
            Elige cómo quieres acceder a tu cuenta
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Opciones de autenticación */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button
              variant={authMethod === 'email' ? 'default' : 'outline'}
              onClick={() => setAuthMethod('email')}
              className="h-auto p-4 flex flex-col items-center gap-2"
            >
              <Mail className="w-6 h-6" />
              <span className="font-medium">Email y contraseña</span>
              <span className="text-sm text-gray-500">Registro tradicional</span>
            </Button>

            <Button
              variant={authMethod === 'google' ? 'default' : 'outline'}
              onClick={() => setAuthMethod('google')}
              className="h-auto p-4 flex flex-col items-center gap-2"
            >
              <User className="w-6 h-6" />
              <span className="font-medium">Google</span>
              <span className="text-sm text-gray-500">Inicio rápido</span>
            </Button>
          </div>

          {/* Formulario de email/contraseña */}
          {authMethod === 'email' && (
            <div className="space-y-4">
              <Separator />
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="password">Contraseña</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => handlePasswordChange(e.target.value)}
                    placeholder="Mínimo 6 caracteres"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="confirmPassword">Confirmar contraseña</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => handleConfirmPasswordChange(e.target.value)}
                    placeholder="Repite tu contraseña"
                    className="mt-1"
                  />
                  {passwordError && (
                    <p className="text-sm text-red-600 mt-1">{passwordError}</p>
                  )}
                </div>
              </div>

              <Button
                onClick={handleEmailPasswordSignUp}
                disabled={!isEmailPasswordValid || isLoading}
                className="w-full bg-orange-600 hover:bg-orange-700"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    Creando cuenta...
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4 mr-2" />
                    Crear cuenta con email
                  </>
                )}
              </Button>
            </div>
          )}

          {/* Botón de Google */}
          {authMethod === 'google' && (
            <div className="space-y-4">
              <Separator />
              
              <Button
                onClick={handleGoogleSignUp}
                disabled={isLoading}
                className="w-full bg-orange-600 hover:bg-orange-700"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    Creando cuenta...
                  </>
                ) : (
                  <>
                    <User className="w-4 h-4 mr-2" />
                    Crear cuenta con Google
                  </>
                )}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Beneficios */}
      <Card className="bg-orange-50 border-orange-200">
        <CardContent className="pt-6">
          <h3 className="font-semibold text-orange-900 mb-4">¿Qué obtienes con tu cuenta?</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-3">
              <Target className="w-5 h-5 text-orange-600" />
              <span className="text-sm">Plan personalizado guardado</span>
            </div>
            <div className="flex items-center gap-3">
              <Activity className="w-5 h-5 text-orange-600" />
              <span className="text-sm">Seguimiento de progreso</span>
            </div>
            <div className="flex items-center gap-3">
              <Heart className="w-5 h-5 text-orange-600" />
              <span className="text-sm">Recetas recomendadas</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
