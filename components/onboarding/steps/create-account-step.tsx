"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Check, Target, Activity, Heart, User, Mail } from "lucide-react"
import { supabase } from "@/lib/supabase/client"
import type { OnboardingData } from "@/lib/services/onboarding-service"

interface CreateAccountStepProps {
  data: Partial<OnboardingData>
  onChange: (data: Partial<OnboardingData>) => void
  onCreateAccount: () => void
  isLoading: boolean
  authError?: string
}

export function CreateAccountStep({ data, onCreateAccount, isLoading, authError }: CreateAccountStepProps) {


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
              <p className="text-lg font-semibold">{data.username}</p>
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

      {/* Crear cuenta */}
      <Card>
        <CardHeader>
          <CardTitle>Crear tu cuenta</CardTitle>
          <CardDescription>
            Tu cuenta será creada con los datos que proporcionaste. Podrás acceder tanto con email/contraseña como con Google.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {authError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-sm text-red-600">{authError}</p>
            </div>
          )}

          {/* Botón único para crear cuenta */}
          <Button
            onClick={onCreateAccount}
            disabled={isLoading}
            className="w-full bg-orange-600 hover:bg-orange-700 h-12"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                Creando cuenta...
              </>
            ) : (
              <>
                <Check className="w-4 h-4 mr-2" />
                Crear mi cuenta
              </>
            )}
          </Button>

          {/* Información sobre métodos de acceso */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 mb-2">🔐 Métodos de acceso</h4>
            <p className="text-sm text-blue-800">
              Después de crear tu cuenta, podrás acceder usando:
            </p>
            <ul className="text-sm text-blue-800 mt-2 space-y-1">
              <li>• <strong>Email y contraseña:</strong> {data.email}</li>
              <li>• <strong>Google:</strong> Con la misma cuenta de Google</li>
              <li>• <strong>Usuario:</strong> {data.username}</li>
            </ul>
          </div>
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